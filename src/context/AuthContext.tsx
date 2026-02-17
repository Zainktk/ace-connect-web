import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import api from '../services/api';
import type { User, Profile } from '../types';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateProfile: (profileData: Profile) => void;
    updateUser: (user: User) => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const response = await api.get('/auth/me');
                // The /me endpoint returns the user object directly (merged with profile)
                setUser(response.data);
                // Profile is essentially the same object in this app implementation, or we can separate if needed.
                // For now, syncing them.
                setProfile(response.data);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setUser(null);
                setProfile(null);
            }
        }
        setLoading(false);
    };

    const login = (token: string, userData: User) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        checkAuth(); // Fetch profile
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setProfile(null);
        window.location.href = '/login';
    };

    const updateProfile = (profileData: Profile) => {
        setProfile(profileData);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, login, logout, updateProfile, updateUser, checkAuth }}>
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
