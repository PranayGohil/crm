import React from "react";
import CreateClientHeader from "../components/CreateClientHeader";
import ClientForm from "../components/ClientForm";
import SubtaskActions from "../components/SubtaskActions";

const CreateNewClient = () => {
    return (
        <>
            <CreateClientHeader />
            <ClientForm />
            <SubtaskActions />
        </>
    );
};

export default CreateNewClient;
