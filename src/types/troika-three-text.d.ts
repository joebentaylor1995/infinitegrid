declare module 'troika-three-text' {
    import * as THREE from 'three';

    export class Text extends THREE.Mesh {
        text: string;
        fontSize: number;
        font: string;
        color: number | string;
        anchorX: 'left' | 'center' | 'right' | number;
        anchorY: 'top' | 'middle' | 'bottom' | number;
        letterSpacing: number;
        maxWidth: number;
        outlineWidth: number;
        outlineColor: number | string;
        lineHeight: number;
        fillOpacity: number;
        depthOffset: number;
        sdfGlyphSize: number;
        gpuAccelerateSDF: boolean;
        curveRadius: number;
        sync(callback?: () => void): void;
        dispose(): void;
    }
}

