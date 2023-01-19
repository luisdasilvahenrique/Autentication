import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { validatedUserPermission } from "../utils/validatedUserPermission";

type useCanParams = {
    permissions?: string[];
    roles?: string[]; 
}

export function useCan({ permissions, roles}: useCanParams){
    const { user, isAuthenticated } = useContext(AuthContext)

    if(!isAuthenticated){
        return false;
    }

    const userHasValidPermissions = validatedUserPermission({
        // @ts-ignore
        user, 
        permissions,
        roles
    })

    return userHasValidPermissions;
}