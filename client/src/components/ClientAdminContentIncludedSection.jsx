import React from 'react';

// TODO: Replace with API call
const contentItems = [
    {
        type: 'Photos',
        description: 'High-resolution product images',
        icon: '/SVG/pc-media-vec.svg',
        count: 5,
    },
    {
        type: 'Videos',
        description: 'Product showcase videos',
        icon: '/SVG/pc-video-vec.svg',
        count: 3,
    },
];

const ClientAdminContentIncludedSection = () => {
    return (
        <section className="pc-content-include">
            <div className="pc-content-inner">
                <h2>Content Included</h2>
            </div>
            <div className="pc-photo-video">
                {contentItems.map((item, index) => (
                    <div
                        key={index}
                        className={item.type === 'Photos' ? 'pc-content-photo' : 'pc-content-video'}
                    >
                        <div className="pc-photo-detail">
                            <div className="photo-video-inner">
                                <div className="pc-image-head">
                                    <img src={item.icon} alt={item.type} />
                                </div>
                                <div className="not-completed-text">
                                    <h3>{item.type}</h3>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                            <div className="pc-item-contain">
                                <span>{item.count}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ClientAdminContentIncludedSection;
