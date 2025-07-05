import React from "react";
import ClientOverviewHeader from "../components/ClientOverviewHeader";
import ProjectContentHeader from "../components/ProjectContentHeader";
import ProjectPricingSection from "../components/ProjectPricingSection";
import ContentIncludedSection from "../components/ContentIncludedSection";
import ProjectNotesSection from "../components/ProjectNotesSection";
import MediaPreviewSection from "../components/MediaPreviewSection";

const ProjectContent = () => {
    return (
        <section className="pc">
            <ClientOverviewHeader />
            <ProjectContentHeader />
            <ProjectPricingSection />
            <ContentIncludedSection />
            <ProjectNotesSection />
            <MediaPreviewSection />
        </section>
    );
};

export default ProjectContent;
