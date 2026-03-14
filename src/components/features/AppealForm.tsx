import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { governanceService } from '../../services/api';
import { MessageSquare, Send, X, AlertCircle } from 'lucide-react';

interface AppealFormProps {
    actionId: number;
    ruleId: string;
    onCancel: () => void;
    onSuccess: () => void;
}

const AppealForm: React.FC<AppealFormProps> = ({ actionId, ruleId, onCancel, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await governanceService.createAppeal({
                moderation_action: actionId,
                reason: reason
            });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit appeal. You may already have a pending appeal for this action.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-2xl">
            <CardHeader className="border-b border-[#2a2f3a] p-6 flex flex-row justify-between items-center">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#e6e6e6] flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#4f8cff]" /> submit appeal
                    </h3>
                    <p className="text-[10px] text-[#9aa0a6] uppercase tracking-widest font-bold mt-1">
                        Contesting Protocol Rule: <span className="text-[#4f8cff]">{ruleId}</span>
                    </p>
                </div>
                <button onClick={onCancel} className="text-[#9aa0a6] hover:text-[#e6e6e6] transition-colors">
                    <X size={20} />
                </button>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-[#4f8cff]/5 border border-[#4f8cff]/10 p-4">
                        <p className="text-[10px] text-[#9aa0a6] leading-relaxed italic">
                            Pursuant to **SR-22**, every member maintains the right to contest protocol enforcement.
                            Please provide a clear factual basis for why this action should be rescinded.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest font-black text-[#9aa0a6]">
                            Basis for Appeal
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe factual inconsistencies or rule misapplications..."
                            className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3 text-xs text-[#e6e6e6] h-32 focus:border-[#4f8cff] outline-none transition-colors resize-none"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-black flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 border border-[#2a2f3a] text-[#9aa0a6] uppercase text-[9px] font-black tracking-widest h-12"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-2 bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black uppercase tracking-[0.2em] text-[10px] h-12 px-8"
                        >
                            {loading ? "TRANSMITTING..." : "SUBMIT APPEAL"}
                            <Send className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default AppealForm;
