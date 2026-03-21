import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
    id: string;
    username: string;
    role: string;
    email?: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    facebook_profile?: string;
    has_completed_orientation: boolean;
    reputation_score?: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, refresh: string, role: string, user: User) => void;
    signIn: (usernameOrEmail: string, password: string) => Promise<User>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('civitas_token'));
    const [isLoading, setIsLoading] = useState(true);

    const login = (accessToken: string, refresh: string, role: string, userData: User) => {
        localStorage.setItem('civitas_token', accessToken);
        localStorage.setItem('civitas_refresh', refresh);
        localStorage.setItem('civitas_role', role);
        setToken(accessToken);
        setUser(userData);
    };

    const signIn = async (usernameOrEmail: string, password: string): Promise<User> => {
        const response = await api.post('/token/', { username: usernameOrEmail, password });
        const { access, refresh } = response.data;

        // Store token immediately so the interceptor uses the new token
        localStorage.setItem('civitas_token', access);
        localStorage.setItem('civitas_refresh', refresh);
        setToken(access);

        // Fetch user info to get role (interceptor will now use the new token)
        const userResponse = await api.get('/users/me/');
        const userData = userResponse.data;

        // Update user state and role
        localStorage.setItem('civitas_role', userData.role);
        setUser(userData);

        return userData;
    };

    const logout = () => {
        localStorage.removeItem('civitas_token');
        localStorage.removeItem('civitas_refresh');
        localStorage.removeItem('civitas_role');
        setToken(null);
        setUser(null);
    };

    const checkAuth = async () => {
        const storedToken = localStorage.getItem('civitas_token');
        if (!storedToken) {
            setIsLoading(false);
            return;
        }

        try {
            // Use the existing api instance which has the interceptor
            const response = await api.get('/users/me/');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to authenticate with stored token:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                signIn,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
