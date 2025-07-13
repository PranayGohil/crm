import React from "react";
// import ClientOverviewHeader from "../components/ClientOverviewHeader";
import ClientAdminProjectContentHeader from "../components/ClientAdminProjectContentHeader";
import ClientAdminProjectPricingSection from "../components/ClientAdminProjectPricingSection";
import ClientAdminContentIncludedSection from "../components/ClientAdminContentIncludedSection";
import ClientAdminProjectNotesSection from "../components/ClientAdminProjectNotesSection";
import ClientAdminMediaPreviewSection from "../components/ClientAdminMediaPreviewSection";

const ClientAdminProjectContent = () => {
    return (
        <section className="pc_admin">
            {/* <ClientOverviewHeader /> */}
            <ClientAdminProjectContentHeader />
            <ClientAdminProjectPricingSection />
            <ClientAdminContentIncludedSection />
            <ClientAdminProjectNotesSection />
            <ClientAdminMediaPreviewSection />
        </section>
    );
};

export default ClientAdminProjectContent;
