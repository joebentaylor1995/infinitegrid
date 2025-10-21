// Text texture generator that respects your design system
export interface TextStyle {
    titleColor: string;
    titleSize: number;
    titleFont: string;
    titleWeight: number;
    tagsColor: string;
    tagsSize: number;
    tagsFont: string;
    gap: number;
    padding: number;
    backgroundColor: string;
    backgroundOpacity: number;
}

export const defaultTextStyle: TextStyle = {
    titleColor: '#ffffff',
    titleSize: 20,
    titleFont: 'Inter, system-ui, sans-serif',
    titleWeight: 600,
    tagsColor: 'rgba(255, 255, 255, 0.6)',
    tagsSize: 14,
    tagsFont: 'Inter, system-ui, sans-serif',
    gap: 10,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backgroundOpacity: 0.5,
};

export function generateTextTexture(
    title: string,
    tags: string[],
    width: number,
    height: number,
    style: TextStyle = defaultTextStyle
): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate text position (bottom of canvas)
    const bottomPadding = style.padding;
    const tagsHeight = style.tagsSize + style.gap;
    const titleY = height - bottomPadding - tagsHeight - style.titleSize;
    const tagsY = height - bottomPadding - style.tagsSize;

    // Draw semi-transparent background
    if (style.backgroundOpacity > 0) {
        const bgHeight = style.titleSize + style.gap + style.tagsSize + style.padding * 2;
        ctx.fillStyle = style.backgroundColor;
        ctx.globalAlpha = style.backgroundOpacity;
        ctx.fillRect(0, height - bgHeight, width, bgHeight);
        ctx.globalAlpha = 1;
    }

    // Add text shadow for readability on any background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Draw title
    ctx.fillStyle = style.titleColor;
    ctx.font = `${style.titleWeight} ${style.titleSize}px ${style.titleFont}`;
    ctx.textBaseline = 'top';
    ctx.fillText(title, style.padding, titleY);

    // Draw tags
    ctx.fillStyle = style.tagsColor;
    ctx.font = `400 ${style.tagsSize}px ${style.tagsFont}`;
    ctx.fillText(tags.join('—'), style.padding, tagsY);

    return canvas;
}

