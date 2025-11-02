'use client';

// Imports
// ------------


// Component
// ------------
const PAGE_TRANSITION_DURATION = 1000;

export const projectTransition = () => {
    // Old page fades out
    document.documentElement.animate(
        [
            {
                opacity: 1,
            },
            {
                opacity: 0,
            }
        ],
        {
            duration: PAGE_TRANSITION_DURATION / 2,
            delay: PAGE_TRANSITION_DURATION,
            easing: 'ease-in-out',
            fill: 'forwards',
            pseudoElement: '::view-transition-old(root)',
        }
    );

    // New page appears instantly
    document.documentElement.animate(
        [
            {
                opacity: 0,
            },
            {
                opacity: 1,
            }
        ],
        {
            duration: PAGE_TRANSITION_DURATION / 2,
            easing: 'ease-in-out',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
        }
    )
}