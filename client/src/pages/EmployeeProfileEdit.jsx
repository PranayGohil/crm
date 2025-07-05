import React from "react";
import EditMemberHeader from "../components/EditMemberHeader";
import ProfileUpdateSection from "../components/ProfileUpdateSection";
import PersonalProfessionalDetails from "../components/PersonalProfessionalDetails";
import LoginSecuritySettings from "../components/LoginSecuritySettings";
import DeleteAccount from "../components/DeleteAccount";

const EmployeeProfileEdit = () => {
    return (
        <section className="employee_profile_edit_container">
            <EditMemberHeader />
            <ProfileUpdateSection />
            <PersonalProfessionalDetails />
            <LoginSecuritySettings />
            <DeleteAccount />
        </section>
    );
};

export default EmployeeProfileEdit;
