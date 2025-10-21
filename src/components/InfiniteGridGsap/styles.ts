
// Imports
// ------------
import styled, { css } from 'styled-components';
import { bp, Section, getBrand, getGlobal, getEase, getGap } from '@tackl';
import { } from '@tackl/type';

// Interfaces
// ------------
interface CHANGE_ME {

}

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

        position: fixed;
        top: 0;
        left: 0;
        z-index: 1000;

        width: 100%;
        height: 100lvh;
        scale: 1;
        transition: scale var(--dur) var(--ease);

        &:active {
            ${bp.l`
                scale: var(--zoom);

                a {
                    ${props.$hasClip && css`
                        clip-path: inset(var(--inset) round var(--br));

                        img { scale: 0.9 }
                    `}
                }
            `}
        }

        // Mobile performance optimizations
        @media (max-width: 768px) {
            // Disable expensive active states on mobile
            &:active {
                scale: 1;
                
                a {
                    clip-path: none;
                    img { scale: 1 }
                }
            }
        }
    `
);


export const Container = styled.div(
    props => css`
        --cols: 2;
        display: grid;
        grid-template-columns: repeat(var(--cols), 1fr);
        width: max-content;
        will-change: transform;
        
        // Mobile performance: Use GPU acceleration
        @media (max-width: 768px) {
            transform: translateZ(0);
            backface-visibility: hidden;
        }
    `
);

export const Content = styled.div(
    props => css`
        --cols: 5;
        --gap: 1.2rem;

        display: grid;
        grid-template-columns: repeat(var(--cols), 1fr);
        gap: var(--gap);

        padding: calc(var(--gap) / 2);
        width: max-content;
    `
);