import React from "react";

const SubtaskActions = () => {
    // TODO: Replace with API call
    /*
    const buttons = [
      { label: "Cancel", className: "sms-reset-btn", href: "#" },
      { label: "Save Subtask", className: "sms-save-btn", href: "#" }
    ];
    */

    return (
        <section className="cnc-last-sec">
            <div className="sms-final_btns">
                <div className="cnc-btn sms-reset-btn">
                    <a href="#">Cancel</a>
                </div>
                <div className="cnc-btn sms-save-btn">
                    <a href="#">Save Subtask</a>
                </div>
            </div>
        </section>
    );
};

export default SubtaskActions;
