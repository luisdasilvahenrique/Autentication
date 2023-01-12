import { createContext, ReactNode, useState } from "react";
import Router from "next/router";
import { api } from "../service/api";

type User = {
    email: string;
    permissions: string;
    roles: string;
};

type SingInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    singIn(credentials: SingInCredentials): Promise<void>;
    user: User | undefined;
    isAuthenticated: boolean;
}

type AuthProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;

    async function singIn({ email, password }: SingInCredentials){
        try {
            const response = await api.post('sessions', {
                email,
                password,
            })
            
            const { token, refreshToken ,permissions, roles } = response.data;

            setUser({
                email,
                permissions,
                roles,
            });
            
            Router.push('/dashboard')
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <AuthContext.Provider value={{ singIn, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
        
    )
}