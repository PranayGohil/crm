import React from "react";
import CreateProjectHeader from "../components/CreateProjectHeader";
import CreateProjectSummary from "../components/CreateProjectSummary";

const CreateProjectContent = () => {
    return (
        <section className="edit_project_content_container">
            <CreateProjectHeader />
            <CreateProjectSummary />
        </section>
    );
};

export default CreateProjectContent;
