import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Shield, AlertTriangle, Loader2, History, Globe, Flag, Gavel } from "lucide-react";
import api, { governanceService } from "../../services/api";

export function ModerationDashboard() {
    const [communities, setCommunities] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [appeals, setAppeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [commRes, reportsRes, appealsRes] = await Promise.all([
                    api.get('/communities/?managed=true'),
                    governanceService.getReports(),
                    governanceService.getAppeals()
                ]);

                const commData = commRes.data.results || commRes.data;
                const reportsData = reportsRes.data.results || reportsRes.data;
                const appealsData = appealsRes.data.results || appealsRes.data;

                setCommunities(commData);
                setReports(Array.isArray(reportsData) ? reportsData.filter((r: any) => r.status === 'PENDING') : []);
                setAppeals(Array.isArray(appealsData) ? appealsData.filter((a: any) => a.status === 'PENDING') : []);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.detail || "Failed to load moderation context.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAction = async (type: 'REPORT' | 'APPEAL', id: string, action: string, reason?: string) => {
        try {
            if (type === 'REPORT') {
                // In a real app, this would open a modal to take action
                // For now, we'll just dismiss it to show interactivity
                await governanceService.updateReport(id, { status: 'REVIEWED' });
                setReports(prev => prev.filter(r => r.id !== id));
            } else {
                await governanceService.decideAppeal(id, {
                    decision: action,
                    decision_reason: reason || "Reviewed by facilitator"
                });
                setAppeals(prev => prev.filter(a => a.id !== id));
            }
        } catch (err) {
            console.error(err);
            alert("Failed to process action");
        }
    };

    if (loading) {
        return (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic animate-pulse">Loading Context...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-8 text-center">{error}</div>;
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-[#2a2f3a] pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#e6e6e6]">Moderation Dashboard</h1>
                    <p className="text-[#9aa0a6] text-[10px] mt-2 uppercase tracking-[0.4em] font-black flex items-center gap-2">
                        <Shield className="w-3 h-3 text-orange-500" /> Rules & Governance
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* MAIN CONTENT AREA */}
                <div className="lg:col-span-2 space-y-8">

                    {/* PENDING APPEALS */}
                    <div className="space-y-6">
                        <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                            <Gavel className="w-4 h-4" /> Pending Appeals ({appeals.length})
                        </h2>
                        <div className="space-y-4">
                            {appeals.length === 0 && (
                                <div className="p-8 text-center border border-dashed border-[#2a2f3a] bg-[#161a20]/30">
                                    <p className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest italic opacity-50">No pending appeals.</p>
                                </div>
                            )}
                            {appeals.map((appeal) => (
                                <Card key={appeal.id} className="bg-[#161a20] border-[#2a2f3a] rounded-none hover:border-purple-500/30 transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                                                    <History className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-[#e6e6e6] text-sm">Appeal by {appeal.appellant_username}</span>
                                                    <p className="text-[9px] text-[#9aa0a6] font-black uppercase tracking-tighter mt-0.5">
                                                        Against {appeal.moderation_action_details?.action || 'Action'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-[#9aa0a6] font-mono">{new Date(appeal.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="bg-[#0f1115] border-l-2 border-purple-500/50 p-4 mb-4">
                                            <p className="text-xs italic text-[#e6e6e6]">"{appeal.appeal_reason}"</p>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleAction('APPEAL', appeal.id, 'REJECTED')}
                                                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                            >
                                                Reject Keep Action
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAction('APPEAL', appeal.id, 'APPROVED')}
                                                className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
                                            >
                                                Approve Reverse Action
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* PENDING REPORTS */}
                    <div className="space-y-6">
                        <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                            <Flag className="w-4 h-4" /> Pending Reports ({reports.length})
                        </h2>
                        <div className="space-y-4">
                            {reports.length === 0 && (
                                <div className="p-8 text-center border border-dashed border-[#2a2f3a] bg-[#161a20]/30">
                                    <p className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest italic opacity-50">No pending reports.</p>
                                </div>
                            )}
                            {reports.map((report) => (
                                <Card key={report.id} className="bg-[#161a20] border-[#2a2f3a] rounded-none hover:border-orange-500/30 transition-all">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                                                    <AlertTriangle className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-[#e6e6e6] text-sm">Reported by {report.reporter_username}</span>
                                                    <p className="text-[9px] text-[#9aa0a6] font-black uppercase tracking-tighter mt-0.5">
                                                        Content: {report.content_type}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-[#9aa0a6] font-mono">{new Date(report.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="bg-[#0f1115] border-l-2 border-orange-500/50 p-4 mb-4">
                                            <p className="text-xs italic text-[#e6e6e6]">Reason: "{report.reason}"</p>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => handleAction('REPORT', report.id, 'DISMISS')}
                                            >
                                                Dismiss
                                            </Button>
                                            <Link to={`/facilitator/community/${report.community_id}/moderation?report=${report.id}`}>
                                                <Button size="sm">
                                                    Take Action
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR: COMMUNITIES */}
                <div className="space-y-6">
                    <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Manage Communities
                    </h2>

                    <div className="space-y-4">
                        {communities.map((community) => (
                            <Card key={community.id} className="bg-[#161a20] border-[#2a2f3a] rounded-none hover:border-[#4f8cff]/30 transition-all">
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-[#e6e6e6] truncate pr-2">{community.name}</h4>
                                        {community.pendingFlags > 0 && (
                                            <span className="shrink-0 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)] animate-pulse" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-[9px] uppercase font-black tracking-widest text-[#9aa0a6]">
                                            {community.members} Members
                                        </p>
                                        <Link to={`/facilitator/community/${community.id}/moderation`}>
                                            <Button variant="ghost" size="sm" className="h-8 text-[8px] uppercase font-black border border-[#2a2f3a] hover:border-orange-500/50 hover:text-orange-500">
                                                Review
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModerationDashboard;
