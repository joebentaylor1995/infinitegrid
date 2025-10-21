uniform sampler2D uTexture;
uniform float uDistortionStrength;
uniform float uAlpha;
uniform float uScale;

varying vec2 vUv;
varying vec3 vPosition;

vec2 barrelPincushion(vec2 uv, float strength) {
    vec2 st = uv - 0.5;
    float radius = 1.0 + strength * dot(st, st);
    return 0.5 + radius * st;
}

void main() {
    // Apply barrel/pincushion distortion
    vec2 distortedUv = barrelPincushion(vUv, uDistortionStrength);
    
    // Sample texture with distorted UVs
    vec4 textureColor = texture2D(uTexture, distortedUv);
    
    // Apply alpha for fade in/out
    gl_FragColor = vec4(textureColor.rgb, textureColor.a * uAlpha);
}

