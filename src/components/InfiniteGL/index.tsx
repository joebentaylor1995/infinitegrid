'use client';

// Imports
// ------------
import * as THREE from 'three';
import gsap from 'gsap';
import { theme } from '@theme';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { dummyData } from './dummyData';
import { Observer } from 'gsap/Observer';
import { Text } from 'troika-three-text';
import { vertexTexture, fragmentTexture, vertexPost, fragmentPost } from './shaders';

// Styles
// ------------
import * as S from './styles';

// Interfaces
// ------------
import { InfiniteGLProps, ProjectPlaneData } from './interface';

// Constants
// ------------
// Responsive breakpoint
const MOBILE_BREAKPOINT = 768;

// CRT static noise intensity (0.0 = no noise, 0.05 = subtle, 0.1 = heavy)
const NOISE_INTENSITY = 0.05;

// Vignette settings
const VIGNETTE_INTENSITY = 0.25; // How dark the edges get (0.0 = no vignette, 1.0 = fully dark)
const VIGNETTE_POWER = 1.5; // Falloff curve (1.0 = linear, higher = more abrupt)

// Image vignette settings (less intense than global vignette)
const IMAGE_VIGNETTE_INTENSITY = 0.15; // Subtle vignette on each image
const IMAGE_VIGNETTE_POWER = 0.4; // Falloff curve for image vignette

// Helper to get responsive grid layout
const getGridLayout = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
    
    if (isMobile) {
        // Mobile: Fixed width cards
        const PLANE_WIDTH = 320;
        const PLANE_HEIGHT = PLANE_WIDTH * (3 / 4); // Maintain 4:3 aspect ratio (240px)
        return {
            PLANE_WIDTH,
            PLANE_HEIGHT,
            COLS: 2,
            GAP: 12,
            PADDING: 6,
        };
    } else {
        // Desktop: Fixed size cards
        const PLANE_WIDTH = 400;
        const PLANE_HEIGHT = PLANE_WIDTH * (3 / 4); // Maintain 4:3 aspect ratio (300px)
        return {
            PLANE_WIDTH,
            PLANE_HEIGHT,
            COLS: 5,
            GAP: 12,
            PADDING: 6,
        };
    }
};

// Grid Layout - will be recalculated on mount and resize
let PLANE_WIDTH = 400;
let PLANE_HEIGHT = 300;
let COLS = 5;
let GAP = 12;
let PADDING = GAP / 2;

// Distortion - responsive values
const getDistortionSettings = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT;
    
    if (isMobile) {
        return {
            STARTING_DISTORTION: -0.5,
            BASE_DISTORTION: 0,
            DISTORTION_AMOUNT: -0.25, // Reduced for mobile
            MAX_DISTORTION: -0.2, // Reduced for mobile
            VELOCITY_SCALE: 0.005, // Reduced sensitivity for mobile
            LOAD_IN_DURATION: 0.75,
            ANIMATION_DURATION: 0.35, // Near-instant for native feel
            DRAG_MULTIPLIER: 2, // Maximum direct response for native feel
            LONG_PRESS_THRESHOLD: 300, // Faster tap detection for mobile
        };
    } else {
        return {
            STARTING_DISTORTION: -0.5,
            BASE_DISTORTION: 0,
            DISTORTION_AMOUNT: -0.5,
            MAX_DISTORTION: -0.5,
            VELOCITY_SCALE: 0.0025,
            LOAD_IN_DURATION: 1.2,
            ANIMATION_DURATION: 1.5, // Smooth desktop experience
            DRAG_MULTIPLIER: 2,
            LONG_PRESS_THRESHOLD: 500,
        };
    }
};

// Distortion - will be updated on mount
let STARTING_DISTORTION = -0.5;
let BASE_DISTORTION = 0;
let DISTORTION_AMOUNT = -0.5;
let MAX_DISTORTION = -0.5;
let VELOCITY_SCALE = 0.010;
let LOAD_IN_DURATION = 1.2;
let ANIMATION_DURATION = 1.5;
let DRAG_MULTIPLIER = 2;
let LONG_PRESS_THRESHOLD = 500;

// Animation
const ANIMATION_EASE = "power4";
const DISTORTION_PRESS_DURATION = 0.4;
const DISTORTION_RELEASE_DURATION = 0.6;
const DISTORTION_SCROLL_DURATION = 0.3;
const DISTORTION_RESET_DURATION = 0.5;
const SCROLL_STOP_DELAY = 150;

// Interaction
const DRAG_MINIMUM = 5;
const HOVER_SCALE = 1.05; // Image zoom on hover (1.0 = no zoom, 1.1 = 10% zoom)
const HOVER_DURATION = 0.4; // Hover animation duration in seconds

// Helper Functions
// ------------
/** Calculate grid dimensions based on data length */
const calculateGridDimensions = (dataLength: number) => {
    const rows = Math.ceil(dataLength / COLS);
    const contentWidth = PADDING * 2 + COLS * PLANE_WIDTH + (COLS - 1) * GAP;
    const contentHeight = PADDING * 2 + rows * PLANE_HEIGHT + (rows - 1) * GAP;
    return { rows, contentWidth, contentHeight };
};

/** Animate distortion strength smoothly */
const animateDistortion = (targetRef: React.RefObject<number>, value: number, duration: number, ease: string, onComplete?: () => void) => {
    gsap.to(targetRef, {
        current: value,
        duration,
        ease,
        onComplete,
    });
};

/**
 * Load texture with caching
 * - Checks cache first
 * - Prevents duplicate loads for same URL
 * - Returns promise that resolves with cached or newly loaded texture
 */
const loadTextureWithCache = (
    url: string,
    textureLoader: THREE.TextureLoader,
    cache: Map<string, THREE.Texture>,
    loadingPromises: Map<string, Promise<THREE.Texture>>
): Promise<THREE.Texture> => {
    // Return cached texture if available
    if (cache.has(url)) {
        return Promise.resolve(cache.get(url)!);
    }

    // Return existing loading promise if texture is currently being loaded
    if (loadingPromises.has(url)) {
        return loadingPromises.get(url)!;
    }

    // Create new loading promise
    const loadingPromise = new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(
            url,
            (texture) => {
                // Configure texture
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                
                // Store in cache
                cache.set(url, texture);
                
                // Remove from loading promises
                loadingPromises.delete(url);
                
                resolve(texture);
            },
            undefined,
            (error) => {
                // Remove from loading promises on error
                loadingPromises.delete(url);
                reject(error);
            }
        );
    });

    // Store loading promise to prevent duplicate loads
    loadingPromises.set(url, loadingPromise);

    return loadingPromise;
};

// Component
// ------------
const InfiniteGL = ({ infiniteData, hasClip = true }: InfiniteGLProps) => {
    // Router
    const router = useRouter();

    // Data
    const data = infiniteData || dummyData;

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const projectPlanesRef = useRef<ProjectPlaneData[]>([]);
    const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const allTexturesLoadedRef = useRef(false);

    // Texture caching
    const textureCacheRef = useRef<Map<string, THREE.Texture>>(new Map());
    const textureLoadingRef = useRef<Map<string, Promise<THREE.Texture>>>(new Map());

    // Animation refs
    const distortionStrengthRef = useRef(-0.5); // Start with STARTING_DISTORTION
    const targetDistortionRef = useRef(-0.5); // Start with STARTING_DISTORTION
    const hoveredMeshRef = useRef<THREE.Mesh | null>(null);
    const isDraggingRef = useRef(false);

    // Main Three.js setup
    useEffect(() => {
        if (!canvasRef.current) return;

        // Update grid layout based on viewport size
        const layout = getGridLayout();
        PLANE_WIDTH = layout.PLANE_WIDTH;
        PLANE_HEIGHT = layout.PLANE_HEIGHT;
        COLS = layout.COLS;
        GAP = layout.GAP;
        PADDING = layout.PADDING;

        // Update distortion settings based on viewport size
        const distortionSettings = getDistortionSettings();
        STARTING_DISTORTION = distortionSettings.STARTING_DISTORTION;
        BASE_DISTORTION = distortionSettings.BASE_DISTORTION;
        DISTORTION_AMOUNT = distortionSettings.DISTORTION_AMOUNT;
        MAX_DISTORTION = distortionSettings.MAX_DISTORTION;
        VELOCITY_SCALE = distortionSettings.VELOCITY_SCALE;
        LOAD_IN_DURATION = distortionSettings.LOAD_IN_DURATION;
        ANIMATION_DURATION = distortionSettings.ANIMATION_DURATION;
        DRAG_MULTIPLIER = distortionSettings.DRAG_MULTIPLIER;
        LONG_PRESS_THRESHOLD = distortionSettings.LONG_PRESS_THRESHOLD;

        // Initialize distortion refs to STARTING_DISTORTION
        distortionStrengthRef.current = STARTING_DISTORTION;
        targetDistortionRef.current = STARTING_DISTORTION;

        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'none';
        document.body.style.touchAction = 'none'; // Prevent browser gestures on mobile
        
        
        // Prevent pull-to-refresh and swipe navigation on mobile
        const preventTouchDefaults = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                e.preventDefault(); // Prevent pinch zoom
            }
        };
        
        document.addEventListener('touchstart', preventTouchDefaults, { passive: false });
        document.addEventListener('touchmove', preventTouchDefaults, { passive: false });
        
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneRef.current = scene;

        // Camera setup (orthographic for 2D-like view)
        const aspect = window.innerWidth / window.innerHeight;
        const frustumSize = window.innerHeight;
        const camera = new THREE.OrthographicCamera(
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            1000
        );
        camera.position.z = 10;
        cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            antialias: true,
            alpha: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        rendererRef.current = renderer;

        // Texture loader
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin('anonymous');

        // Create planes
        const projectPlanes: ProjectPlaneData[] = [];

        // Track texture loading
        const totalTextures = 4 * data.length; // 4 duplicates * data length
        let loadedTextures = 0;

        const checkAllTexturesLoaded = () => {
            loadedTextures++;
            if (loadedTextures === totalTextures) {
                allTexturesLoadedRef.current = true;
            }
        };

        // Calculate Content block size (with CSS grid gap behavior)
        // CSS grid gap only goes BETWEEN items, not on edges, but we have padding on edges
        const { rows, contentWidth, contentHeight } = calculateGridDimensions(data.length);

        // Container is 2x2 of Content blocks
        for (let duplicateIndex = 0; duplicateIndex < 4; duplicateIndex++) {
            const dupCol = duplicateIndex % 2;
            const dupRow = Math.floor(duplicateIndex / 2);
            const duplicateOffsetX = dupCol * contentWidth - contentWidth;
            const duplicateOffsetY = -(dupRow * contentHeight - contentHeight);

            data.forEach((project, projectIndex) => {
                const itemCol = projectIndex % COLS;
                const itemRow = Math.floor(projectIndex / COLS);
                
                // Position with padding and gaps between items
                const x = PADDING + itemCol * (PLANE_WIDTH + GAP) + PLANE_WIDTH / 2 + duplicateOffsetX;
                const y = -(PADDING + itemRow * (PLANE_HEIGHT + GAP) + PLANE_HEIGHT / 2) + duplicateOffsetY;

                // Create geometry
                const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, 32, 32);

                // Create shader material (without distortion)
                const material = new THREE.ShaderMaterial({
                    uniforms: {
                        uTexture: { value: null },
                        uAlpha: { value: 0 },
                        uGrayscale: { value: 1.0 }, // Start grayscale
                        uOverlayOpacity: { value: 0.2 }, // 20% black overlay
                        uResolution: { value: new THREE.Vector2(PLANE_WIDTH, PLANE_HEIGHT) },
                        uBorderRadius: { value: 6.0 }, // 6px border radius
                        uScale: { value: 1.0 }, // Image scale (1.0 = normal)
                        uImageVignetteIntensity: { value: IMAGE_VIGNETTE_INTENSITY },
                        uImageVignettePower: { value: IMAGE_VIGNETTE_POWER },
                    },
                    vertexShader: vertexTexture,
                    fragmentShader: fragmentTexture,
                    transparent: true,
                    side: THREE.DoubleSide,
                });

                // Load texture with caching
                const imageSrc = typeof project.image === 'string' ? project.image : project.image.src;
                loadTextureWithCache(imageSrc, textureLoader, textureCacheRef.current, textureLoadingRef.current)
                    .then((texture) => {
                        material.uniforms.uTexture.value = texture;
                        material.needsUpdate = true;
                        checkAllTexturesLoaded();
                    })
                    .catch((error) => {
                        console.error('Error loading texture:', error);
                        checkAllTexturesLoaded(); // Count even if error to prevent hanging
                    });

                // Create image mesh
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x, y, 0);

                // Store metadata
                const userData = {
                    href: project.href,
                    title: project.title,
                    tags: project.tags,
                    duplicateIndex,
                    projectIndex,
                };
                mesh.userData = userData;

                scene.add(mesh);
                projectPlanes.push({ mesh, material, userData });

                // Create SDF text for title
                const titleText = new Text();
                titleText.text = project.title.toUpperCase();
                titleText.fontSize = 12;
                titleText.font = '/fonts/sequel-85.ttf';
                titleText.color = 0xFFFFFF;
                titleText.anchorX = 'left';
                titleText.anchorY = 'bottom';
                titleText.letterSpacing = 0.072; // 6% at 12px font size
                titleText.maxWidth = PLANE_WIDTH - 24; // Account for padding
                titleText.outlineWidth = 0;
                titleText.depthOffset = -1; // Render in front
                titleText.sdfGlyphSize = 128; // Higher resolution SDF (default is 64, can go to 128)
                titleText.gpuAccelerateSDF = true; // Use GPU for better performance
                titleText.curveRadius = 0; // Sharp corners for crisp text
                titleText.lineHeight = 1.2; // 120% line height
                
                // Position text at bottom left of plane
                const textPadding = 18;
                const titleFontSize = 12;
                const tagsFontSize = 10;
                const textGap = 6; // Vertical gap (in px) between tags and project title text (used for layout)
                
                // Start from bottom of plane
                const bottomY = y - PLANE_HEIGHT / 2;
                const titleBottomY = bottomY + textPadding + tagsFontSize + textGap; // Title above tags
                
                const textX = x - PLANE_WIDTH / 2 + textPadding; // Left of plane + padding
                titleText.position.set(textX, titleBottomY, 1);
                
                // Set opacity to 0 for fade-in
                titleText.fillOpacity = 0;
                
                scene.add(titleText);
                titleText.sync(); // Important: sync to generate the geometry

                // Create SDF text for tags
                const tagsText = new Text();
                tagsText.text = project.tags.join(' — ');
                tagsText.fontSize = tagsFontSize;
                tagsText.font = '/fonts/inter-400.ttf'; // Use same font as title for consistency
                tagsText.color = 0xffffff;
                tagsText.fillOpacity = 0.6;
                tagsText.anchorX = 'left';
                tagsText.anchorY = 'bottom';
                tagsText.letterSpacing = 0;
                tagsText.maxWidth = PLANE_WIDTH - 24;
                tagsText.outlineWidth = 0;
                tagsText.depthOffset = -1;
                tagsText.sdfGlyphSize = 128; // Higher resolution SDF (default is 64, can go to 128)
                tagsText.gpuAccelerateSDF = true; // Use GPU for better performance
                tagsText.curveRadius = 0; // Sharp corners for crisp text
                
                // Position tags below title
                const tagsY = titleBottomY - titleFontSize - textGap;
                tagsText.position.set(textX, tagsY, 2); // Z=2 to stay in front
                
                // Set opacity to 0 for fade-in
                tagsText.fillOpacity = 0;
                
                scene.add(tagsText);
                tagsText.sync();

                // Store text objects for fade-in animation
                titleText.userData = { ...userData, isText: true, type: 'title' };
                tagsText.userData = { ...userData, isText: true, type: 'tags' };
            });
        }

        projectPlanesRef.current = projectPlanes;

        // Start at 0,0 - the center of the 2x2 grid where all 4 duplicates meet
        // On mobile, offset to center the first card in view
        const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        
        if (isMobile) {
            // Position to center the first card (itemCol=0, itemRow=0)
            const firstCardX = PADDING + PLANE_WIDTH / 2;
            const firstCardY = -(PADDING + PLANE_HEIGHT / 2);
            
            // To center this card in viewport, scene position is negative of card position
            scene.position.x = -firstCardX;
            scene.position.y = -firstCardY; // This will be positive, moving scene up
        } else {
            scene.position.x = 0;
            scene.position.y = 0;
        }

        // Create render target for post-processing with higher resolution for text clarity
        const pixelRatio = Math.min(window.devicePixelRatio, 2);
        const renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth * pixelRatio,
            window.innerHeight * pixelRatio,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                samples: 8, // MSAA antialiasing for better text quality
            }
        );

        // Create post-processing scene
        const postScene = new THREE.Scene();
        const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        
        // Create full-screen quad with distortion shader
        const postMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse: { value: renderTarget.texture },
                uDistortionStrength: { value: 0 },
                uTime: { value: 0 },
                uNoiseIntensity: { value: NOISE_INTENSITY },
                uVignetteIntensity: { value: VIGNETTE_INTENSITY },
                uVignettePower: { value: VIGNETTE_POWER },
            },
            vertexShader: vertexPost,
            fragmentShader: fragmentPost,
        });
        
        const postPlane = new THREE.PlaneGeometry(2, 2);
        const postQuad = new THREE.Mesh(postPlane, postMaterial);
        postScene.add(postQuad);

        // Animation loop
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Smooth distortion interpolation
            distortionStrengthRef.current += (targetDistortionRef.current - distortionStrengthRef.current) * 0.1;

            // Update post-processing material with distortion
            postMaterial.uniforms.uDistortionStrength.value = distortionStrengthRef.current;
            postMaterial.uniforms.uTime.value = performance.now() * 0.001; // Convert to seconds

            // Render scene to render target
            renderer.setRenderTarget(renderTarget);
            renderer.render(scene, camera);

            // Render post-processing to screen
            renderer.setRenderTarget(null);
            renderer.render(postScene, postCamera);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            const frustumSize = window.innerHeight;

            camera.left = (frustumSize * aspect) / -2;
            camera.right = (frustumSize * aspect) / 2;
            camera.top = frustumSize / 2;
            camera.bottom = frustumSize / -2;
            camera.updateProjectionMatrix();

            const pixelRatio = Math.min(window.devicePixelRatio, 2);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(pixelRatio);
            
            // Resize render target with pixel ratio for clarity
            renderTarget.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.cursor = 'auto';
            document.body.style.touchAction = 'auto';
            
            document.removeEventListener('touchstart', preventTouchDefaults);
            document.removeEventListener('touchmove', preventTouchDefaults);
            
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            
            // Dispose render target
            renderTarget.dispose();
            
            // Dispose post-processing
            postPlane.dispose();
            postMaterial.dispose();
            
            // Dispose renderer
            renderer.dispose();
            
            // Dispose project planes (but NOT textures - they're cached)
            projectPlanes.forEach(({ mesh, material }) => {
                mesh.geometry.dispose();
                material.dispose();
                // Don't dispose textures here - they're cached and shared
            });
            
            // Dispose all cached textures
            textureCacheRef.current.forEach((texture) => {
                texture.dispose();
            });
            textureCacheRef.current.clear();
            textureLoadingRef.current.clear();
        };
    }, [data]);

    // Infinite scrolling with GSAP Observer
    useEffect(() => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;
        const { contentWidth, contentHeight } = calculateGridDimensions(data.length);

        // Wrap at HALF of one Content block to keep duplicates always visible
        // This ensures wrapping happens off-screen before gaps appear
        const halfX = contentWidth / 2;
        const halfY = contentHeight / 2;
        
        const wrapX = gsap.utils.wrap(-halfX, halfX);
        const xTo = gsap.quickTo(scene.position, 'x', {
            duration: ANIMATION_DURATION,
            ease: ANIMATION_EASE,
            modifiers: {
                x: gsap.utils.unitize(wrapX)
            }
        });

        const wrapY = gsap.utils.wrap(-halfY, halfY);
        const yTo = gsap.quickTo(scene.position, 'y', {
            duration: ANIMATION_DURATION,
            ease: ANIMATION_EASE,
            modifiers: {
                y: gsap.utils.unitize(wrapY)
            }
        });

        // Start at initial scene position
        let incrX = scene.position.x;
        let incrY = scene.position.y;
        let hasDragged = false;
        let clickedMesh: THREE.Mesh | null = null;
        let pressStartTime = 0;
        let scrollTimeout: NodeJS.Timeout | null = null;

        Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            dragMinimum: DRAG_MINIMUM,
            onPress: (self) => {
                if (!self.event.target) return;

                hasDragged = false;
                isDraggingRef.current = false;
                pressStartTime = Date.now();

                // Change cursor to grabbing
                document.body.style.cursor = 'grabbing';

                // Apply distortion immediately on press for smooth transition
                animateDistortion(targetDistortionRef, DISTORTION_AMOUNT, DISTORTION_PRESS_DURATION, theme.easing.bezzy3);

                // Raycast to detect clicked mesh
                const canvas = canvasRef.current;
                if (canvas && cameraRef.current && self.event) {
                    const rect = canvas.getBoundingClientRect();
                    let clientX: number;
                    let clientY: number;

                    // Handle both mouse and touch events
                    if (self.event instanceof MouseEvent) {
                        clientX = self.event.clientX;
                        clientY = self.event.clientY;
                    } else if (self.event instanceof TouchEvent && self.event.touches.length > 0) {
                        clientX = self.event.touches[0].clientX;
                        clientY = self.event.touches[0].clientY;
                    } else {
                        return; // Unsupported event type
                    }

                    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
                    const y = -((clientY - rect.top) / rect.height) * 2 + 1;

                    mouseRef.current.set(x, y);
                    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

                    const intersects = raycasterRef.current.intersectObjects(
                        projectPlanesRef.current.map(p => p.mesh)
                    );

                    if (intersects.length > 0) {
                        clickedMesh = intersects[0].object as THREE.Mesh;
                    }
                }
            },
            onDrag: () => {
                hasDragged = true;
                isDraggingRef.current = true;
            },
            onRelease: () => {
                // Smoothly return to base distortion
                animateDistortion(targetDistortionRef, BASE_DISTORTION, DISTORTION_RELEASE_DURATION, theme.easing.bezzy2);

                // Reset cursor to standard
                document.body.style.cursor = 'auto';

                isDraggingRef.current = false;
                const pressDuration = Date.now() - pressStartTime;
                const isQuickClick = pressDuration < LONG_PRESS_THRESHOLD;

                // Navigate if quick click on a mesh
                if (!hasDragged && clickedMesh && isQuickClick) {
                    const href = clickedMesh.userData.href;
                    if (href) {
                        setTimeout(() => {
                            router.push(href);
                        }, 10);
                    }
                }

                clickedMesh = null;
                pressStartTime = 0;

                setTimeout(() => {
                    hasDragged = false;
                }, 50);
            },
            onChangeX: (self) => {
                if (self.event.type === "wheel") {
                    incrX -= self.deltaX;
                    
                    // Apply distortion based on wheel velocity
                    const velocity = Math.abs(self.velocityX);
                    const distortion = Math.max(MAX_DISTORTION, -velocity * VELOCITY_SCALE);
                    animateDistortion(targetDistortionRef, distortion, DISTORTION_SCROLL_DURATION, theme.easing.bezzy2);
                    
                    // Reset distortion after scrolling stops
                    if (scrollTimeout) clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        animateDistortion(targetDistortionRef, BASE_DISTORTION, DISTORTION_RELEASE_DURATION, theme.easing.bezzy2);
                    }, SCROLL_STOP_DELAY);
                } else {
                    incrX += self.deltaX * DRAG_MULTIPLIER;
                }

                xTo(incrX);
            },
            onChangeY: (self) => {
                if (self.event.type === "wheel") {
                    incrY += self.deltaY; // Inverted for WebGL Y coordinate system
                    
                    // Apply distortion based on wheel velocity
                    const velocity = Math.abs(self.velocityY);
                    const distortion = Math.max(MAX_DISTORTION, -velocity * VELOCITY_SCALE);
                    animateDistortion(targetDistortionRef, distortion, DISTORTION_SCROLL_DURATION, theme.easing.bezzy3);
                    
                    // Reset distortion after scrolling stops
                    if (scrollTimeout) clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        animateDistortion(targetDistortionRef, BASE_DISTORTION, DISTORTION_RESET_DURATION, theme.easing.bezzy3);
                    }, SCROLL_STOP_DELAY);
                } else {
                    incrY -= self.deltaY * DRAG_MULTIPLIER;
                }

                yTo(incrY);
            }
        });

    }, [data, router]);

    // Hover detection for grayscale and overlay effects
    useEffect(() => {
        if (!canvasRef.current || !cameraRef.current) return;

        // Skip hover effects on mobile
        const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        if (isMobile) return;

        const canvas = canvasRef.current;
        const camera = cameraRef.current;

        const handleMouseMove = (event: MouseEvent) => {
            // Skip hover effects while dragging
            if (isDraggingRef.current) return;

            const rect = canvas.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            mouseRef.current.set(x, y);
            raycasterRef.current.setFromCamera(mouseRef.current, camera);

            // Raycast against all image meshes
            const imageMeshes = projectPlanesRef.current.map(p => p.mesh);

            const intersects = raycasterRef.current.intersectObjects(imageMeshes);

            if (intersects.length > 0) {
                const hoveredMesh = intersects[0].object as THREE.Mesh;
                
                // If hovering a new mesh, update effects
                if (hoveredMesh !== hoveredMeshRef.current) {
                    // Reset previous hovered mesh to grayscale
                    if (hoveredMeshRef.current) {
                        const prevMaterial = hoveredMeshRef.current.material as THREE.ShaderMaterial;
                        gsap.to(prevMaterial.uniforms.uGrayscale, {
                            value: 1.0,
                            duration: 0.3,
                            ease: 'power2.out',
                        });
                        gsap.to(prevMaterial.uniforms.uOverlayOpacity, {
                            value: 0.2,
                            duration: 0.3,
                            ease: 'power2.out',
                        });
                        gsap.to(prevMaterial.uniforms.uScale, {
                            value: 1.0,
                            duration: HOVER_DURATION,
                            ease: theme.easing.bezzy3,
                        });
                    }

                    // Set new hovered mesh to color and zoom
                    hoveredMeshRef.current = hoveredMesh;
                    const material = hoveredMesh.material as THREE.ShaderMaterial;
                    gsap.to(material.uniforms.uGrayscale, {
                        value: 0.0,
                        duration: 0.3,
                        ease: 'power2.out',
                    });
                    gsap.to(material.uniforms.uOverlayOpacity, {
                        value: 0.0,
                        duration: 0.3,
                        ease: 'power2.out',
                    });
                    gsap.to(material.uniforms.uScale, {
                        value: HOVER_SCALE,
                        duration: HOVER_DURATION,
                        ease: theme.easing.bezzy3,
                    });
                }
            } else {
                // No hover - reset current hovered mesh
                if (hoveredMeshRef.current) {
                    const material = hoveredMeshRef.current.material as THREE.ShaderMaterial;
                    gsap.to(material.uniforms.uGrayscale, {
                        value: 1.0,
                        duration: 0.3,
                        ease: 'power2.out',
                    });
                    gsap.to(material.uniforms.uOverlayOpacity, {
                        value: 0.2,
                        duration: 0.3,
                        ease: 'power2.out',
                    });
                    gsap.to(material.uniforms.uScale, {
                        value: 1.0,
                        duration: HOVER_DURATION,
                        ease: theme.easing.bezzy3,
                    });
                    hoveredMeshRef.current = null;
                }
            }
        };

        canvas.addEventListener('mousemove', handleMouseMove);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Load-in animation - wait for textures, then fade in with distortion
    useEffect(() => {
        if (projectPlanesRef.current.length === 0 || !sceneRef.current) return;

        // Check if all textures are loaded
        const checkInterval = setInterval(() => {
            if (allTexturesLoadedRef.current) {
                clearInterval(checkInterval);
                
                const planes = projectPlanesRef.current;

                // Fade in all image planes with stagger
                gsap.to(
                    planes.map(p => p.material.uniforms.uAlpha),
                    {
                        value: 1,
                        duration: LOAD_IN_DURATION,
                        ease: theme.easing.bezzy3,
                        stagger: {
                            amount: 0.6, // Total stagger time
                            from: "random", // Stagger from first to last
                            ease: "power2.inOut"
                        }
                    }
                );

                // Fade in all text objects with stagger
                const scene = sceneRef.current;
                if (scene) {
                    const textObjects: any[] = [];
                    scene.traverse((obj) => {
                        if (obj instanceof Text) {
                            textObjects.push(obj);
                        }
                    });
                    
                    textObjects.forEach((obj) => {
                        // Tags at 60% opacity, titles at 100%
                        const targetOpacity = obj.userData.type === 'tags' ? 0.6 : 1.0;
                        gsap.to(obj, {
                            fillOpacity: targetOpacity,
                            duration: LOAD_IN_DURATION,
                            ease: theme.easing.bezzy3,
                        });
                    });
                }

                // Animate distortion from STARTING_DISTORTION to BASE_DISTORTION
                animateDistortion(targetDistortionRef, BASE_DISTORTION, LOAD_IN_DURATION, theme.easing.bezzy3);
            }
        }, 100);

        // Cleanup interval on unmount
        return () => clearInterval(checkInterval);

    }, []);

    return (
        <S.Jacket $hasClip={hasClip}>
            <canvas ref={canvasRef} />
        </S.Jacket>
    );
};

// Exports
// ------------
InfiniteGL.displayName = 'InfiniteGL';
export default InfiniteGL;

