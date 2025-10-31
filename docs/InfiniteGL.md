# InfiniteGL Component Documentation

## What Is InfiniteGL?

InfiniteGL is a WebGL-powered infinite scrolling grid component that displays a collection of project cards (images with titles and tags). Think of it like a photo gallery that you can drag around forever - it never ends! It's built using Three.js (a 3D graphics library) and uses fancy computer graphics tricks to make everything look smooth and polished.

---

## The Big Picture (For Everyone)

Imagine you have a giant photo album with lots of pictures. Normally, when you get to the end, you have to turn back. But InfiniteGL is like a magic photo album - no matter how far you scroll or drag, there are always more pictures ahead, behind, above, and below. It's like the album wraps around itself like a globe!

---

## How Does It Work? (Simple Explanation)

### 1. **The Scene Setup**

- Think of the computer screen as a window looking into a 3D world
- We create a "camera" that looks through this window
- We place all our images on flat "cards" (like pieces of paper) in this 3D space
- The camera is positioned so it looks straight down at these cards (like looking down at a table)

### 2. **Making It Infinite**

Here's the clever part - we don't actually have infinite images! Instead:

- We take our collection of images
- We create **4 copies** of the entire grid and arrange them in a 2x2 pattern
- When you drag and reach the edge of one grid, you seamlessly enter another copy
- Behind the scenes, we instantly teleport back to the center, but you don't notice because everything looks the same!

It's like having 4 identical photo albums side-by-side, and when you finish looking through one, you magically appear at the start of the next one.

### 3. **The Magic Tricks**

**Shaders (The Painters)**

- **Shaders** are like tiny computer programs that tell the graphics card how to draw each pixel
- We have two types:
    - **Texture Shader**: Paints each image card with effects (grayscale, zoom, rounded corners)
    - **Post-Process Shader**: Paints effects on the entire screen (distortion, noise, vignette)

**Distortion (The Pinch Effect)**

- When you drag, the entire screen gets a "pinch" effect
- It's like looking through a magnifying glass that bends the image
- This makes dragging feel more interactive and fun

**Noise (The Film Grain)**

- We add tiny random dots that flicker constantly
- This makes everything look like old film photography
- It's super subtle - most people won't notice, but it adds character

**Vignette (The Darkened Edges)**

- The edges of the screen are slightly darker
- This draws your eye toward the center
- Like a spotlight that's brightest in the middle

---

## Technical Deep Dive

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              React Component                    │
│         (InfiniteGL Component)                 │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│            Three.js Scene                       │
│  ┌──────────────────────────────────────────┐  │
│  │  Scene (Container for everything)         │  │
│  │  ├── Camera (The eye looking at scene)   │  │
│  │  ├── Project Planes (Image cards)        │  │
│  │  └── Text Objects (Titles & tags)        │  │
│  └──────────────────────────────────────────┘  │
│                   │                             │
│                   ▼                             │
│  ┌──────────────────────────────────────────┐  │
│  │  Render Target (Off-screen Canvas)        │  │
│  │  (We draw everything here first)         │  │
│  └──────────────────────────────────────────┘  │
│                   │                             │
│                   ▼                             │
│  ┌──────────────────────────────────────────┐  │
│  │  Post-Process Scene                      │  │
│  │  (Applies screen-wide effects)           │  │
│  └──────────────────────────────────────────┘  │
│                   │                             │
│                   ▼                             │
│            Final Canvas                        │
│         (What you see!)                        │
└─────────────────────────────────────────────────┘
```

### Component Structure

#### 1. **Initialization**

When the component loads:

1. Creates a Three.js scene (3D world)
2. Sets up a camera (orthographic - like looking straight down)
3. Creates a WebGL renderer (the painter)
4. Sets up event listeners for mouse/touch input

#### 2. **Grid Creation**

**For Each Project:**

- Creates a flat plane geometry (like a piece of cardboard)
- Loads the project image as a texture
- Applies the texture to the plane
- Creates text labels (title and tags) using SDF (Signed Distance Field) text
- Positions everything in the 3D grid

**Grid Duplication:**

- Creates 4 copies of the entire grid
- Arranges them in a 2x2 pattern
- This is what makes the infinite scroll work

#### 3. **Infinite Scrolling Logic**

Using GSAP Observer (a library that watches for user input):

**When You Drag:**

1. Observer detects mouse/touch movement
2. Calculates how far you've moved
3. Updates the scene position (moves the camera view)
4. Uses `gsap.utils.wrap()` to keep position within bounds
5. When you reach an edge, seamlessly wraps to the opposite side

**The Wrapping Trick:**

```
Scene Position Range: -halfWidth to +halfWidth
When position > +halfWidth → Wrap to -halfWidth + small offset
When position < -halfWidth → Wrap to +halfWidth - small offset
```

This creates the illusion of infinite space!

#### 4. **Shaders (The Visual Effects Engine)**

**Texture Shader (Per Image):**
This shader runs for every pixel of every image card. It:

- Samples the image texture
- Applies grayscale filter (for non-hovered images)
- Adds a black overlay (20% opacity)
- Applies image vignette (slight darkening at edges)
- Clips rounded corners
- Handles zoom on hover

**Post-Process Shader (Entire Screen):**
This shader runs once per frame for the entire screen:

- Applies barrel/pincushion distortion (the pinch effect)
- Adds animated noise (film grain effect)
- Applies global vignette (darkens edges)

### Key Features Explained

#### **1. Barrel/Pincushion Distortion**

**What it does:** Bends the image like looking through a fish-eye lens

**How it works:**

- Calculates distance from screen center
- Uses a mathematical formula to curve the image
- More distance from center = more distortion
- Controlled by `uDistortionStrength` uniform

**Formula:**

```glsl
vec2 st = uv - 0.5;  // Center the coordinates
float radius = 1.0 + strength * dot(st, st);  // Calculate curve
return 0.5 + radius * st;  // Apply curve
```

#### **2. Infinite Scrolling**

**The Duplication Pattern:**

```
┌─────────┬─────────┐
│ Copy 1  │ Copy 2  │
├─────────┼─────────┤
│ Copy 3  │ Copy 4  │
└─────────┴─────────┘
```

All copies contain the same projects in the same positions. When you scroll from Copy 1 to Copy 2, Copy 3 looks identical to Copy 1, so you can seamlessly wrap back.

**Wrapping Logic:**

```javascript
// Wrap X position
scene.position.x = gsap.utils.wrap(
	-contentWidth / 2, // Minimum bound
	+contentWidth / 2, // Maximum bound
	scene.position.x // Current position
);
```

#### **3. Grayscale & Color Transition**

**On Hover:**

- Image fades from grayscale to full color
- Black overlay fades from 20% to 0%
- Image zooms in slightly (1.05x scale)
- All animated smoothly with GSAP

**Implementation:**

```javascript
// When hovering
gsap.to(material.uniforms.uGrayscale, {
	value: 0.0, // Full color
	duration: 0.3,
});

// When not hovering
gsap.to(material.uniforms.uGrayscale, {
	value: 1.0, // Full grayscale
	duration: 0.3,
});
```

#### **4. Rounded Corners**

Using Signed Distance Field (SDF) technique:

- Calculates distance from each pixel to the corner
- If distance < radius → draw normally
- If distance > radius → make transparent
- Creates smooth, perfect rounded corners

#### **5. Animated Noise**

**What it does:** Adds tiny flickering dots (like film grain)

**How it works:**

- Each pixel gets a random value
- The random value changes every frame (60 times per second)
- Very subtle - only 5% intensity
- Makes everything feel more organic and less digital

#### **6. Vignette Effects**

**Two Types:**

1. **Global Vignette** (Entire screen):
    - Radial (circular) darkening from center
    - Intensity: 25%
    - Power: 1.5 (controls how quickly it darkens)

2. **Image Vignette** (Each card):
    - More subtle - 15% intensity
    - Creates depth and separation between cards

**Formula:**

```glsl
float dist = length(uv - 0.5);  // Distance from center
float vignetteMask = pow(1.0 - normalizedDist, power);
return mix(1.0 - intensity, 1.0, vignetteMask);
```

### Performance Optimizations

#### **1. Render Target**

- Renders everything to an off-screen canvas first
- Then applies post-processing effects
- This is more efficient than applying effects per-object

#### **2. MSAA (Multi-Sample Anti-Aliasing)**

- Renders at higher resolution (2x pixel ratio)
- Reduces jagged edges
- Makes text look crisp

#### **3. Efficient Text Rendering**

- Uses SDF (Signed Distance Field) text
- Pre-renders text as textures
- Text stays crisp at any zoom level
- GPU-accelerated

#### **4. Staggered Loading**

- Images fade in one by one (not all at once)
- Creates smooth, elegant load experience
- Uses GSAP timeline with stagger

#### **5. Texture Caching**

- Textures are loaded once and cached in memory
- Same image URL reuses cached texture (no re-download)
- Prevents duplicate network requests
- Shares textures across grid duplicates (4 copies use same texture)
- Reduces memory usage and improves performance
- Automatically disposed on component unmount

**How it works:**

```typescript
// Cache stores loaded textures by URL
textureCacheRef = Map<string, THREE.Texture>

// Loading promises prevent duplicate simultaneous loads
textureLoadingRef = Map<string, Promise<THREE.Texture>>

// Load flow:
1. Check cache → if found, return immediately
2. Check if loading → if yes, wait for existing promise
3. Not found → load texture, cache it, return
```

### Interaction System

#### **Mouse/Touch Input**

**Observer Setup:**

- Watches for: wheel (scrolling), touch, pointer (mouse)
- Handles both desktop and mobile

**Events:**

1. **onPress:** When you press down
    - Changes cursor to "grabbing"
    - Applies distortion immediately
    - Detects which card was clicked (for navigation)

2. **onDrag:** When you're dragging
    - Updates scene position
    - Applies distortion based on drag distance

3. **onRelease:** When you let go
    - Smoothly returns distortion to base
    - Resets cursor
    - If quick click (not drag) → navigates to project

4. **onChangeX/onChangeY:** When scrolling
    - Updates position
    - Applies distortion based on scroll velocity

### Responsive Design

**Mobile vs Desktop:**

- Different card sizes (320px vs 400px)
- Different grid layouts (2 columns vs 3 columns)
- Different gaps and padding
- Different animation speeds
- Different distortion amounts

**Breakpoint:** 768px width

### File Structure

```
InfiniteGL/
├── index.tsx          # Main component (873 lines)
├── styles.ts          # Styled components
├── interface.d.ts     # TypeScript types
├── dummyData.ts       # Sample project data
└── shaders/
    └── index.ts       # All shader code (GLSL)
```

### Key Constants

```javascript
// Responsive
MOBILE_BREAKPOINT = 768

// Visual Effects
NOISE_INTENSITY = 0.05          // Film grain strength
VIGNETTE_INTENSITY = 0.25        // Global vignette darkness
IMAGE_VIGNETTE_INTENSITY = 0.15  // Per-image vignette darkness
VIGNETTE_POWER = 1.5             // How quickly vignette fades
IMAGE_VIGNETTE_POWER = 0.4       // Per-image vignette fade

// Grid Layout (Desktop)
PLANE_WIDTH = 400px
PLANE_HEIGHT = 300px
COLS = 3
GAP = 12px

// Grid Layout (Mobile)
PLANE_WIDTH = 320px
PLANE_HEIGHT = 240px (4:3 ratio)
COLS = 2
GAP = 12px
```

### Animation Timings

```javascript
// Load-in
LOAD_IN_DURATION = 0.8s (desktop) / 0.4s (mobile)

// Hover
HOVER_DURATION = 0.4s
HOVER_SCALE = 1.05

// Distortion
DISTORTION_PRESS_DURATION = 0.2s
DISTORTION_RELEASE_DURATION = 0.4s
```

---

## Step-by-Step: What Happens When You Load the Page

1. **Component Mounts**
    - React calls `useEffect` hook
    - Checks if canvas element exists

2. **Three.js Setup**
    - Creates scene, camera, renderer
    - Sets up WebGL context
    - Configures camera (orthographic, looking straight down)

3. **Grid Creation**
    - Loads project data
    - For each project:
        - Creates plane geometry
        - Loads image texture
        - Creates material with shader
        - Creates mesh (geometry + material)
        - Creates text objects
        - Positions everything
    - Creates 4 duplicates of grid

4. **Post-Processing Setup**
    - Creates render target (off-screen canvas)
    - Creates post-processing scene
    - Sets up full-screen quad with distortion shader

5. **Event Listeners**
    - Sets up GSAP Observer for input
    - Sets up mouse move for hover detection
    - Sets up resize handler

6. **Animation Loop Starts**
    - Runs 60 times per second
    - Each frame:
        - Updates distortion interpolation
        - Renders scene to render target
        - Renders post-process to screen
        - Handles hover detection

7. **Load-in Animation**
    - Waits for all textures to load
    - Fades in images with stagger
    - Fades in text
    - Animates distortion from start to base

8. **Ready!**
    - User can now interact
    - Dragging/scrolling works
    - Hover effects work
    - Clicking navigates to projects

---

## Step-by-Step: What Happens When You Drag

1. **Press Down**
    - Observer detects press
    - Sets `isDragging = true`
    - Changes cursor to "grabbing"
    - Animates distortion to active level
    - Detects which card was clicked

2. **Drag**
    - Observer detects movement
    - Calculates `deltaX` and `deltaY` (how far moved)
    - Multiplies by `DRAG_MULTIPLIER`
    - Updates scene position
    - GSAP wraps position to stay in bounds
    - Applies distortion based on drag velocity

3. **Release**
    - Observer detects release
    - Sets `isDragging = false`
    - Resets cursor to normal
    - Animates distortion back to base
    - If quick click (not drag) → navigates

---

## Glossary (Simple Terms)

**Shader:** A tiny program that runs on your graphics card, telling it how to draw each pixel. Like a paint-by-numbers instruction manual, but for every single pixel on screen.

**Texture:** An image that gets "painted" onto a 3D object. Like wrapping paper on a box.

**Uniform:** A value you can change from JavaScript that the shader uses. Like a dial you can turn.

**Varying:** A value that changes for each pixel (like position or color).

**Mesh:** A 3D object made of geometry (shape) + material (how it looks).

**Geometry:** The 3D shape - like a cube, sphere, or plane.

**Material:** How something looks - color, texture, shininess, etc.

**Render Target:** An invisible canvas where we draw things before showing them on screen. Like drawing on tracing paper first.

**Post-Processing:** Special effects applied to the entire final image, like Instagram filters.

**Orthographic Camera:** A camera that doesn't create perspective (things don't get smaller with distance). Like looking at a blueprint.

**SDF Text:** A special way of rendering text that makes it look super sharp at any size. Uses math to draw perfect letter edges.

**Raycasting:** Shooting an invisible laser from your mouse pointer into the 3D scene to see what you're pointing at. Like a laser pointer in the dark.

---

## Future Improvements Ideas

1. **Lazy Loading:** Only load images when they're about to be visible
2. **Virtual Scrolling:** Only render visible items (currently renders all)
3. **Web Workers:** Move heavy calculations off main thread
4. **Texture Compression:** Use smaller image formats
5. **Adaptive Quality:** Reduce effects on low-end devices
6. **Pagination:** Load projects in chunks instead of all at once

---

## Conclusion

InfiniteGL is a sophisticated WebGL component that combines:

- **Three.js** for 3D rendering
- **GSAP** for smooth animations
- **Custom GLSL shaders** for visual effects
- **Smart infinite scrolling** using grid duplication
- **Responsive design** for all devices

It creates a beautiful, performant, and engaging way to browse projects with smooth interactions and polished visual effects. The "magic" is in the clever use of duplication and wrapping to create an infinite experience, combined with powerful shader effects for that extra visual polish.

---

_This documentation was created to explain InfiniteGL in the simplest terms possible while still providing technical depth for developers._
