import React from 'react';

const ClientOverviewHeader = () => {
    return (
        <section className="pc-header">
            <div className="pc-header-inner">
                <div className="pc-back-overview">
                    <img src="/SVG/arrow-pc.svg" alt="vec" />
                    <span>Back to Client Overview</span>
                </div>
                <div className="pc-edit-content">
                    <span>Last updated on May 23, 2023</span>
                    <div className="pc-edit-content-btn">
                        <a href="EditProjectContent">
                            <img src="/SVG/edit-white.svg" alt="edit" />
                            Edit
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ClientOverviewHeader;

