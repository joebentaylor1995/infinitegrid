'use client';

// Imports
// ------------
import { useParams } from 'next/navigation';
import { dummyData } from '@/components/InfiniteGL/dummyData';
import * as S from './styles';

// Component
// ------------
const ProjectPage = () => {
    const params = useParams();
    const slug = params.slug as string;
    
    // Find project from data (doesn't rely on router state)
    const project = dummyData.find(p => p.href === `/project/${slug}`);
    
    // Handle 404
    if (!project) {
        return (
            <S.Container>
                <S.ErrorMessage>Project not found</S.ErrorMessage>
            </S.Container>
        );
    }
    
    const imageSrc = typeof project.image === 'string' ? project.image : project.image.src;
    
    return (
        <>
        <S.Container>
            {/* Fullscreen Image */}
            <S.ImageContainer>
                <img
                    src={imageSrc}
                    alt={project.title}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scale(1.1)',
                    }}
                />
            </S.ImageContainer>
            
            {/* Content Overlay */}
            <S.ContentOverlay>
                <S.Content>
                    <S.Title>{project.title}</S.Title>
                    <S.Tags>
                        {project.tags.map((tag, index) => (
                            <S.Tag key={index}>{tag}</S.Tag>
                        ))}
                    </S.Tags>
                    
                    <S.Description>
                        This is a placeholder for the project content. 
                        Replace this with your actual project details.
                    </S.Description>
                </S.Content>
            </S.ContentOverlay>
        </S.Container>
            {/* Dummy Section Content */}
            <section style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.95)', zIndex: 2 }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', color: '#333' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Project Overview</h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem' }}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis nec velit justo. Etiam cursus, sem in pulvinar scelerisque, tortor velit tincidunt nulla, vel cursus nulla elit eu massa. Suspendisse potenti. Etiam venenatis magna vel metus blandit, vitae posuere ipsum pretium.
                    </p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Key Features</h3>
                    <ul style={{ paddingLeft: '1.5em', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.8 }}>
                        <li>Modern, responsive design</li>
                        <li>Lightning-fast performance</li>
                        <li>Seamless navigation experience</li>
                        <li>Accessible and user-friendly interface</li>
                    </ul>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Technical Stack</h3>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                        Built with <strong>Next.js</strong>, <strong>React</strong>, and <strong>styled-components</strong>. Uses image optimization and custom transitions for an enhanced UI experience.
                    </p>
                </div>
            </section>

            {/* Gallery Section */}
            <section style={{ padding: '4rem 2rem', background: '#f8f9fa' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem', color: '#333' }}>Project Gallery</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} style={{ aspectRatio: '4/3', background: '#ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#888' }}>
                                Image {i}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section style={{ padding: '4rem 2rem', background: 'rgba(255,255,255,0.95)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', color: '#333' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Design Process</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {['Research', 'Design', 'Development', 'Launch'].map((phase, i) => (
                            <div key={i}>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1rem' }}>{i + 1}. {phase}</h3>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#555' }}>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section style={{ padding: '4rem 2rem', background: '#000', color: '#fff' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Results & Impact</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                        {[
                            { value: '300%', label: 'Increase in Engagement' },
                            { value: '50K+', label: 'Active Users' },
                            { value: '4.9/5', label: 'User Rating' },
                            { value: '99.9%', label: 'Uptime' }
                        ].map((stat, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#fff' }}>{stat.value}</div>
                                <div style={{ fontSize: '1rem', opacity: 0.8 }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8, opacity: 0.9 }}>
                        The project exceeded all expectations, delivering exceptional results across all key metrics. User feedback has been overwhelmingly positive, with particular praise for the intuitive interface and seamless experience.
                    </p>
                </div>
            </section>

            {/* Footer CTA */}
            <section style={{ padding: '5rem 2rem', background: 'rgba(255,255,255,0.95)', textAlign: 'center' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', color: '#333' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to Start Your Project?</h2>
                    <p style={{ fontSize: '1.2rem', lineHeight: 1.8, marginBottom: '2rem', opacity: 0.8 }}>
                        Let's create something amazing together. Get in touch to discuss your ideas.
                    </p>
                    <button style={{ 
                        padding: '1rem 3rem', 
                        fontSize: '1.1rem', 
                        fontWeight: 600, 
                        background: '#000', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                    }}>
                        Get In Touch
                    </button>
                </div>
            </section>
            </>
    );
};

// Exports
// ------------
ProjectPage.displayName = 'ProjectPage';
export default ProjectPage;

