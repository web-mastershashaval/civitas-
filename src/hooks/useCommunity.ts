import { useState, useEffect } from 'react';
import { communityService } from '../services/api';

export function useCommunity(id: string | undefined) {
    const [community, setCommunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCommunity = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await communityService.getCommunity(id);
            setCommunity(response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to resolve community context.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunity();
    }, [id]);

    const createBoard = async (data: any) => {
        try {
            let submissionData = data;
            if (!(data instanceof FormData)) {
                const ref = `B-${data.name.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 100)}`;
                submissionData = { ...data, ref, community: id! };
            }
            await communityService.createBoard(submissionData);
            await fetchCommunity(); // Refresh
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail };
        }
    };

    const updateBoard = async (boardId: string, data: any) => {
        try {
            await communityService.updateBoard(boardId, data);
            await fetchCommunity();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail };
        }
    };

    const deleteBoard = async (boardId: string) => {
        try {
            await communityService.deleteBoard(boardId);
            await fetchCommunity();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail };
        }
    };

    const addFacilitator = async (username: string) => {
        try {
            await communityService.addFacilitator(id!, username);
            await fetchCommunity();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail || 'Failed to add facilitator.' };
        }
    };

    const createSubBoard = async (boardId: string, data: any) => {
        try {
            await communityService.createSubBoard({ ...data, board: boardId });
            await fetchCommunity();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail };
        }
    };

    const updateSubBoard = async (subBoardId: string, data: any) => {
        try {
            await communityService.updateSubBoard(subBoardId, data);
            await fetchCommunity();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail };
        }
    };

    const deleteSubBoard = async (subBoardId: string) => {
        try {
            await communityService.deleteSubBoard(subBoardId);
            await fetchCommunity();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail };
        }
    };

    const respondToApplication = async (username: string, approve: boolean) => {
        try {
            await communityService.respondToApplication(id!, username, approve);
            await fetchCommunity();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail || 'Protocol resolution failed.' };
        }
    };

    const updateCommunity = async (data: any) => {
        try {
            await communityService.updateCommunity(id!, data);
            await fetchCommunity();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.response?.data?.detail || 'Update failed.' };
        }
    };

    return {
        community,
        loading,
        error,
        refresh: fetchCommunity,
        createBoard,
        updateBoard,
        deleteBoard,
        createSubBoard,
        updateSubBoard,
        deleteSubBoard,
        addFacilitator,
        respondToApplication,
        updateCommunity,
        setCommunity // For direct state manipulation if needed during transitions
    };
}
