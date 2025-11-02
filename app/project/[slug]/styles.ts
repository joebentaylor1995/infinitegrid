// Imports
// ------------
import styled, { keyframes } from 'styled-components';
import { getGlobal } from '@tackl';

// Animations
// ------------
const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Exports
// ------------
export const Container = styled.div`
    position: realtive;
    width: 100vw;
    height: 100vh;
    background: ${getGlobal('black')};
    overflow: hidden;
    
    /* Prevent flash during transitions */
    will-change: auto;
`;

export const ImageContainer = styled.div`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    background: ${getGlobal('black')};
    overflow: hidden;
    
    /* Ensure image renders immediately */
    img {
        will-change: auto;
    }
`;

export const ContentOverlay = styled.div`
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0.4) 50%,
        rgba(0, 0, 0, 0.9) 100%
    );
    display: flex;
    flex-direction: column;
    padding: 40px;
    
    @media (max-width: 768px) {
        padding: 20px;
    }
`;

export const Content = styled.div`
    margin-top: auto;
    max-width: 1200px;
`;

export const Title = styled.h1`
    font-size: 64px;
    font-weight: 700;
    color: ${getGlobal('white')};
    margin: 0 0 16px 0;
    letter-spacing: -0.02em;
    line-height: 1.1;
    
    @media (max-width: 768px) {
        font-size: 36px;
    }
`;

export const Tags = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
`;

export const Tag = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: ${getGlobal('white')};
    opacity: 0.8;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const Description = styled.p`
    font-size: 18px;
    line-height: 1.6;
    color: ${getGlobal('white')};
    opacity: 0.9;
    max-width: 800px;
    
    @media (max-width: 768px) {
        font-size: 16px;
    }
`;

export const ErrorMessage = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${getGlobal('white')};
    font-size: 24px;
    font-weight: 500;
`;

