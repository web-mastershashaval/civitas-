import { useState, useEffect } from 'react';
import { communityService, ledgerService } from '../services/api';
import { useParams } from 'react-router-dom';

export function useSubBoard(subBoardId: string | undefined) {
    const { id: communityId } = useParams();
    const [subBoard, setSubBoard] = useState<any>(null);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!subBoardId || !communityId) return;
        try {
            setLoading(true);
            const [subResponse, discResponse] = await Promise.all([
                communityService.getSubBoard(subBoardId, communityId),
                ledgerService.getDiscussions(subBoardId, communityId)
            ]);
            setSubBoard(subResponse.data);
            setDiscussions(discResponse.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Sub-board load failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [subBoardId, communityId]);

    return { subBoard, discussions, loading, error, refresh: fetchData };
}
