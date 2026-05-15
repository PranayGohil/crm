// utils/projectPermissions.js

/**
 * Returns a MongoDB query filter for projects based on user's (Admin or Employee) stage permissions.
 * Super admins get no extra filters (empty query).
 * Others get projects where at least one stage matches their manage_stages.
 */
export const getProjectPermissionQuery = (user) => {
    if (!user) return { _id: null }; // No access if no user
    
    // Super admins have full access
    if (user.role === 'super-admin') return {};
    
    // For others (Admins or Employees), check stage permissions
    return {
        stages: { $in: user.manage_stages || [] }
    };
};

/**
 * Checks if a user (Admin or Employee) has access to a specific project.
 * Super admins always have access.
 * Others have access if there's an intersection between project stages and manage_stages.
 */
export const canAdminAccessProject = (user, project) => {
    if (!user) return false;
    
    // Super admins always have access
    if (user.role === 'super-admin') return true;
    
    const userStages = user.manage_stages || [];
    const projectStages = project.stages || [];
    
    // Check if any stage in project matches user's allowed stages
    return projectStages.some(stage => userStages.includes(stage));
};
