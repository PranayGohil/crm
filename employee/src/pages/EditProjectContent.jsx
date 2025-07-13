import React from "react";
import EditProjectHeader from "../components/EditProjectHeader";
import EditableJewelrySummary from "../components/EditableJewelrySummary";

const EditProjectContent = () => {
    return (
        <section className="edit_project_content_container">
            <EditProjectHeader />
            <EditableJewelrySummary />
        </section>
    );
};

export default EditProjectContent;
