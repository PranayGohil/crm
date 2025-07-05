import React from 'react';

const CreateProjectHeader = () => {
    return (
        <section className="epc-header">
            <div className="epc-header-inner">
                <div className="epc-back-overview">
                    <span>Creating Project Content for</span>
                    <h3>Elegant Jewels</h3>
                </div>
                <div className="epc-edit-content">
                    {/* <div className="epc-btn cancel-content-btn">
                        <a href="#"><img src="/SVG/arrow-pc.svg" alt="cancel" />Cancel</a>
                    </div>
                    <div className="epc-btn edit-content-btn">
                        <a href="#"><img src="/SVG/edit.svg" alt="save" />Create Project</a>
                    </div> */}
                </div>
            </div>
        </section>
    );
};

export default CreateProjectHeader;
