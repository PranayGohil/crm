import React from 'react';

const mediaGalleryData = [
    {
        img: '/Image/gallary-i1.png',
        icon: '/SVG/pmg-media-vec.svg',
        alt: 'Image 1',
    },
    {
        img: '/Image/gallary-i2.png',
        icon: '/SVG/pmg-video-vec.svg',
        alt: 'Video 1',
    },
    {
        img: '/Image/gallary-i1.png',
        icon: '/SVG/pmg-media-vec.svg',
        alt: 'Image 2',
    },
    {
        img: '/Image/gallary-i2.png',
        icon: '/SVG/pmg-video-vec.svg',
        alt: 'Video 2',
    },
    {
        img: '/Image/gallary-i2.png',
        icon: '/SVG/pmg-video-vec.svg',
        alt: 'Video 2',
    },
];

const ProjectMediaGallery = () => {
    return (
        <section className="pmg-project-media-gallary">
            <div className="pmg-project-media-main">
                <h1>Project Media Gallery</h1>
                <div className="pmg-project-gallary">
                    {mediaGalleryData.map((media, index) => (
                        <div className="pmg-gallary-img" key={index}>
                            <img src={media.img} alt={media.alt} />
                            <div className="pmg-media-icon">
                                <img src={media.icon} alt="media-type-icon" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProjectMediaGallery;
