'use client';

/**
 * AnimationPlugins Component
 * =========================
 * A utility component that handles registration of GSAP animation plugins.
 * This component doesn't render anything visible but sets up necessary animation
 * functionality for the application.
 *
 * Features:
 * - Registers GSAP ScrollTrigger plugin for scroll-based animations
 * - Only registers plugins once on initial client-side load
 * - Safely handles server-side rendering by checking for window object
 *
 * @component
 * @example
 * <AnimationPlugins />
 */

// Imports
// ------------
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';
import CustomEase from 'gsap/CustomEase';
import { Observer } from 'gsap/Observer';

// This needs to be wrapped in a component since we're using 'use client'
// and need to handle SSR properly
const AnimationPlugins = () => {
	useLayoutEffect(() => {
		gsap.registerPlugin(ScrollTrigger, useGSAP, CustomEase, Observer);
	}, []);

	return null;
};

// Exports
// ------------
AnimationPlugins.displayName = 'AnimationPlugins';
export default AnimationPlugins;
