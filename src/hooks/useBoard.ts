import { useState, useEffect } from 'react';
import { communityService } from '../services/api';
import { useParams } from 'react-router-dom';

export function useBoard(boardId: string | undefined) {
    const { id: communityId } = useParams();
    const [board, setBoard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBoard = async () => {
        if (!boardId) return;
        try {
            setLoading(true);
            const response = await communityService.getBoard(boardId, communityId);
            setBoard(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Sector resolution failed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard();
    }, [boardId]);

    return { board, loading, error, refresh: fetchBoard };
}
