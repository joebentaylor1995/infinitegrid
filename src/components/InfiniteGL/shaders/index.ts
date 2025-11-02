// Shaders for individual textures (no distortion here)
// ------------
export const vertexTexture = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentTexture = `
    uniform sampler2D uTexture;
    uniform float uAlpha;
    uniform float uGrayscale;
    uniform float uOverlayOpacity;
    uniform vec2 uResolution; // Plane dimensions
    uniform float uBorderRadius; // Border radius in pixels
    uniform float uScale; // Image scale (1.0 = normal, >1.0 = zoomed in)
    uniform float uImageVignetteIntensity;
    uniform float uImageVignettePower;
    uniform float uClipAmount; // Clip amount (0.0 = no clip, 2.0 = max clip)

    varying vec2 vUv;

    // Rounded rectangle SDF
    float roundedRectSDF(vec2 centerPos, vec2 size, float radius) {
        return length(max(abs(centerPos) - size + radius, 0.0)) - radius;
    }

    // Image vignette - rectangular edge-to-edge
    float imageVignette(vec2 uv) {
        vec2 centered = uv - 0.5;
        float distX = abs(centered.x) * 2.0;
        float distY = abs(centered.y) * 2.0;
        float normalizedDist = max(distX, distY);
        float vignetteMask = pow(1.0 - normalizedDist, uImageVignettePower);
        return mix(1.0 - uImageVignetteIntensity, 1.0, vignetteMask);
    }

    void main() {
        // Scale UV from center for zoom effect
        vec2 centeredUv = vUv - 0.5;
        vec2 scaledUv = centeredUv / uScale + 0.5;
        
        vec4 textureColor = texture2D(uTexture, scaledUv);
        
        // Apply grayscale conversion
        float gray = dot(textureColor.rgb, vec3(0.299, 0.587, 0.114));
        vec3 grayscaleColor = vec3(gray);
        vec3 finalColor = mix(textureColor.rgb, grayscaleColor, uGrayscale);
        
        // Apply black overlay
        finalColor = mix(finalColor, vec3(0.0), uOverlayOpacity);
        
        // Apply image vignette
        float vignetteMask = imageVignette(vUv);
        finalColor *= vignetteMask;
        
        // Calculate rounded corners mask (using original vUv for clipping)
        vec2 pixelPos = vUv * uResolution;
        vec2 center = pixelPos - uResolution * 0.5;
        float dist = roundedRectSDF(center, uResolution * 0.5, uBorderRadius);
        float smoothEdge = 1.0 - smoothstep(-1.0, 1.0, dist);
        
        gl_FragColor = vec4(finalColor, textureColor.a * uAlpha * smoothEdge);
    }
`;

// Post-processing shaders (distortion applied to entire scene)
// ------------
export const vertexPost = `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const fragmentPost = `
    uniform sampler2D tDiffuse;
    uniform float uDistortionStrength;
    uniform float uTime;
    uniform float uNoiseIntensity;
    uniform float uVignetteIntensity;
    uniform float uVignettePower;

    varying vec2 vUv;

    vec2 barrelPincushion(vec2 uv, float strength) {
        vec2 st = uv - 0.5;
        float radius = 1.0 + strength * dot(st, st);
        return 0.5 + radius * st;
    }

    // Fast random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    // Ultra-fine animated noise texture - soft, organic grain
    float animatedNoise(vec2 uv, float time) {
        // High-frequency pixel grid for ultra-fine dots
        // Each pixel gets its own random value that changes each frame
        vec2 pixelPos = floor(uv * 800.0); // Very fine grain
        
        // Each pixel's brightness changes independently each frame
        // Use time to create frame-by-frame flickering
        float timeSeed = floor(time * 60.0); // 60fps animation rate
        
        // Generate independent random noise for each pixel
        // Multiple samples for organic, soft texture
        float noise1 = random(pixelPos + vec2(timeSeed * 7.3, timeSeed * 11.7));
        float noise2 = random(pixelPos * vec2(1.1, 0.9) + vec2(timeSeed * 13.1, timeSeed * 5.9));
        float noise3 = random(pixelPos * vec2(0.8, 1.2) + vec2(timeSeed * 3.7, timeSeed * 17.3));
        
        // Soft blend for organic, subtle effect (not harsh)
        // Average for smooth, shimmering motion
        float grain = (noise1 * 0.4 + noise2 * 0.35 + noise3 * 0.25);
        
        // Return centered around 0.5 (subtle variation, not high contrast)
        return grain;
    }

    // Vignette effect - darkens edges with radial gradient
    float vignette(vec2 uv) {
        // Get radial distance from center (0.0 at center, 0.707 at corners)
        vec2 centered = uv - 0.5;
        float dist = length(centered);
        
        // Normalize to 0-1 range (0 = center, 1 = corner)
        float maxDist = length(vec2(0.5));
        float normalizedDist = dist / maxDist;
        
        // Apply power curve for smooth falloff
        float vignetteMask = pow(1.0 - normalizedDist, uVignettePower);
        
        // Apply intensity (mix between full brightness and darkened)
        return mix(1.0 - uVignetteIntensity, 1.0, vignetteMask);
    }

    void main() {
        // Apply barrel/pincushion distortion to the entire scene
        vec2 distortedUv = barrelPincushion(vUv, uDistortionStrength);
        
        // Sample the rendered scene with distorted UVs
        vec4 sceneColor = texture2D(tDiffuse, distortedUv);
        
        // Generate ultra-fine animated noise (soft grain texture)
        float noiseValue = animatedNoise(vUv, uTime);
        
        // Apply soft noise to prevent banding and add texture
        // Subtle addition that creates shimmering effect without being distracting
        vec3 finalColor = sceneColor.rgb + (noiseValue - 0.5) * uNoiseIntensity;
        
        // Apply vignette effect
        float vignetteMask = vignette(vUv);
        finalColor *= vignetteMask;
        
        gl_FragColor = vec4(finalColor, sceneColor.a);
    }
`;
