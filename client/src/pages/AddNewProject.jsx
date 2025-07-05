import React from 'react';
import ProjectViewTopBar from '../components/ProjectViewTopBar';
import AddNewProjectForm from '../components/AddNewProjectForm';

const AddNewProject = () => {
    return (
        <div className="add_new_project_page">
            <ProjectViewTopBar />
            <AddNewProjectForm />
        </div>
    );
};

export default AddNewProject;
