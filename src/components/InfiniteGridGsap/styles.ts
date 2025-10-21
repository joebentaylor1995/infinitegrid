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

        width: 100%;
        height: 100lvh;
        scale: 1;
        transition: scale var(--dur) var(--ease);

        &:active {
            scale: var(--zoom);

            a {
                ${props.$hasClip && css`
                    clip-path: inset(var(--inset) round var(--br));

                    img { scale: 0.9 }
                `}
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