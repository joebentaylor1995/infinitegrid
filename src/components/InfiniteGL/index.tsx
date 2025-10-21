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
import { generateTextTexture } from './textureGenerator';
import { textStyles } from './textStyles';

// Shaders for individual textures (no distortion here)
// ------------
const textureVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const textureFragmentShader = `
uniform sampler2D uTexture;
uniform float uAlpha;

varying vec2 vUv;

void main() {
    vec4 textureColor = texture2D(uTexture, vUv);
    gl_FragColor = vec4(textureColor.rgb, textureColor.a * uAlpha);
}
`;

// Post-processing shaders (distortion applied to entire scene)
// ------------
const postVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const postFragmentShader = `
uniform sampler2D tDiffuse;
uniform float uDistortionStrength;

varying vec2 vUv;

vec2 barrelPincushion(vec2 uv, float strength) {
    vec2 st = uv - 0.5;
    float radius = 1.0 + strength * dot(st, st);
    return 0.5 + radius * st;
}

void main() {
    // Apply barrel/pincushion distortion to the entire scene
    vec2 distortedUv = barrelPincushion(vUv, uDistortionStrength);
    
    // Sample the rendered scene with distorted UVs
    vec4 sceneColor = texture2D(tDiffuse, distortedUv);
    
    gl_FragColor = sceneColor;
}
`;

// Styles
// ------------
import * as S from './styles';

// Interfaces
// ------------
import { InfiniteGLProps, ProjectPlaneData } from './interface';

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

    // Animation refs
    const distortionStrengthRef = useRef(0);
    const targetDistortionRef = useRef(0);

    // Main Three.js setup
    useEffect(() => {
        if (!canvasRef.current) return;

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

        // Match original grid exactly
        const COLS = 5;
        const GAP = 12;
        const PADDING = GAP / 2; // 6px
        const PLANE_WIDTH = 400;
        const PLANE_HEIGHT = 300;

        // Texture loader
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin('anonymous');

        // Create planes
        const projectPlanes: ProjectPlaneData[] = [];

        // Calculate Content block size (with CSS grid gap behavior)
        // CSS grid gap only goes BETWEEN items, not on edges, but we have padding on edges
        const rows = Math.ceil(data.length / COLS);
        const contentWidth = PADDING * 2 + COLS * PLANE_WIDTH + (COLS - 1) * GAP;
        const contentHeight = PADDING * 2 + rows * PLANE_HEIGHT + (rows - 1) * GAP;

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
                    },
                    vertexShader: textureVertexShader,
                    fragmentShader: textureFragmentShader,
                    transparent: true,
                    side: THREE.DoubleSide,
                });

                // Load texture
                const imageSrc = typeof project.image === 'string' ? project.image : project.image.src;
                textureLoader.load(
                    imageSrc,
                    (texture) => {
                        texture.minFilter = THREE.LinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        material.uniforms.uTexture.value = texture;
                        material.needsUpdate = true;
                    },
                    undefined,
                    (error) => {
                        console.error('Error loading texture:', error);
                    }
                );

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

                // Create text overlay plane
                const textCanvas = generateTextTexture(
                    project.title,
                    project.tags,
                    PLANE_WIDTH,
                    PLANE_HEIGHT,
                    textStyles
                );
                
                const textTexture = new THREE.CanvasTexture(textCanvas);
                textTexture.minFilter = THREE.LinearFilter;
                textTexture.magFilter = THREE.LinearFilter;

                const textMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        uTexture: { value: textTexture },
                        uAlpha: { value: 0 },
                    },
                    vertexShader: textureVertexShader,
                    fragmentShader: textureFragmentShader,
                    transparent: true,
                    side: THREE.DoubleSide,
                    depthWrite: false, // Don't write to depth buffer for proper transparency
                });

                const textGeometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT);
                const textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.set(x, y, 1); // Slightly in front of image
                textMesh.userData = userData;

                scene.add(textMesh);
                projectPlanes.push({ mesh: textMesh, material: textMaterial, userData });
            });
        }

        projectPlanesRef.current = projectPlanes;

        // Start at 0,0 - the center of the 2x2 grid where all 4 duplicates meet
        scene.position.x = 0;
        scene.position.y = 0;

        // Create render target for post-processing
        const renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
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
            },
            vertexShader: postVertexShader,
            fragmentShader: postFragmentShader,
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

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            // Resize render target
            renderTarget.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            
            // Dispose render target
            renderTarget.dispose();
            
            // Dispose post-processing
            postPlane.dispose();
            postMaterial.dispose();
            
            // Dispose renderer
            renderer.dispose();
            
            // Dispose project planes
            projectPlanes.forEach(({ mesh, material }) => {
                mesh.geometry.dispose();
                material.dispose();
                if (material.uniforms.uTexture.value) {
                    material.uniforms.uTexture.value.dispose();
                }
            });
        };
    }, [data]);

    // Infinite scrolling with GSAP Observer
    useEffect(() => {
        if (!sceneRef.current) return;

        const scene = sceneRef.current;

        // NOTE • Animation settings
        const ANIMATION = {
            EASE: "power4",
            DURATION: 1.5,
        };

        // Calculate wrapping - use same dimensions as scene setup
        const COLS = 5;
        const GAP = 12;
        const PADDING = GAP / 2;
        const PLANE_WIDTH = 400;
        const PLANE_HEIGHT = 300;
        const rows = Math.ceil(data.length / COLS);
        const contentWidth = PADDING * 2 + COLS * PLANE_WIDTH + (COLS - 1) * GAP;
        const contentHeight = PADDING * 2 + rows * PLANE_HEIGHT + (rows - 1) * GAP;

        // Wrap at HALF of one Content block to keep duplicates always visible
        // This ensures wrapping happens off-screen before gaps appear
        const halfX = contentWidth / 2;
        const halfY = contentHeight / 2;
        
        const wrapX = gsap.utils.wrap(-halfX, halfX);
        const xTo = gsap.quickTo(scene.position, 'x', {
            duration: ANIMATION.DURATION,
            ease: ANIMATION.EASE,
            modifiers: {
                x: gsap.utils.unitize(wrapX)
            }
        });

        const wrapY = gsap.utils.wrap(-halfY, halfY);
        const yTo = gsap.quickTo(scene.position, 'y', {
            duration: ANIMATION.DURATION,
            ease: ANIMATION.EASE,
            modifiers: {
                y: gsap.utils.unitize(wrapY)
            }
        });

        // Start at 0,0 - center of the 2x2 grid
        let incrX = 0;
        let incrY = 0;
        let hasDragged = false;
        let clickedMesh: THREE.Mesh | null = null;
        let pressStartTime = 0;
        const LONG_PRESS_THRESHOLD = 500;
        const DISTORTION_AMOUNT = -0.5; // Negative for pincushion, positive for barrel
        const MAX_DISTORTION = -0.5;
        const VELOCITY_SCALE = 0.010; // Scale factor for velocity to distortion
        let scrollTimeout: NodeJS.Timeout | null = null;

        Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            dragMinimum: 5,
            onPress: (self) => {
                if (!self.event.target) return;

                hasDragged = false;
                pressStartTime = Date.now();

                // Raycast to detect clicked mesh
                const canvas = canvasRef.current;
                if (canvas && cameraRef.current && self.event instanceof MouseEvent) {
                    const rect = canvas.getBoundingClientRect();
                    const x = ((self.event.clientX - rect.left) / rect.width) * 2 - 1;
                    const y = -((self.event.clientY - rect.top) / rect.height) * 2 + 1;

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
                // Apply distortion on drag
                targetDistortionRef.current = DISTORTION_AMOUNT;
            },
            onRelease: () => {
                // Remove distortion
                targetDistortionRef.current = 0;

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
                    
                    // Animate distortion smoothly with GSAP
                    gsap.to(targetDistortionRef, {
                        current: distortion,
                        duration: 0.3,
                        ease: theme.easing.bezzy2,
                    });
                    
                    // Reset distortion after scrolling stops
                    if (scrollTimeout) clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        gsap.to(targetDistortionRef, {
                            current: 0,
                            duration: 0.6,
                            ease: theme.easing.bezzy2,
                        });
                    }, 150);
                } else {
                    incrX += self.deltaX * 2; // Follow drag direction
                }

                xTo(incrX);
            },
            onChangeY: (self) => {
                if (self.event.type === "wheel") {
                    incrY += self.deltaY; // Inverted for WebGL Y coordinate system
                    // Apply distortion based on wheel velocity
                    const velocity = Math.abs(self.velocityY);
                    const distortion = Math.max(MAX_DISTORTION, -velocity * VELOCITY_SCALE);
                    
                    // Animate distortion smoothly with GSAP
                    gsap.to(targetDistortionRef, {
                        current: distortion,
                        duration: 0.3,
                        ease: theme.easing.bezzy2,
                    });
                    
                    // Reset distortion after scrolling stops
                    if (scrollTimeout) clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        gsap.to(targetDistortionRef, {
                            current: 0,
                            duration: 0.6,
                            ease: theme.easing.bezzy2,
                        });
                    }, 150);
                } else {
                    incrY -= self.deltaY * 2; // Follow drag direction
                }

                yTo(incrY);
            }
        });

    }, [data, router]);

    // Load-in animation
    useEffect(() => {
        if (projectPlanesRef.current.length === 0) return;

        // Wait a bit for textures to load
        setTimeout(() => {
            const planes = projectPlanesRef.current;

            // Set initial state
            planes.forEach(({ material, mesh }) => {
                gsap.set(material.uniforms.uAlpha, { value: 0 });
                gsap.set(material.uniforms.uScale, { value: 0 });
                gsap.set(mesh.scale, { x: 0, y: 0, z: 1 });
            });

            // Animate in with random stagger
            gsap.to(
                planes.map(p => p.mesh.scale),
                {
                    x: 1,
                    y: 1,
                    duration: 1,
                    ease: theme.easing.bezzy2,
                    stagger: {
                        amount: 1,
                        from: 'random',
                        ease: theme.easing.bezzy2,
                    },
                    onUpdate: function() {
                        // Sync alpha with scale
                        const index = Math.floor(this.progress() * planes.length);
                        if (index < planes.length) {
                            planes[index].material.uniforms.uAlpha.value = this.progress();
                        }
                    }
                }
            );

            // Animate alpha separately
            gsap.to(
                planes.map(p => p.material.uniforms.uAlpha),
                {
                    value: 1,
                    duration: 1,
                    ease: theme.easing.bezzy2,
                    stagger: {
                        amount: 1,
                        from: 'random',
                        ease: theme.easing.bezzy2,
                    }
                }
            );
        }, 500);

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

