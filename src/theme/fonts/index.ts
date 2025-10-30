// Imports
// ------------
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Fonts } from './interface';

// SECTION • Inter font configuration optimized with swap display for better loading performance
export const inter = Inter({
	subsets: ['latin'],
	display: 'swap', // Uses fallback font until Inter loads
	weight: ['400', '500', '700'],
	variable: '--inter',
	preload: true,
});

// SECTION • Local font configuration
export const sequel = localFont({
	src: [
		{
			path: './sequel/sequel-85.ttf',
			weight: '400',
			style: 'normal',
		},
	],
	display: 'swap',
	variable: '--sequel',
	preload: true,
});

// Exports
// ------------
export const fonts: Fonts = {
	family: {
		heading: `var(--sequel), Arial, sans-serif`,
		body: `var(--inter), Arial, sans-serif`,
		mono: `var(--inter), Arial, sans-serif`,
		script: `var(--inter), Arial, sans-serif`,
	},
	weight: {
		light: 300,
		regular: 400,
		medium: 500,
		semi: 600,
		bold: 700,
		heavy: 800,
		black: 900,
	},
};
