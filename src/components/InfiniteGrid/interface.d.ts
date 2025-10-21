// Interfaces
// ------------
import type { Project } from './dummyData';

export interface InfiniteGridProps {
	className?: string;
	projects?: Project[]; // Optional: pass your CMS data here
}

export interface Settings {
	itemWidth: number;
	itemHeight: number;
	itemGap: number;
	hoverScale: number;
	expandedScale: number;
	dragEase: number;
	momentumFactor: number;
	bufferZone: number;
	borderRadius: number;
	vignetteSize: number;
	vignetteStrength: number;
	overlayOpacity: number;
	overlayEaseDuration: number;
	zoomDuration: number;
}

export interface ItemSize {
	width: number;
	height: number;
}

export interface ItemPosition {
	x: number;
	y: number;
}

export interface OriginalPosition {
	id: string;
	rect: DOMRect;
	imgSrc: string;
	width: number;
	height: number;
	nameText: string;
	numberText: string;
}

