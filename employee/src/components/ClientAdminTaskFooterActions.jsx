import React from "react";

const ClientAdminTaskFooterActions = () => {
    return (
        <section className="pb-sec-8 pb-sec2">
            <div className="pb-sec8-inner pb-sec3-inner">
                <div className="pb-btns pb-edit-delete">
                    <div className="edit-profile">
                        <a href="#">
                            <img src="/SVG/edit.svg" alt="edit" />
                            Edit
                        </a>
                    </div>
                    <div className="css-delete_btn">
                        <a href="#" className="css-high css-delete">
                            <img src="/SVG/delete-vec.svg" alt="del" />
                            Delete Selected
                        </a>
                    </div>
                </div>
                <div className="pb-btns add-mbr">
                    <div className="cnc-btn sms-reset-btn">
                        <a href="#">Back to Task Board</a>
                    </div>
                    <div className="plus-icon">
                        <a href="#">
                            <span>Mark Complete</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ClientAdminTaskFooterActions;
