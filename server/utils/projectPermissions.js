// utils/projectPermissions.js
//
// Central source of truth for stage-based access control (RBAC) across the
// Maulshree CRM. Rules:
//   - super-admin            -> full access, no stage filter
//   - admin (Maulshree)      -> restricted to its manage_stages.
//                               * empty manage_stages = ALL stages (per the UI:
//                                 "Leave empty for all stages")
//                               * records with NO stage are visible to ALL admins
//   - employee               -> existing self-scope (assigned + manage_stages),
//                               behavior preserved (do NOT widen to "all")
//   - client                 -> only its own records
//
// Each entity links to a stage differently:
//   - Project : `stages` (array of stage names)
//   - SubTask : inherits via its project; also has its own `stages`
//   - Client  : `stages` (array of stage names its projects use)
//   - Employee: `manage_stages` (array of stage names it can work on)

const getActorRole = (user) =>
    user?.role || (user?.constructor?.modelName ? user.constructor.modelName.toLowerCase() : undefined);

// True when this admin's stage scope is "all" (super-admin, or admin with no
// manage_stages restriction).
const hasAllStages = (user) => {
    const role = getActorRole(user);
    if (role === 'super-admin') return true;
    if (role === 'admin' && (user.manage_stages || []).length === 0) return true;
    return false;
};

/**
 * MongoDB filter for PROJECT access by stage.
 */
export const getProjectPermissionQuery = (user) => {
    if (!user) return { _id: null };

    const role = getActorRole(user);
    if (role === 'super-admin') return {};
    if (role === 'client') return { client_id: user._id?.toString() };

    const stages = user.manage_stages || [];

    // Admin with no restriction sees everything.
    if (role === 'admin' && stages.length === 0) return {};

    const or = [
        { stages: { $in: stages } },
        { "assign_to.id": user._id?.toString() },
    ];

    // No-stage records are visible to all Maulshree admins.
    if (role === 'admin') {
        or.push({ stages: { $size: 0 } });
        or.push({ stages: { $exists: false } });
    }

    return { $or: or };
};

/**
 * MongoDB filter for CLIENT access by stage (client.stages overlaps admin stages).
 * Employees/clients are returned unfiltered here (their own controllers self-scope).
 */
export const getClientStageQuery = (user) => {
    if (!user) return { _id: null };
    if (getActorRole(user) !== 'admin') return {}; // super-admin / employee / client unaffected
    if (hasAllStages(user)) return {};

    const stages = user.manage_stages || [];
    return {
        $or: [
            { stages: { $in: stages } },
            { stages: { $size: 0 } },
            { stages: { $exists: false } },
        ],
    };
};

/**
 * MongoDB filter for EMPLOYEE access by stage (employee.manage_stages overlaps).
 */
export const getEmployeeStageQuery = (user) => {
    if (!user) return { _id: null };
    if (getActorRole(user) !== 'admin') return {};
    if (hasAllStages(user)) return {};

    const stages = user.manage_stages || [];
    return {
        $or: [
            { manage_stages: { $in: stages } },
            { manage_stages: { $size: 0 } },
            { manage_stages: { $exists: false } },
        ],
    };
};

/**
 * Checks if a user has access to a specific project (used for write authorization).
 */
export const canAdminAccessProject = (user, project) => {
    if (!user || !project) return false;

    const role = getActorRole(user);
    if (role === 'super-admin') return true;
    if (role === 'client') return project.client_id?.toString() === user._id?.toString();

    // Explicit assignment always grants access.
    const isAssigned = project.assign_to?.some(a => a.id?.toString() === user._id?.toString());
    if (isAssigned) return true;

    const stages = user.manage_stages || [];
    const projectStages = project.stages || [];

    if (role === 'admin') {
        if (stages.length === 0) return true;        // all stages
        if (projectStages.length === 0) return true; // no-stage record visible to all
    }

    return projectStages.some(stage => stages.includes(stage));
};

/**
 * Whether `user` may act on records belonging to `stages` (write authorization).
 * Used when creating/editing so an admin can't assign stages outside their scope.
 * @param {Object} user
 * @param {string[]} stages - the stage names being assigned/affected
 */
export const canManageStages = (user, stages = []) => {
    const role = getActorRole(user);
    if (role === 'super-admin') return true;
    if (role !== 'admin') return true; // employees/clients handled by their own rules
    if (hasAllStages(user)) return true;

    const allowed = user.manage_stages || [];
    const list = Array.isArray(stages) ? stages : [stages];
    // No-stage records are shared, so an empty stage list is allowed.
    if (list.length === 0) return true;
    return list.every(stage => allowed.includes(stage));
};

/**
 * Whether `user` may access a client record (by its stages).
 */
export const canAdminAccessClient = (user, client) => {
    if (!user || !client) return false;
    const role = getActorRole(user);
    if (role === 'super-admin') return true;
    if (role !== 'admin') return true;
    if (hasAllStages(user)) return true;

    const stages = user.manage_stages || [];
    const clientStages = client.stages || [];
    if (clientStages.length === 0) return true; // shared
    return clientStages.some(stage => stages.includes(stage));
};

/**
 * Overlap-based access check against a record's stage list, enforced for ADMINS
 * ONLY. super-admin/employee/client pass through unchanged so this can be safely
 * dropped into endpoints shared with the employee/client portals.
 * @param {Object} user
 * @param {string[]} recordStages - stage names attached to the record
 */
export const canAdminAccessByStages = (user, recordStages = []) => {
    const role = getActorRole(user);
    if (role !== 'admin') return true;   // super-admin / employee / client unaffected
    if (hasAllStages(user)) return true;

    const stages = user.manage_stages || [];
    const list = recordStages || [];
    if (list.length === 0) return true;  // no-stage record is shared
    return list.some(stage => stages.includes(stage));
};

/**
 * Whether `user` may access an employee record (by its manage_stages).
 */
export const canAdminAccessEmployee = (user, employee) => {
    if (!user || !employee) return false;
    const role = getActorRole(user);
    if (role === 'super-admin') return true;
    if (role !== 'admin') return true;
    if (hasAllStages(user)) return true;

    const stages = user.manage_stages || [];
    const empStages = employee.manage_stages || [];
    if (empStages.length === 0) return true; // shared
    return empStages.some(stage => stages.includes(stage));
};
