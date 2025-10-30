'use client';

// Imports
// ------------
import InfiniteGridGsap from '@parts/InfiniteGridGsap';
import InfiniteGL from '@parts/InfiniteGL';

// Interfaces
// ------------
import { HomeProps } from '@/types/home';

// Component
// ------------
const Content = ({ data }: HomeProps) => {
	return (
		<>
			{/* <InfiniteGridGsap /> */}
			<InfiniteGL />
		</>
	);
};

// Exports
// ------------
Content.displayName = 'Page Content';
export default Content;