// Text styling configuration matching InfiniteGridGsap styles
// Based on: src/components/InfiniteGridGsap/Project/styles.ts

import { TextStyle } from './textureGenerator';

// Matching original Project component styles
export const textStyles: TextStyle = {
    // Title styling (em tag)
    titleColor: '#ffffff', // getGlobal('white')
    titleSize: 16, // Base font size
    titleFont: 'system-ui, -apple-system, sans-serif',
    titleWeight: 400,

    // Tags styling (p tag)
    tagsColor: '#ffffff', // getGlobal('white')
    tagsSize: 14,
    tagsFont: 'system-ui, -apple-system, sans-serif',

    // Layout - matching Content component
    gap: 9.6, // 0.6rem = 9.6px (original --gap)
    padding: 12, // Minimal padding for positioning at bottom

    // No background (transparent)
    backgroundColor: 'rgba(0, 0, 0, 0)',
    backgroundOpacity: 0,
};

// Example: Dark theme
export const darkTextStyles: TextStyle = {
    titleColor: '#ffffff',
    titleSize: 22,
    titleFont: 'Inter, system-ui, sans-serif',
    titleWeight: 700,
    tagsColor: 'rgba(255, 255, 255, 0.7)',
    tagsSize: 14,
    tagsFont: 'Inter, system-ui, sans-serif',
    gap: 12,
    padding: 24,
    backgroundColor: '#000000',
    backgroundOpacity: 0.6,
};

// Example: Light theme
export const lightTextStyles: TextStyle = {
    titleColor: '#000000',
    titleSize: 20,
    titleFont: 'Inter, system-ui, sans-serif',
    titleWeight: 600,
    tagsColor: 'rgba(0, 0, 0, 0.7)',
    tagsSize: 14,
    tagsFont: 'Inter, system-ui, sans-serif',
    gap: 10,
    padding: 20,
    backgroundColor: '#ffffff',
    backgroundOpacity: 0.6,
};
