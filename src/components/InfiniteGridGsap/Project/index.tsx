'use client';

// Imports
// ------------
import { forwardRef, memo } from 'react';

// Styles
// ------------
import * as S from './styles';

// Interfaces
// ------------
import { ProjectProps } from './interface';

// Component
// ------------
const Project = memo(forwardRef<HTMLAnchorElement, ProjectProps>(
    ({ image, href, title, tags }, ref) => {
        // Mobile optimization: use loading="lazy" instead of priority
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        
        return (
            <S.Jacket href={href} ref={ref}>
                <S.Media 
                    src={image.src} 
                    alt={image.alt} 
                    width={400} 
                    height={300} 
                    loading={isMobile ? "lazy" : undefined}
                    priority={!isMobile}
                    quality={isMobile ? 75 : 90}
                />
                <S.Content>
                    <em>{title}</em>
                    <p>{tags.join('—')}</p>
                </S.Content>
            </S.Jacket>
        );
    }
));

// Exports
// ------------
Project.displayName = 'Project';
export default Project;