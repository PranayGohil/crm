
import React from 'react';

const EditMemberHeader = () => {
    return (
        <section className="page3-main1">
            <div className="member-profile-edit">
                <div className="pro-edit-vec">
                    <img src="/SVG/vec-mem-pro.svg" alt="vec" />
                    <span>Edit Team Member Profile</span>
                </div>
                <div className="cancel-changes">
                    <div className="cancel"><a href="#">Cancel</a></div>
                    <div className="save-changes"><a href="#">Save changes</a></div>
                </div>
            </div>
        </section>
    );
};

export default EditMemberHeader;

