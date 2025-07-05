import React from 'react';

const EditProjectHeader = () => {
    return (
        <section className="epc-header">
            <div className="epc-header-inner">
                <div className="epc-back-overview">
                    <span>Editing Project Content for</span>
                    <h3>Elegant Jewels</h3>
                </div>
                <div className="epc-edit-content">
                    {/* <div className="epc-btn cancel-content-btn">
                        <a href="#"><img src="/SVG/arrow-pc.svg" alt="edit" />Cancel Edit</a>
                    </div>
                    <div className="epc-btn edit-content-btn">
                        <a href="#"><img src="/SVG/edit.svg" alt="edit" />Save Changes</a>
                    </div> */}
                </div>
            </div>
        </section>
    );
};

export default EditProjectHeader;

