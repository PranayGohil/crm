// constants.js
export const BRANDS = ['Mukhwas', 'Breeliq'];

// Business types a super-admin can assign. 'Maulshree' = the main CRM,
// 'Mukhwas'/'Breeliq' = sales-only panels.
export const BUSINESS_TYPES = ['Maulshree', 'Mukhwas', 'Breeliq'];
export const MAULSHREE = 'Maulshree';

// Effective business types for an admin. Falls back to the legacy
// sales_permissions for admins created before business_types existed (or not
// yet migrated): if they had sales permissions they're treated as sales-only,
// otherwise as a Maulshree (main CRM) admin. This avoids locking anyone out
// before the migration script runs.
export const getBusinessTypes = (user) => {
    if (!user) return [];
    if (user.role === 'super-admin') return BUSINESS_TYPES;

    const types = user.business_types || [];
    if (types.length > 0) return types;

    // Legacy fallback
    const sp = user.sales_permissions || [];
    const legacy = [];
    if (sp.includes('manage_mukhwas_sales')) legacy.push('Mukhwas');
    if (sp.includes('manage_breeliq_sales')) legacy.push('Breeliq');
    return legacy.length > 0 ? legacy : [MAULSHREE];
};

// Helpers for reading an admin's access off the user object.
export const hasMaulshreeAccess = (user) =>
    user?.role === 'super-admin' || getBusinessTypes(user).includes(MAULSHREE);

export const getSalesBrands = (user) => {
    if (user?.role === 'super-admin') return BRANDS;
    return getBusinessTypes(user).filter((t) => BRANDS.includes(t));
};

export const hasSalesAccess = (user) => getSalesBrands(user).length > 0;

// Filter a list of stage names down to what the logged-in user may see.
// super-admin (or admin with no stage restriction) → all; otherwise only their stages.
export const filterStagesForUser = (user, stages) => {
    if (!user || user.role === 'super-admin') return stages;
    const allowed = user.manage_stages || [];
    if (allowed.length === 0) return stages; // empty = all stages
    return stages.filter((s) => allowed.includes(s));
};
export const SALES_PERMISSIONS = {
    MUKHWAS: 'manage_mukhwas_sales',
    BREELIQ: 'manage_breeliq_sales'
};
export const PROJECT_STAGES = [
    "CAD Design",
    "SET Design",
    "Render"
];
