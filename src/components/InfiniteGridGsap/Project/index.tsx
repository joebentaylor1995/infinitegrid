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
        return (
            <S.Jacket href={href} ref={ref}>
                <S.Media src={image.src} alt={image.alt} width={400} height={300} priority />
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