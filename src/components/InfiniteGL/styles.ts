// Imports
// ------------
import styled, { css } from 'styled-components';
import { bp, Section, getBrand, getGlobal, getEase, getGap } from '@tackl';

// Exports
// ------------
export const Jacket = styled(Section)<{ $hasClip: boolean }>(
    props => css`
        --ease: ${getEase('bezzy3')};
        --dur: 0.4s;
        --zoom: 1.05;
        --br: 1.2rem;
        --inset: 12%;

        background: ${getGlobal('black')};
        color: ${getGlobal('white')};
        overscroll-behavior-x: none;
        overflow: hidden;

        width: 100%;
        height: 100lvh;
        scale: 1;
        transition: scale var(--dur) var(--ease);

        &:active {
            scale: var(--zoom);
        }

        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    `
);

