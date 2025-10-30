// Imports
// ------------
import styled, { css } from 'styled-components';
import { bp, getBrand, getGlobal, getEase, getGap } from '@tackl';
import { } from '@tackl/type';
import Link from 'next/link';
import Image from 'next/image';

// Interfaces
// ------------
interface CHANGE_ME {

}

// Exports
// ------------
export const Media = styled(Image)(
    props => css`
        --zoom: 1.05;

        pointer-events: none;
        position: absolute;
        top: 0; left: 0;
        width: 100%;
        height: 100%;

        scale: 1;
        object-fit: cover;

        filter: grayscale(100%);
        transition: filter var(--dur) var(--ease), scale var(--dur) var(--ease);
        
    `
);

export const Content = styled.div(
    props => css`
        display: flex;
        flex-flow: column;
        gap: 0.6rem;

        em, p {
            color: ${getGlobal('white')};
        }

        em {

        }

        p {
            
        }
    `
);

export const Jacket = styled(Link)(
    props => css`
        --ease: ${getEase('bezzy3')};
        --dur: 0.4s;
        --ar: 4/3;
        --w: 40rem;
        --br: 0.6rem;
        --gap: 0.6rem;

        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-drag: none;
        -webkit-user-drag: none;
        -moz-user-drag: none;
        -ms-user-drag: none;
        -webkit-tap-highlight-color: transparent;
        
        position: relative;
        overflow: hidden;
        will-change: transform;

        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        gap: var(--gap);

        width: var(--w);
        aspect-ratio: var(--ar);
        border-radius: var(--br);
        
        clip-path: inset(0% round var(--br));
        transition: clip-path var(--dur) var(--ease);

        &:hover {
            ${Media} {
                filter: grayscale(0%);
                scale: var(--zoom);
            }


        }
    `
);