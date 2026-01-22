import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredCompanyType?: string;
}

// Function to get dashboard path based on company type
export function getDashboardPath(companyType: string): string {
    const dashboardMap: Record<string, string> = {
        'sales': '/sales',
        'real-estate': '/real-estate',
        'telemarketing': '/telemarketing',
        'agency': '/agency'
    };
    return dashboardMap[companyType] || '/';
}

export function ProtectedRoute({ children, requiredCompanyType }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Show loading while checking authentication
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // Kontrollo nëse ka pendingVerificationEmail në localStorage
    const pendingVerificationEmail = localStorage.getItem('pendingVerificationEmail');
    
    // Nëse ka pendingVerificationEmail dhe nuk ka token, ridrejto në /authentication
    if (pendingVerificationEmail && !isAuthenticated) {
        return <Navigate to="/authentication" replace />;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // If route requires specific company type, check if user has access
    if (requiredCompanyType && user.companyType !== requiredCompanyType) {
        // Redirect to user's own dashboard
        const userDashboard = getDashboardPath(user.companyType);
        return <Navigate to={userDashboard} replace />;
    }

    return <>{children}</>;
}

