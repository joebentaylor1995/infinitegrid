// Imports
// ------------
import styled from 'styled-components';
import { getGlobal } from '@tackl';

// Styles
// ------------
export const Jacket = styled.section`
	position: relative;
	width: 100vw;
	height: 100lvh;
	overflow: hidden;
	background: ${getGlobal('black')};
`;

export const NoiseOverlay = styled.div`
	content: '';
	position: fixed;
	inset: -50%;

	background: transparent
		url('http://assets.iceable.com/img/noise-transparent.png') repeat 0 0;
	background-size: 300px 300px;
	animation: noise-animation 0.3s steps(5) infinite;
	opacity: 0.9;
	will-change: transform;
	z-index: 100;
	pointer-events: none;

	@keyframes noise-animation {
		0% {
			transform: translate(0, 0);
		}
		10% {
			transform: translate(-2%, -3%);
		}
		20% {
			transform: translate(-4%, 2%);
		}
		30% {
			transform: translate(2%, -4%);
		}
		40% {
			transform: translate(-2%, 5%);
		}
		50% {
			transform: translate(-4%, 2%);
		}
		60% {
			transform: translate(3%, 0);
		}
		70% {
			transform: translate(0, 3%);
		}
		80% {
			transform: translate(-3%, 0);
		}
		90% {
			transform: translate(2%, 2%);
		}
		100% {
			transform: translate(1%, 0);
		}
	}
`;

export const Container = styled.div<{ $canDrag: boolean }>`
	position: relative;
	width: 100vw;
	height: 100lvh;
	overflow: hidden;
	cursor: ${props => (props.$canDrag ? 'grab' : 'auto')};

	&:active {
		cursor: ${props => (props.$canDrag ? 'grabbing' : 'auto')};
	}
`;

export const Canvas = styled.div`
	position: absolute;
	will-change: transform;
`;

export const PageVignetteContainer = styled.div`
	position: fixed;
	inset: 0;
	pointer-events: none;
	z-index: 12;
`;

export const PageVignette = styled.div`
	position: absolute;
	inset: 0;
	box-shadow: inset 0 0 var(--page-vignette-size, 0px)
		var(--page-vignette-color, ${getGlobal('black', 0.9)});
`;

export const PageVignetteStrong = styled.div`
	position: absolute;
	inset: 0;
	box-shadow: inset 0 0 var(--page-vignette-strong-size, 0px)
		var(--page-vignette-strong-color, ${getGlobal('black', 0.95)});
`;

export const PageVignetteExtreme = styled.div`
	position: absolute;
	inset: 0;
	box-shadow: inset 0 0 var(--page-vignette-extreme-size, 0px)
		var(--page-vignette-extreme-color, ${getGlobal('black')});
`;

