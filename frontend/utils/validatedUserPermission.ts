type User = {
    permissions: string[];
    roles: string[];
}

type validatedUserPermissionParams = {
    user: User;
    permissions?: string[];
    roles?: string[];
}

export function validatedUserPermission({ user, permissions, roles }: validatedUserPermissionParams) {

    if (permissions?.length > 0) {
        const hasAllPermissions = permissions.every(permission => {
            return user.permissions.includes(permission)
        });

        if (!hasAllPermissions) {
            return false;
        }
    }

    if (roles?.length > 0) {
        const hasAllRoles = roles.some(role => {
            return user.roles.includes(role)
        });

        if (!hasAllRoles) {
            return false;
        }
    }

    return true;
}