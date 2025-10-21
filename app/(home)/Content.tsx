'use client';

// Imports
// ------------
import InfiniteGL from '@parts/InfiniteGL';

// Interfaces
// ------------
import { HomeProps } from '@/types/home';
import InfiniteGridGsap from '@/components/InfiniteGridGsap';

// Component
// ------------
const Content = ({ data }: HomeProps) => {
	return (
		<>
			<InfiniteGridGsap />
		</>
	);
};

// Exports
// ------------
Content.displayName = 'Page Content';
export default Content;