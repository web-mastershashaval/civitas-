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
            fetchData();
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to submit appeal.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const appealableActions = actions.filter(action =>
        !appeals.some(appeal => appeal.moderation_action === action.id)
    );

    if (loading) return (
        <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4f8cff]"></div>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* New Appeal Section */}
            <div className="bg-[#161a20] border border-[#2a2f3a] p-8">
                <h3 className="text-sm md:text-base uppercase tracking-[0.3em] font-black text-[#e6e6e6] mb-8">Submit Redress Appeal</h3>
                {appealableActions.length === 0 ? (
                    <p className="text-[#9aa0a6] text-xs uppercase tracking-widest italic">No pending moderation outcomes available for appeal.</p>
                ) : (
                    <form onSubmit={handleAppealSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-[#9aa0a6]">
                                Subject Outcome
                            </label>
                            <select
                                value={selectedAction || ''}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]/50 rounded-none"
                                required
                            >
                                <option value="" className="bg-[#0f1115]">Select an outcome...</option>
                                {appealableActions.map(action => (
                                    <option key={action.id} value={action.id} className="bg-[#0f1115]">
                                        {action.action} - {new Date(action.created_at).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedAction && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="block text-[10px] uppercase font-black tracking-widest text-[#9aa0a6]">
                                    Justification for Review
                                </label>
                                <textarea
                                    value={appealReason}
                                    onChange={(e) => setAppealReason(e.target.value)}
                                    className="w-full bg-[#0f1115] border border-[#2a2f3a] p-4 text-sm text-[#e6e6e6] h-32 focus:outline-none focus:border-[#4f8cff]/50 rounded-none italic"
                                    placeholder="Provide detailed context for the review request..."
                                    required
                                />
                            </div>
                        )}

                        {message && (
                            <div className={`p-4 text-[10px] uppercase tracking-widest font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={!selectedAction || submitting}
                            className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-black font-black uppercase tracking-[0.2em] text-[10px] h-11 px-8 rounded-none transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Transmitting...' : 'Commit Appeal'}
                        </Button>
                    </form>
                )}
            </div>

            {/* Appeal History */}
            <div className="bg-[#161a20] border border-[#2a2f3a] p-8">
                <h3 className="text-sm md:text-base uppercase tracking-[0.3em] font-black text-[#e6e6e6] mb-8">Redress History</h3>
                {appeals.length === 0 ? (
                    <p className="text-[#9aa0a6] text-xs uppercase tracking-widest italic">No existing redress records found in the ledger.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#2a2f3a]">
                                    <th className="py-4 text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">Timestamp</th>
                                    <th className="py-4 text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">Status</th>
                                    <th className="py-4 text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">Reason</th>
                                    <th className="py-4 text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">Outcome</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2f3a]/30">
                                {appeals.map(appeal => (
                                    <tr key={appeal.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 text-xs font-bold text-[#e6e6e6]">
                                            {new Date(appeal.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-tighter rounded-sm border
                                                ${appeal.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                    appeal.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                {appeal.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-xs text-[#9aa0a6] max-w-xs truncate italic">
                                            {appeal.appeal_reason}
                                        </td>
                                        <td className="py-4 text-xs text-[#e6e6e6] font-medium">
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
