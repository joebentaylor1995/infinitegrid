export interface ProjectData {
    image: string | { src: string; alt: string };
    href: string;
    title: string;
    tags: string[];
}

export interface InfiniteGLProps {
    infiniteData?: ProjectData[];
    hasClip?: boolean;
}

export interface ProjectPlaneData {
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
    userData: {
        href: string;
        title: string;
        tags: string[];
        imageSrc: string;
        duplicateIndex: number;
        projectIndex: number;
    };
}

