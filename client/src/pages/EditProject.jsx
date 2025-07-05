import React from 'react';
import ProjectViewTopBarEdit from '../components/ProjectViewTopBarEdit';
import EditProjectForm from '../components/EditProjectForm';

const EditProject = () => {
    return (
        <div className="edit_project_page">
            <ProjectViewTopBarEdit />
            <EditProjectForm />
        </div>
    );
};

export default EditProject;
