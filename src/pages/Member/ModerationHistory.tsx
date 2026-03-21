import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Shield, AlertTriangle, Clock, Trash2, ArrowRight, MessageSquare, History } from "lucide-react";
import api from "../../services/api";
import AppealForm from "../../components/features/AppealForm";

interface ModerationAction {
    id: number;
    action: 'WARN' | 'MUTE' | 'REMOVE' | 'RESTRICT';
    reason: string;
    rule: string;
    timestamp: string;
    duration?: string;
    is_active: boolean;
    has_appeal: boolean;
}

export function ModerationHistory() {
    const [actions, setActions] = useState<ModerationAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAction, setSelectedAction] = useState<ModerationAction | null>(null);
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/moderation-actions/');
            setActions(response.data.results || response.data);
        } catch (err) {
            setError("Failed to load your moderation history.");
        } finally {
            setLoading(false);
        }
    };

    const handleAppealClick = (action: ModerationAction) => {
        setSelectedAction(action);
        setIsAppealModalOpen(true);
    };

    const handleAppealSubmitted = () => {
        setIsAppealModalOpen(false);
        fetchHistory(); // Refresh to show "has_appeal" status
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="border-b border-[#2a2f3a] pb-8">
                <h1 className="text-3xl font-black text-[#e6e6e6] flex items-center gap-3">
                    <History className="w-8 h-8 text-[#4f8cff]" />
                    Transparency Record
                </h1>
                <p className="text-[#9aa0a6] text-xs mt-2 uppercase tracking-widest font-medium">
                    A complete audit of moderation actions applied to your account.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-2 border-[#4f8cff] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <Card className="bg-red-500/10 border-red-500/20">
                    <CardContent className="p-6 text-red-500 text-sm font-bold text-center">
                        {error}
                    </CardContent>
                </Card>
            ) : actions.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-[#2a2f3a] bg-[#161a20]/30">
                    <Shield className="w-16 h-16 mx-auto mb-6 text-green-500/20" />
                    <h3 className="text-[#e6e6e6] font-bold uppercase tracking-widest">Pristine Record</h3>
                    <p className="text-[10px] text-[#9aa0a6] uppercase tracking-widest mt-2">No protocol violations or moderation actions found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {actions.map((item) => (
                        <Card key={item.id} className="bg-[#161a20] border-[#2a2f3a] rounded-none overflow-hidden hover:border-[#4f8cff]/30 transition-colors">
                            <CardHeader className="p-4 border-b border-[#2a2f3a] flex flex-row items-center justify-between bg-gradient-to-r from-[#1a1e26] to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${item.action === 'WARN' ? 'bg-yellow-500/10 text-yellow-500' :
                                        item.action === 'MUTE' ? 'bg-orange-500/10 text-orange-500' :
                                            'bg-red-500/10 text-red-500'
                                        }`}>
                                        {item.action === 'WARN' && <AlertTriangle size={16} />}
                                        {item.action === 'MUTE' && <Clock size={16} />}
                                        {item.action === 'REMOVE' && <Trash2 size={16} />}
                                        {item.action === 'RESTRICT' && <Shield size={16} />}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-[#e6e6e6]">
                                            {item.action} {item.duration ? `(${item.duration})` : ''}
                                        </h4>
                                        <span className="text-[10px] text-[#9aa0a6] font-mono">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black uppercase px-2 py-1 bg-[#2a2f3a] text-[#4f8cff] tracking-tight">
                                    Rule: {item.rule}
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest font-black text-[#9aa0a6] mb-2">Protocol Reason:</p>
                                        <p className="text-sm text-[#e6e6e6] leading-relaxed italic border-l-2 border-[#4f8cff]/30 pl-4 py-1">
                                            "{item.reason}"
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-[#2a2f3a] flex justify-between items-center">
                                        <div className="flex gap-4">
                                            {item.is_active && (
                                                <div className="flex items-center gap-2 text-orange-500 text-[10px] font-black uppercase tracking-widest">
                                                    <Clock size={12} /> Active Inforce
                                                </div>
                                            )}
                                            {item.has_appeal && (
                                                <div className="flex items-center gap-2 text-[#4f8cff] text-[10px] font-black uppercase tracking-widest">
                                                    <MessageSquare size={12} /> Appeal Pending
                                                </div>
                                            )}
                                        </div>

                                        {!item.has_appeal && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAppealClick(item)}
                                                className="border-[#4f8cff]/30 text-[#4f8cff] hover:bg-[#4f8cff]/10 uppercase text-[9px] font-black tracking-widest h-9 px-4"
                                            >
                                                Submit Appeal <ArrowRight size={12} className="ml-2" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Appeal Modal */}
            {selectedAction && isAppealModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-xl">
                        <AppealForm
                            actionId={selectedAction.id}
                            ruleId={selectedAction.rule}
                            onCancel={() => setIsAppealModalOpen(false)}
                            onSuccess={handleAppealSubmitted}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ModerationHistory;
