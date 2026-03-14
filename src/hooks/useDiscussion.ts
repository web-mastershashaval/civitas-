import { useState, useEffect } from 'react';
import { ledgerService } from '../services/api';
import { useParams } from 'react-router-dom';

export function useDiscussion(discussionId: string | undefined) {
    const { id: communityId } = useParams();
    const [discussion, setDiscussion] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDiscussion = async () => {
        if (!discussionId) return;
        try {
            setLoading(true);
            const response = await ledgerService.getDiscussion(discussionId, communityId);
            setDiscussion(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Post load failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscussion();
    }, [discussionId]);

    const submitResponse = async (type: string, content: string) => {
        try {
            await ledgerService.createResponse({
                discussion: discussionId,
                type,
                content
            });
            await fetchDiscussion(); // Refresh ledger
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail };
        }
    };

    const updateDiscussion = async (data: FormData) => {
        if (!discussionId) return { success: false, error: 'Discussion ID missing' };
        try {
            await ledgerService.updateDiscussion(discussionId, data);
            await fetchDiscussion();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail || 'Update failed' };
        }
    };

    return {
        discussion,
        loading,
        error,
        submitResponse,
        updateDiscussion,
        refresh: fetchDiscussion
    };
}
