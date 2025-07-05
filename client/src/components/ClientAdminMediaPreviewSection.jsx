import React from 'react';

// TODO: Replace with API call
const mediaImages = [
    "/Image/jwell1.png",
    "/Image/jwell2.png",
    "/Image/jwell3.png",
    "/Image/jwell1.png",
    "/Image/jwell2.png"
];

const ClientAdminMediaPreviewSection = () => {
    return (
        <section className="pc-media-preview">
            <div className="pc-media-preview-inner">
                <h2>Media Preview</h2>
                <a href="projectmediagallery">View All</a>
            </div>
            <div className="pc-media-pre-imgs">
                {mediaImages.map((src, index) => (
                    <img key={index} src={src} alt={`j${index + 1}`} />
                ))}
            </div>
        </section>
    );
};

export default ClientAdminMediaPreviewSection;
