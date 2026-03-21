import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { governanceService } from '../../services/api';
import { Shield, AlertTriangle, Clock, Trash2, Send } from 'lucide-react';
import { useToast } from '../ui/Toast';

interface ModerationActionFormProps {
    targetUserId: string;
    targetUsername: string;
    contentType?: 'DISCUSSION' | 'RESPONSE';
    objectId?: string;
    onActionCompleted?: () => void;
}

const ModerationActionForm: React.FC<ModerationActionFormProps> = ({
    targetUserId,
    targetUsername,
    contentType,
    objectId,
    onActionCompleted
}) => {
    const { showToast } = useToast();
    const [action, setAction] = useState<'WARN' | 'MUTE' | 'REMOVE' | 'RESTRICT'>('WARN');
    const [reason, setReason] = useState('');
    const [ruleId, setRuleId] = useState('');
    const [duration, setDuration] = useState('24h');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await governanceService.createModerationAction({
                target_user: targetUserId,
                content_type: contentType,
                object_id: objectId,
                action: action,
                reason: reason,
                rule: ruleId || undefined,
                duration: action === 'MUTE' ? duration : undefined
            });

            showToast(`Protocol enforced against ${targetUsername}.`, "success");
            setSuccess(true);
            if (onActionCompleted) onActionCompleted();
        } catch (err: any) {
            const detail = err.response?.data?.detail || 'Failed to issue moderation action.';
            showToast(detail, "error");
            setError(detail);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="bg-green-500/10 border-green-500/30 rounded-none">
                <CardContent className="p-6 text-center">
                    <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-green-500 font-bold mb-2">Action Issued Successfully</h3>
                    <p className="text-xs text-green-500/80 uppercase tracking-widest font-black">
                        Protocol enforced against {targetUsername}.
                    </p>
                    <Button
                        variant="ghost"
                        onClick={() => setSuccess(false)}
                        className="mt-4 text-green-500 hover:bg-green-500/10"
                    >
                        Issue Another
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Shield className="w-24 h-24" />
            </div>
            <CardHeader className="border-b border-[#2a2f3a] pb-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#e6e6e6] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-orange-500" /> issue moderation action
                </h3>
                <p className="text-[10px] text-[#9aa0a6] uppercase tracking-widest font-bold">
                    Target: <span className="text-[#4f8cff]">{targetUsername}</span>
                </p>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Action Selection */}
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'WARN', label: 'Warn', icon: AlertTriangle, color: 'text-yellow-500' },
                            { id: 'MUTE', label: 'Mute', icon: Clock, color: 'text-orange-500' },
                            { id: 'REMOVE', label: 'Remove', icon: Trash2, color: 'text-red-500' },
                            { id: 'RESTRICT', label: 'Restrict', icon: Shield, color: 'text-purple-500' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setAction(item.id as any)}
                                className={cn(
                                    "flex items-center justify-center gap-2 p-3 border text-[10px] uppercase font-black tracking-widest transition-all",
                                    action === item.id
                                        ? "bg-white/5 border-white/20 text-white"
                                        : "bg-transparent border-[#2a2f3a] text-[#9aa0a6] hover:border-[#4f8cff]/30"
                                )}
                            >
                                <item.icon className={cn("w-3.5 h-3.5", item.color)} />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Rule Selection (Mandatory per SR-8) */}
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest font-black text-[#9aa0a6]">Applicable Rule ID (SR-XX)</label>
                        <input
                            type="text"
                            value={ruleId}
                            onChange={(e) => setRuleId(e.target.value)}
                            placeholder="e.g. SR-7"
                            className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3 text-xs text-[#e6e6e6] focus:border-[#4f8cff] outline-none transition-colors"
                            required
                        />
                    </div>

                    {/* Duration for Mute */}
                    {action === 'MUTE' && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[9px] uppercase tracking-widest font-black text-[#9aa0a6]">Mute Duration</label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3 text-xs text-[#e6e6e6] focus:border-orange-500 outline-none"
                            >
                                <option value="1h">1 Hour</option>
                                <option value="12h">12 Hours</option>
                                <option value="24h">24 Hours</option>
                                <option value="7d">7 Days</option>
                                <option value="30d">30 Days</option>
                            </select>
                        </div>
                    )}

                    {/* Reason (Mandatory per SR-8) */}
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest font-black text-[#9aa0a6]">Mandatory Protocol Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Detailed explanation of rule violation..."
                            className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3 text-xs text-[#e6e6e6] h-24 focus:border-[#4f8cff] outline-none transition-colors resize-none"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase font-black flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black uppercase tracking-[0.2em] text-[10px] h-12"
                        isLoading={loading}
                    >
                        EXECUTE ACTION
                        <Send className="w-4 h-4 ml-2" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

/* Helper for styling */
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

export default ModerationActionForm;
