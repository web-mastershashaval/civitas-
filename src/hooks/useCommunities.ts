import { useState, useEffect } from 'react';
import api from '../services/api';

export function useCommunities(managed?: boolean, joined?: boolean) {
    const [communities, setCommunities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCommunities = async () => {
        try {
            setLoading(true);
            let endpoint = '/communities/';
            if (managed) endpoint += '?managed=true';
            else if (joined) endpoint += '?joined=true';

            const response = await api.get(endpoint);
            setCommunities(response.data.results || response.data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to fetch communities.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, [managed]);

    return { communities, loading, error, refresh: fetchCommunities };
}
