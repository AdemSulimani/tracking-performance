import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

interface RegisterData {
    companyType: string;
    name: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const currentUser = apiClient.getCurrentUser();
        if (currentUser && apiClient.isAuthenticated()) {
            setUser(currentUser);
        }
        setIsLoading(false);
    }, []);

    const getDashboardPath = (companyType: string): string => {
        const dashboardMap: Record<string, string> = {
            'sales': '/sales',
            'real-estate': '/real-estate',
            'telemarketing': '/telemarketing',
            'agency': '/agency'
        };
        return dashboardMap[companyType] || '/';
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.login(email, password);
            setUser(response.user);
            // Redirect to user's dashboard based on company type
            const dashboardPath = getDashboardPath(response.user.companyType);
            // 2 second delay to show loading spinner
            setTimeout(() => {
                window.location.href = dashboardPath;
            }, 2000);
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await apiClient.register(data);
            setUser(response.user);
            // Component will handle redirect with delay
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        apiClient.logout();
        setUser(null);
        // Use window.location for navigation to avoid useNavigate hook issues
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

