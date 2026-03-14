import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach JWT token if available (but not for public endpoints)
api.interceptors.request.use((config) => {
    // List of public endpoints that don't need authentication
    const publicEndpoints = [
        '/users/register/',
        '/token/',
        '/token/refresh/'
    ];

    // Check if the current request is to a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
        config.url?.includes(endpoint)
    );

    // Only add token if not a public endpoint
    if (!isPublicEndpoint) {
        const token = localStorage.getItem('civitas_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

// Response interceptor to handle auth errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            const isAuthEndpoint = error.config.url?.includes('/token/');

            if (!isAuthEndpoint) {
                // Clear state and force redirect to login
                localStorage.removeItem('civitas_token');
                localStorage.removeItem('civitas_refresh');
                localStorage.removeItem('civitas_role');

                // Only redirect if not already on a landing or auth page to avoid loops
                if (!window.location.pathname.includes('/signin') &&
                    !window.location.pathname.includes('/signup') &&
                    window.location.pathname !== '/') {
                    window.location.href = '/signin?expired=true';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const communityService = {
    getCommunity: (id: string) => api.get(`/communities/${id}/`),
    getBoard: (id: string, communityId?: string) => api.get(`/boards/${id}/${communityId ? `?community=${communityId}` : ''}`),
    getBoards: (communityId: string) => api.get(`/boards/?community=${communityId}`),
    createBoard: (data: any) => {
        if (data instanceof FormData) {
            return api.post('/boards/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/boards/', data);
    },
    updateBoard: (id: string, data: any) => {
        if (data instanceof FormData) {
            return api.patch(`/boards/${id}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.patch(`/boards/${id}/`, data);
    },
    deleteBoard: (id: string) => api.delete(`/boards/${id}/`),
    getSubBoard: (id: string, communityId?: string) => api.get(`/sub-boards/${id}/${communityId ? `?community=${communityId}` : ''}`),
    createSubBoard: (data: any) => api.post('/sub-boards/', data),
    updateSubBoard: (id: string, data: any) => api.patch(`/sub-boards/${id}/`, data),
    deleteSubBoard: (id: string) => api.delete(`/sub-boards/${id}/`),
    addFacilitator: (communityId: string, username: string) => api.post(`/communities/${communityId}/add_facilitator/`, { username }),
    joinCommunity: (communityId: string) => api.post(`/communities/${communityId}/join/`),
    respondToApplication: (communityId: string, username: string, approve: boolean) => api.post(`/communities/${communityId}/respond_to_application/`, { username, approve }),
    updateCommunity: (communityId: string, data: any) => {
        if (data instanceof FormData) {
            return api.patch(`/communities/${communityId}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.patch(`/communities/${communityId}/`, data);
    },
};

export const userService = {
    getMe: () => api.get('/users/me/'),
    updateProfile: (data: FormData) => api.patch('/users/me/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    completeOrientation: () => api.post('/users/complete_orientation/'),
};

export const ledgerService = {
    getDiscussion: (id: string, communityId?: string) => api.get(`/discussions/${id}/${communityId ? `?community=${communityId}` : ''}`),
    getDiscussions: (subBoardId: string, communityId?: string) => api.get(`/discussions/?sub_board=${subBoardId}${communityId ? `&community=${communityId}` : ''}`),
    createDiscussion: (data: any) => {
        if (data instanceof FormData) {
            return api.post('/discussions/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/discussions/', data);
    },
    updateDiscussion: (id: string, data: any) => {
        if (data instanceof FormData) {
            return api.patch(`/discussions/${id}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.patch(`/discussions/${id}/`, data);
    },
    createResponse: (data: any) => api.post('/responses/', data),
    getEntries: () => api.get('/audit-logs/'),
};

export const notificationService = {
    getNotifications: () => api.get('/notifications/'),
    markAsRead: (id: string) => api.post(`/notifications/${id}/mark_as_read/`),
    markAllAsRead: () => api.post('/notifications/mark_all_as_read/'),
};

export const followService = {
    toggleFollow: (contentType: string, objectId: string) => api.post('/follows/toggle/', { content_type: contentType, object_id: objectId }),
    getFollowStatus: (contentType: string, objectId: string) => api.get(`/follows/status/?content_type=${contentType}&object_id=${objectId}`),
};

export const governanceService = {
    // Board Types
    getBoardTypes: () => api.get('/board-types/'),
    getBoardTypeTerms: (boardTypeId?: string) => api.get(`/board-type-terms/${boardTypeId ? `?board_type=${boardTypeId}` : ''}`),

    // Reports
    createReport: (data: any) => api.post('/reports/', data),
    getReports: () => api.get('/reports/'),
    updateReport: (id: string, data: any) => api.patch(`/reports/${id}/`, data),

    // Moderation Actions
    createModerationAction: (data: any) => api.post('/moderation-actions/', data),
    getModerationActions: () => api.get('/moderation-actions/'),

    // Appeals
    createAppeal: (data: any) => api.post('/appeals/', data),
    getAppeals: () => api.get('/appeals/'),
    decideAppeal: (id: string, data: any) => api.post(`/appeals/${id}/decide/`, data),
};

export const voteService = {
    castVote: (contentType: 'DISCUSSION' | 'RESPONSE', objectId: string, voteType: 'UP' | 'DOWN') => 
        api.post('/votes/', { content_type: contentType, object_id: objectId, vote_type: voteType }),
};

export default api;
