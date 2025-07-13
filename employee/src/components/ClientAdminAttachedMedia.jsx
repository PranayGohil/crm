import React from 'react';

// TODO: Replace with API call
// const mediaItems = [
//   { src: '/Image/jwell1.png', alt: 'g-i1' },
//   { src: '/Image/jwell2.png', alt: 'g-i2' },
//   { src: '/Image/jwell1.png', alt: 'g-i1' },
//   { src: '/Image/jwell3.png', alt: 'g-i2' }
// ];

const mediaItems = [
    { src: '/Image/jwell1.png', alt: 'g-i1' },
    { src: '/Image/jwell2.png', alt: 'g-i2' },
    { src: '/Image/jwell1.png', alt: 'g-i1' },
    { src: '/Image/jwell3.png', alt: 'g-i2' }
];

const ClientAdminAttachedMedia = () => {
    return (
        <section className="pb-sec-6 pb-sec2">
            <div className="pb-sec6-inner pb-sec3-inner">
                <h1>Attached Media</h1>
                <div className="pb-attached-photo-sec">
                    <div className="pb-project-gallary">
                        {mediaItems.map((item, index) => (
                            <div className="pb-gallary-img" key={index}>
                                <img src={item.src} alt={item.alt} />
                                <div className="pb-gall-icons">
                                    <a href="#">
                                        <div className="pb-media-icon">
                                            <img src="/SVG/css-eye.svg" alt="view" />
                                        </div>
                                    </a>
                                    <a href="#">
                                        <div className="pb-media-icon">
                                            <img src="/SVG/download-photo.svg" alt="download" />
                                        </div>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="pb-add-img">
                    <img src="/SVG/plus-grey.svg" alt="add" />
                    <span>Add Media</span>
                </div>
            </div>
        </section>
    );
};

export default ClientAdminAttachedMedia;
