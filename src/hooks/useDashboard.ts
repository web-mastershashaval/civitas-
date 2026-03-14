import { useState, useEffect } from 'react';
import api from '../services/api';

export function useDashboard() {
    const [communities, setCommunities] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [commResponse, auditResponse] = await Promise.all([
                api.get('/communities/?managed=true'),
                api.get('/audit-logs/?limit=4&result=BLOCKED')
            ]);

            setCommunities(commResponse.data.results || commResponse.data);
            setAuditLogs(auditResponse.data.results || auditResponse.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to sync dashboard authority.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const deleteCommunity = async (id: string) => {
        try {
            await api.delete(`/communities/${id}/`);
            await fetchDashboardData();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail };
        }
    };

    const stats = communities.reduce((acc, comm) => ({
        totalMembers: acc.totalMembers + (comm.members || 0),
        totalDiscussions: acc.totalDiscussions + (comm.activeDiscussions || 0),
        totalFlags: acc.totalFlags + (comm.pendingFlags || 0),
        totalPendingApplications: acc.totalPendingApplications + (comm.pending_applications?.length || 0)
    }), { totalMembers: 0, totalDiscussions: 0, totalFlags: 0, totalPendingApplications: 0 });

    return {
        communities,
        auditLogs,
        stats,
        loading,
        error,
        refresh: fetchDashboardData,
        deleteCommunity
    };
}
