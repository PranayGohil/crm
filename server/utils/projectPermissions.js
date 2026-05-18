// utils/projectPermissions.js

/**
 * Returns a MongoDB query filter for projects based on user's (Admin or Employee) stage permissions.
 * Super admins get no extra filters (empty query).
 * Others get projects where at least one stage matches their manage_stages.
 */
export const getProjectPermissionQuery = (user) => {
    if (!user) return { _id: null }; // No access if no user
    
    const role = user.role || (user.constructor?.modelName ? user.constructor.modelName.toLowerCase() : undefined);
    
    // Super admins have full access
    if (role === 'super-admin') return {};
    
    // Clients have access only to their own projects
    if (role === 'client') {
        return { client_id: user._id?.toString() };
    }
    
    // For others (Admins or Employees), check stage permissions OR project assignment
    return {
        $or: [
            { stages: { $in: user.manage_stages || [] } },
            { "assign_to.id": user._id?.toString() }
        ]
    };
};

/**
 * Checks if a user (Admin, Employee, or Client) has access to a specific project.
 * Super admins always have access.
 * Clients have access if the project belongs to them.
 * Others have access if they are assigned to the project or there's an intersection between project stages and manage_stages.
 */
export const canAdminAccessProject = (user, project) => {
    if (!user) return false;
    
    const role = user.role || (user.constructor?.modelName ? user.constructor.modelName.toLowerCase() : undefined);
    
    // Super admins always have access
    if (role === 'super-admin') return true;
    
    // Clients have access if the project belongs to them
    if (role === 'client') {
        return project.client_id?.toString() === user._id?.toString();
    }
    
    // Employees/Admins have access if they are explicitly assigned to the project
    const isAssigned = project.assign_to?.some(assignee => assignee.id?.toString() === user._id?.toString());
    if (isAssigned) return true;
    
    const userStages = user.manage_stages || [];
    const projectStages = project.stages || [];
    
    // Check if any stage in project matches user's allowed stages
    return projectStages.some(stage => userStages.includes(stage));
};
