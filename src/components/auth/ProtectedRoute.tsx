import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f1115]">
                <Loader2 className="w-10 h-10 animate-spin text-[#4f8cff]" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/signin" state={{ from: location }} replace />;
    }

    if (!user?.has_completed_orientation && location.pathname !== '/auth/governance-orientation') {
        return <Navigate to="/auth/governance-orientation" replace />;
    }

    if (allowedRoles && user) {
        // Normalize roles: MEMBER and CITIZEN are equivalents in this phase
        const normalizedUserRole = user.role.toUpperCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());

        const isAuthorized = normalizedAllowedRoles.includes(normalizedUserRole) ||
            (normalizedAllowedRoles.includes('MEMBER') && normalizedUserRole === 'CITIZEN') ||
            (normalizedAllowedRoles.includes('CITIZEN') && normalizedUserRole === 'MEMBER');

        if (!isAuthorized) {
            // Determine fallback based on broad category to avoid infinite loops
            const isFacilitator = normalizedUserRole === 'FACILITATOR' || normalizedUserRole === 'CO_FACILITATOR';
            const targetPath = isFacilitator ? '/facilitator/home' : '/member/home';

            // Only navigate if we're not already heading to the correct destination
            if (location.pathname !== targetPath) {
                return <Navigate to={targetPath} replace />;
            }
        }
    }

    return <>{children}</>;
};
