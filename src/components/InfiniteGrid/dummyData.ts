// Imports
// ------------

// Types
// ------------
export interface Project {
	id: string;
	title: string;
	slug: string;
	imageUrl: string;
	category: string;
	year: number;
}

// Helper to generate a random image url from picsum
function randomImageUrl(index: number): string {
	return `https://picsum.photos/seed/project${index + 1}_${Math.floor(Math.random() * 10000)}/800/600`;
}

// Default demo projects (used if no projects prop provided)
// ------------
export const DEFAULT_PROJECTS: Project[] = [
	{
		id: '1',
		title: 'Chromatic Loopscape',
		slug: 'chromatic-loopscape',
		imageUrl: randomImageUrl(0),
		category: 'Digital Art',
		year: 2024,
	},
	{
		id: '2',
		title: 'Solar Bloom',
		slug: 'solar-bloom',
		imageUrl: randomImageUrl(1),
		category: 'Photography',
		year: 2024,
	},
	{
		id: '3',
		title: 'Neon Handscape',
		slug: 'neon-handscape',
		imageUrl: randomImageUrl(2),
		category: 'Mixed Media',
		year: 2023,
	},
	{
		id: '4',
		title: 'Echo Discs',
		slug: 'echo-discs',
		imageUrl: randomImageUrl(3),
		category: 'Digital Art',
		year: 2024,
	},
	{
		id: '5',
		title: 'Void Gaze',
		slug: 'void-gaze',
		imageUrl: randomImageUrl(4),
		category: 'Photography',
		year: 2023,
	},
	{
		id: '6',
		title: 'Gravity Sync',
		slug: 'gravity-sync',
		imageUrl: randomImageUrl(5),
		category: '3D Render',
		year: 2024,
	},
	{
		id: '7',
		title: 'Heat Core',
		slug: 'heat-core',
		imageUrl: randomImageUrl(6),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '8',
		title: 'Fractal Mirage',
		slug: 'fractal-mirage',
		imageUrl: randomImageUrl(7),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '9',
		title: 'Nova Pulse',
		slug: 'nova-pulse',
		imageUrl: randomImageUrl(8),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '10',
		title: 'Sonic Horizon',
		slug: 'sonic-horizon',
		imageUrl: randomImageUrl(9),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '11',
		title: 'Dream Circuit',
		slug: 'dream-circuit',
		imageUrl: randomImageUrl(10),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '12',
		title: 'Lunar Mesh',
		slug: 'lunar-mesh',
		imageUrl: randomImageUrl(11),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '13',
		title: 'Radiant Dusk',
		slug: 'radiant-dusk',
		imageUrl: randomImageUrl(12),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '14',
		title: 'Pixel Drift',
		slug: 'pixel-drift',
		imageUrl: randomImageUrl(13),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '15',
		title: 'Vortex Bloom',
		slug: 'vortex-bloom',
		imageUrl: randomImageUrl(14),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '16',
		title: 'Shadow Static',
		slug: 'shadow-static',
		imageUrl: randomImageUrl(15),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '17',
		title: 'Crimson Phase',
		slug: 'crimson-phase',
		imageUrl: randomImageUrl(16),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '18',
		title: 'Retro Cascade',
		slug: 'retro-cascade',
		imageUrl: randomImageUrl(17),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '19',
		title: 'Photon Fold',
		slug: 'photon-fold',
		imageUrl: randomImageUrl(18),
		category: 'Abstract',
		year: 2024,
	},
	{
		id: '20',
		title: 'Zenith Flow',
		slug: 'zenith-flow',
		imageUrl: randomImageUrl(19),
		category: 'Abstract',
		year: 2024,
	},
];

