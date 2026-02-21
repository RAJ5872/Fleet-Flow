/**
 * Role-Based Access Control — single source of truth
 *
 * manager       → everything
 * dispatcher    → fleet ops (vehicles, drivers, trips, maintenance, analytics)
 * safetyOfficer → fleet safety (vehicles, drivers, maintenance, analytics)
 * finance       → money (expenses, analytics)
 */

export const ROLE_PAGES = {
    manager: ['/', '/vehicles', '/drivers', '/trips', '/maintenance', '/expenses', '/analytics'],
    dispatcher: ['/', '/vehicles', '/drivers', '/trips', '/maintenance', '/analytics'],
    safetyOfficer: ['/', '/vehicles', '/drivers', '/analytics'],
    finance: ['/', '/expenses', '/analytics'],
};

/** Returns true if the given role can access the given path */
export function canAccess(role, path) {
    const allowed = ROLE_PAGES[role] || [];
    return allowed.includes(path);
}

/** Returns allowed paths for a role */
export function allowedPaths(role) {
    return ROLE_PAGES[role] || ['/'];
}
