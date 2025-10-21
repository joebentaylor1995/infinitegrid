'use client';

// Imports
// ------------
import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useTheme } from 'styled-components';
import * as S from './styles';
import * as I from './interface';
import { DEFAULT_PROJECTS } from './dummyData';
import type { Theme } from '@theme/interface';

// Component
// ------------
const InfiniteGrid = ({ className, projects }: I.InfiniteGridProps) => {
	// Theme
	const theme = useTheme() as Theme;

	// Use provided projects or fallback to default
	const gridProjects = projects || DEFAULT_PROJECTS;

	// Refs
	const containerRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const animationFrameRef = useRef<number>(0);

	// State for settings
	const [settings, setSettings] = useState<I.Settings>({
		itemWidth: 400,
		itemHeight: 300,
		itemGap: 12,
		hoverScale: 1.05,
		expandedScale: 0.4,
		dragEase: 0.075,
		momentumFactor: 100,
		bufferZone: 3,
		borderRadius: 6,
		vignetteSize: 120,
		vignetteStrength: 0.7,
		overlayOpacity: 0.9,
		overlayEaseDuration: 0.8,
		zoomDuration: 0.6,
	});
	

	// State variables
	const canDrag = true;

	// Refs for state-like variables that don't trigger re-renders
	const columnsRef = useRef(4);
	const cellWidthRef = useRef(settings.itemWidth + settings.itemGap);
	const cellHeightRef = useRef(settings.itemHeight + settings.itemGap);
	const itemCountRef = useRef(gridProjects.length);

	const isDraggingRef = useRef(false);
	const startXRef = useRef(0);
	const startYRef = useRef(0);
	const targetXRef = useRef(0);
	const targetYRef = useRef(0);
	const currentXRef = useRef(0);
	const currentYRef = useRef(0);
	const dragVelocityXRef = useRef(0);
	const dragVelocityYRef = useRef(0);
	const lastDragTimeRef = useRef(0);
	const mouseHasMovedRef = useRef(false);
	const lastUpdateTimeRef = useRef(0);
	const lastXRef = useRef(0);
	const lastYRef = useRef(0);
	const visibleItemsRef = useRef<Set<string>>(new Set());

	// Update CSS variables
	const updateCSSVariables = useCallback((currentSettings: I.Settings) => {
		document.documentElement.style.setProperty(
			'--border-radius',
			`${currentSettings.borderRadius}px`
		);
		document.documentElement.style.setProperty(
			'--vignette-size',
			`${currentSettings.vignetteSize}px`
		);
		document.documentElement.style.setProperty(
			'--hover-scale',
			currentSettings.hoverScale.toString()
		);

		const strength = currentSettings.vignetteStrength;
		const size = currentSettings.vignetteSize;

		const regularOpacity = strength * 0.7;
		const regularSize = size * 1.5;
		document.documentElement.style.setProperty(
			'--page-vignette-size',
			`${regularSize}px`
		);
		document.documentElement.style.setProperty(
			'--page-vignette-color',
			`rgba(0,0,0,${regularOpacity})`
		);

		const strongOpacity = strength * 0.85;
		const strongSize = size * 0.75;
		document.documentElement.style.setProperty(
			'--page-vignette-strong-size',
			`${strongSize}px`
		);
		document.documentElement.style.setProperty(
			'--page-vignette-strong-color',
			`rgba(0,0,0,${strongOpacity})`
		);

		const extremeOpacity = strength;
		const extremeSize = size * 0.4;
		document.documentElement.style.setProperty(
			'--page-vignette-extreme-size',
			`${extremeSize}px`
		);
		document.documentElement.style.setProperty(
			'--page-vignette-extreme-color',
			`rgba(0,0,0,${extremeOpacity})`
		);
	}, []);

	// Helper functions
	const getItemSize = useCallback((): I.ItemSize => {
		return {
			width: settings.itemWidth,
			height: settings.itemHeight,
		};
	}, [settings.itemWidth, settings.itemHeight]);

	const getItemId = useCallback((col: number, row: number): string => {
		return `${col},${row}`;
	}, []);

	const getItemPosition = useCallback((col: number, row: number) => {
		const xPos = col * cellWidthRef.current;
		const yPos = row * cellHeightRef.current;
		return { x: xPos, y: yPos };
	}, []);

	const updateVisibleItems = useCallback(() => {
		if (!canvasRef.current) return;

		const buffer = settings.bufferZone;
		const viewWidth = window.innerWidth * (1 + buffer);
		const viewHeight = window.innerHeight * (1 + buffer);

		const startCol = Math.floor(
			(-currentXRef.current - viewWidth / 2) / cellWidthRef.current
		);
		const endCol = Math.ceil(
			(-currentXRef.current + viewWidth * 1.5) / cellWidthRef.current
		);
		const startRow = Math.floor(
			(-currentYRef.current - viewHeight / 2) / cellHeightRef.current
		);
		const endRow = Math.ceil(
			(-currentYRef.current + viewHeight * 1.5) / cellHeightRef.current
		);

		const currentItems = new Set<string>();

		for (let row = startRow; row <= endRow; row++) {
			for (let col = startCol; col <= endCol; col++) {
				const itemId = getItemId(col, row);
				currentItems.add(itemId);

				if (visibleItemsRef.current.has(itemId)) continue;

				const itemSize = getItemSize();
				const position = getItemPosition(col, row);

				const itemNum = Math.abs(
					(row * columnsRef.current + col) % itemCountRef.current
				);
				const project = gridProjects[itemNum];

				const item = document.createElement('div');
				item.className = 'item';
				item.id = itemId;
				item.style.cssText = `
					position: absolute;
					overflow: hidden;
					background-color: ${theme.colors.global.black[100]};
					border-radius: var(--border-radius, ${theme.br.s});
					width: ${itemSize.width}px;
					height: ${itemSize.height}px;
					left: ${position.x}px;
					top: ${position.y}px;
				`;

				const imageContainer = document.createElement('div');
				imageContainer.className = 'item-image-container';
				imageContainer.style.cssText = `
					width: 100%;
					height: 100%;
					overflow: hidden;
					position: relative;
				`;

				const vignette = document.createElement('div');
				vignette.style.cssText = `
					content: '';
					position: absolute;
					inset: 0;
					pointer-events: none;
					box-shadow: inset 0 0 var(--vignette-size, 0px) ${theme.colors.global.black[50]};
					z-index: 1;
				`;
				imageContainer.appendChild(vignette);

				const img = document.createElement('img');
				img.src = project.imageUrl;
				img.alt = project.title;
				img.style.cssText = `
					width: 100%;
					height: 100%;
					object-fit: cover;
					pointer-events: none;
					transition: transform 0.3s ease;
				`;
				imageContainer.appendChild(img);

				// Grayscale overlay layer using mix-blend-mode for performance
				const grayscaleLayer = document.createElement('div');
				grayscaleLayer.className = 'grayscale-layer';
				grayscaleLayer.style.cssText = `
					position: absolute;
					inset: 0;
					background-color: ${theme.colors.global.black[100]};
					mix-blend-mode: saturation;
					opacity: 1;
					pointer-events: none;
					z-index: 2;
				`;
				imageContainer.appendChild(grayscaleLayer);

				item.appendChild(imageContainer);

				item.addEventListener('mouseenter', () => {
					if (!isDraggingRef.current) {
						gsap.to(img, {
							scale: settings.hoverScale,
							duration: 0.3,
							ease: 'power2.out',
						});
						gsap.to(grayscaleLayer, {
							opacity: 0,
							duration: 0.3,
							ease: 'power2.out',
						});
					}
				});

				item.addEventListener('mouseleave', () => {
					gsap.to(img, {
						scale: 1,
						duration: 0.3,
						ease: 'power2.out',
					});
					gsap.to(grayscaleLayer, {
						opacity: 1,
						duration: 0.3,
						ease: 'power2.out',
					});
				});

				const captionElement = document.createElement('div');
				captionElement.className = 'item-caption';
				captionElement.style.cssText = `
					position: absolute;
					bottom: 0;
					left: 0;
					width: 100%;
					padding: 10px;
					z-index: 2;
				`;

				const nameElement = document.createElement('div');
				nameElement.className = 'item-name';
				nameElement.textContent = project.title;
				nameElement.style.cssText = `
					font-family: ${theme.font.family.body};
					color: ${theme.colors.global.white[100]};
					font-size: 12px;
					font-weight: 500;
					text-transform: uppercase;
					letter-spacing: -0.03em;
					margin-bottom: 2px;
					position: relative;
					overflow: hidden;
					height: 16px;
				`;
				captionElement.appendChild(nameElement);

				const numberElement = document.createElement('div');
				numberElement.className = 'item-number';
				numberElement.textContent = project.category;
				numberElement.style.cssText = `
					font-family: ${theme.font.family.mono};
					color: ${theme.colors.global.white[50]};
					font-size: 10px;
					font-weight: 400;
					position: relative;
					overflow: hidden;
					height: 14px;
				`;
				captionElement.appendChild(numberElement);
				item.appendChild(captionElement);

				canvasRef.current!.appendChild(item);
				visibleItemsRef.current.add(itemId);
			}
		}

		visibleItemsRef.current.forEach(itemId => {
			if (!currentItems.has(itemId)) {
				const item = document.getElementById(itemId);
				if (item && item.parentNode === canvasRef.current) {
					canvasRef.current!.removeChild(item);
				}
				visibleItemsRef.current.delete(itemId);
			}
		});
	}, [settings.bufferZone, settings.hoverScale, getItemId, getItemSize, getItemPosition]);

	// Animation loop
	useEffect(() => {
		const animate = () => {
			if (canDrag && canvasRef.current) {
				const ease = settings.dragEase;
				currentXRef.current +=
					(targetXRef.current - currentXRef.current) * ease;
				currentYRef.current +=
					(targetYRef.current - currentYRef.current) * ease;

				canvasRef.current.style.transform = `translate(${currentXRef.current}px, ${currentYRef.current}px)`;

				const now = Date.now();
				const distMoved = Math.sqrt(
					Math.pow(currentXRef.current - lastXRef.current, 2) +
						Math.pow(currentYRef.current - lastYRef.current, 2)
				);

				if (distMoved > 100 || now - lastUpdateTimeRef.current > 120) {
					updateVisibleItems();
					lastXRef.current = currentXRef.current;
					lastYRef.current = currentYRef.current;
					lastUpdateTimeRef.current = now;
				}
			}

			animationFrameRef.current = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [canDrag, settings.dragEase, updateVisibleItems]);

	// Mouse/Touch event handlers
	useEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			if (!canDrag) return;
			isDraggingRef.current = true;
			mouseHasMovedRef.current = false;
			startXRef.current = e.clientX;
			startYRef.current = e.clientY;

			// Force all grayscale layers to full opacity when dragging starts
			document.querySelectorAll('.grayscale-layer').forEach(layer => {
				gsap.to(layer, {
					opacity: 1,
					duration: 0.2,
					ease: 'power2.out',
					overwrite: true,
				});
			});
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDraggingRef.current || !canDrag) return;

			const dx = e.clientX - startXRef.current;
			const dy = e.clientY - startYRef.current;

			if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
				mouseHasMovedRef.current = true;
			}

			const now = Date.now();
			const dt = Math.max(10, now - lastDragTimeRef.current);
			lastDragTimeRef.current = now;

			dragVelocityXRef.current = dx / dt;
			dragVelocityYRef.current = dy / dt;

			targetXRef.current += dx;
			targetYRef.current += dy;

			startXRef.current = e.clientX;
			startYRef.current = e.clientY;
		};

		const handleMouseUp = () => {
			if (!isDraggingRef.current) return;
			isDraggingRef.current = false;

			if (canDrag) {
				if (
					Math.abs(dragVelocityXRef.current) > 0.1 ||
					Math.abs(dragVelocityYRef.current) > 0.1
				) {
					const momentumFactor = settings.momentumFactor;
					targetXRef.current += dragVelocityXRef.current * momentumFactor;
					targetYRef.current += dragVelocityYRef.current * momentumFactor;
				}
			}

			// Ensure all images are at scale 1 after dragging
			document.querySelectorAll('.item img').forEach(img => {
				gsap.set(img, { scale: 1, clearProps: 'transform' });
			});
		};

		const handleWheel = (e: WheelEvent) => {
			if (!canDrag) return;
			e.preventDefault();
			
			// Update target positions based on wheel delta
			targetXRef.current -= e.deltaX;
			targetYRef.current -= e.deltaY;
		};

		const handleTouchStart = (e: TouchEvent) => {
			if (!canDrag) return;
			isDraggingRef.current = true;
			mouseHasMovedRef.current = false;
			startXRef.current = e.touches[0].clientX;
			startYRef.current = e.touches[0].clientY;

			// Force all grayscale layers to full opacity when dragging starts
			document.querySelectorAll('.grayscale-layer').forEach(layer => {
				gsap.to(layer, {
					opacity: 1,
					duration: 0.2,
					ease: 'power2.out',
					overwrite: true,
				});
			});
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (!isDraggingRef.current || !canDrag) return;

			const dx = e.touches[0].clientX - startXRef.current;
			const dy = e.touches[0].clientY - startYRef.current;

			if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
				mouseHasMovedRef.current = true;
			}

			targetXRef.current += dx;
			targetYRef.current += dy;

			startXRef.current = e.touches[0].clientX;
			startYRef.current = e.touches[0].clientY;
		};

		const handleTouchEnd = () => {
			isDraggingRef.current = false;

			// Ensure all images are at scale 1 after dragging
			document.querySelectorAll('.item img').forEach(img => {
				gsap.set(img, { scale: 1, clearProps: 'transform' });
			});
		};

		const container = containerRef.current;
		if (container) {
			container.addEventListener('mousedown', handleMouseDown);
			container.addEventListener('wheel', handleWheel, { passive: false });
		}
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		window.addEventListener('touchstart', handleTouchStart);
		window.addEventListener('touchmove', handleTouchMove);
		window.addEventListener('touchend', handleTouchEnd);

		return () => {
			if (container) {
				container.removeEventListener('mousedown', handleMouseDown);
				container.removeEventListener('wheel', handleWheel);
			}
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			window.removeEventListener('touchstart', handleTouchStart);
			window.removeEventListener('touchmove', handleTouchMove);
			window.removeEventListener('touchend', handleTouchEnd);
		};
	}, [canDrag, settings.momentumFactor]);

	// Resize handler
	useEffect(() => {
		const handleResize = () => {
			updateVisibleItems();
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [updateVisibleItems]);

	// Update refs and CSS when settings change
	useEffect(() => {
		columnsRef.current = 4;
		cellWidthRef.current = settings.itemWidth + settings.itemGap;
		cellHeightRef.current = settings.itemHeight + settings.itemGap;

		updateCSSVariables(settings);

		// Clear and rebuild items
		if (canvasRef.current) {
			visibleItemsRef.current.forEach(itemId => {
				const item = document.getElementById(itemId);
				if (item && item.parentNode === canvasRef.current) {
					canvasRef.current!.removeChild(item);
				}
			});
			visibleItemsRef.current.clear();
			updateVisibleItems();
		}
	}, [settings, updateCSSVariables, updateVisibleItems]);

	// Update item count when projects change
	useEffect(() => {
		itemCountRef.current = gridProjects.length;
		
		// Clear and rebuild when projects change
		if (canvasRef.current) {
			visibleItemsRef.current.forEach(itemId => {
				const item = document.getElementById(itemId);
				if (item && item.parentNode === canvasRef.current) {
					canvasRef.current!.removeChild(item);
				}
			});
			visibleItemsRef.current.clear();
			updateVisibleItems();
		}
	}, [gridProjects, updateVisibleItems]);

	// Initialize
	useEffect(() => {
		updateCSSVariables(settings);
		updateVisibleItems();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<S.Jacket className={className}>
			<S.NoiseOverlay />

			<S.Container ref={containerRef} $canDrag={canDrag}>
				<S.Canvas ref={canvasRef} />
			</S.Container>

			<S.PageVignetteContainer>
				<S.PageVignette />
				<S.PageVignetteStrong />
				<S.PageVignetteExtreme />
			</S.PageVignetteContainer>
		</S.Jacket>
	);
};

// Exports
// ------------
InfiniteGrid.displayName = 'InfiniteGrid';
export default InfiniteGrid;

