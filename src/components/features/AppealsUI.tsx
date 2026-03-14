import React, { useState, useEffect } from 'react';
import { governanceService } from '../../services/api';
import { Button } from '../ui/Button';

interface Appeal {
    id: string;
    moderation_action: string;
    appeal_reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    decision_reason?: string;
    created_at: string;
}

interface ModerationAction {
    id: string;
    action: string;
    reason: string;
    created_at: string;
    content_type?: string;
}

const AppealsUI: React.FC = () => {
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [actions, setActions] = useState<ModerationAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [appealReason, setAppealReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [appealsRes, actionsRes] = await Promise.all([
                governanceService.getAppeals(),
                governanceService.getModerationActions()
            ]);
            setAppeals(appealsRes.data);
            setActions(actionsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAppealSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAction) return;

        setSubmitting(true);
        setMessage(null);

        try {
            await governanceService.createAppeal({
                moderation_action: selectedAction,
                appeal_reason: appealReason
            });
            setMessage({ type: 'success', text: 'Appeal submitted successfully.' });
            setSelectedAction(null);
            setAppealReason('');
            fetchData(); // Refresh list
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to submit appeal.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Filter actions that haven't been appealed yet
    const appealableActions = actions.filter(action =>
        !appeals.some(appeal => appeal.moderation_action === action.id)
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            {/* New Appeal Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Submit an Appeal</h3>
                {appealableActions.length === 0 ? (
                    <p className="text-gray-500">You have no new moderation actions to appeal.</p>
                ) : (
                    <form onSubmit={handleAppealSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Action to Appeal
                            </label>
                            <select
                                value={selectedAction || ''}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                                required
                            >
                                <option value="">-- Select an action --</option>
                                {appealableActions.map(action => (
                                    <option key={action.id} value={action.id}>
                                        {action.action} - {new Date(action.created_at).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedAction && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for Appeal
                                </label>
                                <textarea
                                    value={appealReason}
                                    onChange={(e) => setAppealReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 h-24"
                                    placeholder="Explain why this action should be reversed..."
                                    required
                                />
                            </div>
                        )}

                        {message && (
                            <div className={`p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <Button type="submit" disabled={!selectedAction || submitting}>
                            {submitting ? 'Submitting...' : 'Submit Appeal'}
                        </Button>
                    </form>
                )}
            </div>

            {/* Appeal History */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Appeal History</h3>
                {appeals.length === 0 ? (
                    <p className="text-gray-500">No appeals found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appeal Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appeals.map(appeal => (
                                    <tr key={appeal.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(appeal.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${appeal.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    appeal.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {appeal.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {appeal.appeal_reason}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {appeal.decision_reason || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppealsUI;
