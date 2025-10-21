'use client';

// Imports
// ------------
import Project from './Project';
import gsap from 'gsap';
import { theme } from '@theme';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { dummyData } from './dummyData';
import { Observer } from 'gsap/Observer';

// Styles
// ------------
import * as S from './styles';

// Interfaces
// ------------
import { InfiniteGridGsapProps } from './interface';


// Component
// ------------
const InfiniteGridGsap = ({ infiniteData, hasClip = true  }: InfiniteGridGsapProps) => {
    // Router
    const router = useRouter();

    // Data
    const data = infiniteData || dummyData;

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const jacketRef = useRef<HTMLDivElement>(null);

    // Each Project will get its own ref, stored in a 2D array [duplicateIndex][projectIndex]
    const projectRefs = useRef<Array<Array<HTMLAnchorElement | null>>>([]);

    // Helper to get all project anchor refs flattened
    const getAllProjectAnchors = () => 
        projectRefs.current.flat().filter((el): el is HTMLAnchorElement => !!el);

    // Infinite Animation
    useEffect(() => {
        // Early bail for SSR/hydration
        if (!containerRef.current || !jacketRef.current) return;

        // Performance optimization: Reduce duplicates on mobile
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        
        // NOTE • Animation settings (faster on mobile for better performance)
        const ANIMATION = {
            EASE: "power4",
            DURATION: isMobile ? 1.0 : 1.5,
        }

        // X Animation
        const halfX = containerRef.current.clientWidth / 2;
        const wrapX = gsap.utils.wrap(-halfX, 0);
        const xTo = gsap.quickTo(containerRef.current, 'x', {
            duration: ANIMATION.DURATION,
            ease: ANIMATION.EASE,
            modifiers: {
                x: gsap.utils.unitize(wrapX)
            }
        });

        // Y Animation
        const halfY = containerRef.current.clientHeight / 2
        const wrapY = gsap.utils.wrap(-halfY, 0)
        const yTo = gsap.quickTo(containerRef.current, 'y', {
            duration: ANIMATION.DURATION,
            ease: ANIMATION.EASE,
            modifiers: {
                y: gsap.utils.unitize(wrapY)
            }
        });

        // Observer to handle wheel and drag events
        let incrX = 0, incrY = 0;
        let hasDragged = false;
        let clickedItem: HTMLAnchorElement | null = null;
        let pressStartTime = 0;
        const LONG_PRESS_THRESHOLD = 500; // milliseconds

        Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            dragMinimum: 5,
            tolerance: isMobile ? 20 : 10, // Higher tolerance on mobile for better performance
            onPress: (self) => {
                // Early bail for SSR/hydration
                if (!self.event.target) return;

                hasDragged = false;
                pressStartTime = Date.now(); // Track when press started

                // Use refs to check if a project anchor was clicked
                const allAnchors = getAllProjectAnchors();
                clickedItem = allAnchors.find(anchor => anchor && anchor.contains(self.event.target as Node)) || null;

                // Disable pointer events IMMEDIATELY to allow drag
                allAnchors.forEach(item => {
                    item.style.pointerEvents = 'none';
                });
            },
            onDrag: () => {
                hasDragged = true;
            },
            onRelease: () => {
                const allAnchors = getAllProjectAnchors();
                // Re-enable pointer events
                allAnchors.forEach(item => {
                    item.style.pointerEvents = 'auto';
                });

                // Calculate press duration
                const pressDuration = Date.now() - pressStartTime;
                const isQuickClick = pressDuration < LONG_PRESS_THRESHOLD;

                // Only navigate if it was a quick click (not a drag, not a long press)
                if (!hasDragged && clickedItem && isQuickClick) {
                    const href = clickedItem.getAttribute('href');
                    
                    if (href) {
                        // Small delay to ensure pointer-events is restored
                        setTimeout(() => {
                            router.push(href);
                        }, 10);
                    }
                }

                clickedItem = null;
                pressStartTime = 0;

                // Reset after short delay
                setTimeout(() => {
                    hasDragged = false;
                }, 50);
            },
            onChangeX: (self) => {
                if (self.event.type === "wheel")
                    incrX -= self.deltaX
                else
                    incrX += self.deltaX * (isMobile ? 1.5 : 2) // Less aggressive on mobile

                xTo(incrX)
            },
            onChangeY: (self) => {
                if (self.event.type === "wheel")
                    incrY -= self.deltaY
                else
                    incrY += self.deltaY * (isMobile ? 1.5 : 2) // Less aggressive on mobile

                yTo(incrY)
            }
        })

        // Load-in animation - randomly scale each project
        const allAnchors = getAllProjectAnchors();
        
        // Set initial state
        gsap.set(allAnchors, {
            scale: 0,
            autoAlpha: 0,
        });

        // Animate in with random stagger
        gsap.to(allAnchors, {
            scale: 1,
            autoAlpha: 1,
            duration: 1,
            ease: theme.easing.bezzy2,
            stagger: {
                amount: 1, // Total time to stagger over
                from: 'random', // Random order
                ease: theme.easing.bezzy2,
            }
        });
        
    }, []);

    // NOTE • Helper for refs: ensure projectRefs always matches the rendered grid (4 x data.length)
    // This avoids referential bugs if data changes.
    if (
        !projectRefs.current.length ||
        projectRefs.current.length !== 4 ||
        projectRefs.current.some(col => col.length !== data.length)
    ) {
        projectRefs.current = Array.from({ length: 4 }, () =>
            Array.from({ length: data.length }, () => null)
        );
    }

    return (
        <S.Jacket ref={jacketRef} $hasClip={hasClip}>
            <S.Container ref={containerRef}>
                {Array.from({ length: 4 }).map((_, duplicateIndex) => (
                    <S.Content key={duplicateIndex} aria-hidden={duplicateIndex > 0}>
                        {data.map((project, i) => (
                            <Project
                                key={`${duplicateIndex}-${i}`}
                                image={project.image}
                                href={project.href}
                                title={project.title}
                                tags={project.tags}
                                ref={el => {
                                    projectRefs.current[duplicateIndex][i] = el;
                                }}
                            />
                        ))}
                    </S.Content>
                ))}
            </S.Container>
        </S.Jacket>
    );
}

// Exports
// ------------
InfiniteGridGsap.displayName = 'InfiniteGridGsap';
export default InfiniteGridGsap;