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

    varying vec2 vUv;

    // Rounded rectangle SDF
    float roundedRectSDF(vec2 centerPos, vec2 size, float radius) {
        return length(max(abs(centerPos) - size + radius, 0.0)) - radius;
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
