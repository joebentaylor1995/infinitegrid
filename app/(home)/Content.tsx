'use client';

// Imports
// ------------
import InfiniteGridGsap from '@/components/InfiniteGridGsap';

// Interfaces
// ------------
import { HomeProps } from '@/types/home';

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