import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardContent } from "../../components/ui/Card";
import { Shield, ArrowLeft, Loader2, FileText, Ban, AlertTriangle, User, MessageSquare } from "lucide-react";
import api, { governanceService, ledgerService } from "../../services/api";
import ModerationActionForm from "../../components/features/ModerationActionForm";

interface RuleDecision {
    id: number;
    user: number; // ID
    action: string;
    result: string;
    reason: string | null;
    timestamp: string;
    rule: number; // ID
    scope_type: string;
}

export function ModerationPanel() {
    const { id: communityId } = useParams();
    const [searchParams] = useSearchParams();
    const reportId = searchParams.get('report');

    const [decisions, setDecisions] = useState<RuleDecision[]>([]);
    const [report, setReport] = useState<any>(null);
    const [targetContent, setTargetContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        const fetchModerationContext = async () => {
            try {
                setLoading(true);

                // 1. Fetch Audit Logs
                const response = await api.get(`/audit-logs/?scope_id=${communityId}&result=BLOCKED`);
                const auditData = response.data.results || response.data;
                setDecisions(Array.isArray(auditData) ? auditData : []);

                // 2. Fetch Report Context if active
                if (reportId && reportId !== 'undefined') {
                    const reportRes = await api.get(`/reports/${reportId}/`);
                    const reportData = reportRes.data;
                    setReport(reportData);

                    // Fetch the actual content being reported
                    if (reportData.content_type === 'DISCUSSION') {
                        const discRes = await ledgerService.getDiscussion(reportData.object_id, communityId);
                        setTargetContent(discRes.data);
                    } else if (reportData.content_type === 'RESPONSE') {
                        const allResp = await api.get(`/responses/${reportData.object_id}/`);
                        setTargetContent(allResp.data);
                    }
                }
            } catch (e: any) {
                console.error("Moderation Panel Error:", e);
                setErr("Failed to load moderation context.");
            } finally {
                setLoading(false);
            }
        };

        if (communityId && communityId !== 'undefined') fetchModerationContext();
    }, [communityId, reportId]);

    const handleActionCompleted = () => {
        // Refresh data or redirect
        if (reportId) {
            // Mark report as reviewed if action was taken
            governanceService.updateReport(reportId, { status: 'REVIEWED' });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#2a2f3a] pb-8">
                <div>
                    <Link to="/facilitator">
                        <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-[#4f8cff] text-[#9aa0a6] uppercase text-[10px] tracking-widest font-bold">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-black flex items-center gap-3 text-[#e6e6e6]">
                        <Shield className="w-8 h-8 text-orange-500" />
                        Moderation Action Center
                    </h1>
                    <p className="text-[#9aa0a6] text-xs mt-2 uppercase tracking-widest font-medium">Review and enforce community protocols.</p>
                </div>

                {reportId && (
                    <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-orange-500">Active Report Case #{reportId.slice(0, 8)}</span>
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
                {/* LEFT: AUDIT & REPORTS */}
                <div className="lg:col-span-3 space-y-8">
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                        </div>
                    ) : err ? (
                        <div className="p-4 border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-bold text-center">
                            {err}
                        </div>
                    ) : (
                        <>
                            {/* ACTIVE CASE VIEW */}
                            {report && (
                                <div className="space-y-6 animate-in slide-in-from-left duration-500">
                                    <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Reported Content Details
                                    </h2>
                                    <Card className="bg-[#161a20] border-orange-500/30 rounded-none overflow-hidden ring-1 ring-orange-500/20">
                                        <CardHeader className="bg-orange-500/5 border-b border-[#2a2f3a] p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-3.5 h-3.5 text-[#9aa0a6]" />
                                                    <span className="text-xs font-bold text-[#e6e6e6]">Author: {targetContent?.author_username || targetContent?.author || 'Unknown'}</span>
                                                </div>
                                                <span className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest">{report.content_type}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            {targetContent?.title && (
                                                <h4 className="text-lg font-black text-[#e6e6e6] tracking-tight">{targetContent.title}</h4>
                                            )}
                                            <div className="bg-[#0f1115] p-4 border-l-2 border-[#2a2f3a]">
                                                <p className="text-sm text-[#9aa0a6] leading-relaxed italic">
                                                    "{targetContent?.content || targetContent?.body || 'Content unavailable'}"
                                                </p>
                                            </div>
                                            <div className="pt-4 border-t border-[#2a2f3a]">
                                                <p className="text-[10px] text-orange-500 uppercase font-black tracking-widest mb-1">Reporter's Claim:</p>
                                                <p className="text-xs text-[#e6e6e6] font-medium font-mono bg-orange-500/5 p-3">
                                                    {report.reason}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* RECENT BLOCKED ACTIONS */}
                            <div className="space-y-6">
                                <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                                    <Ban className="w-4 h-4" /> Security Audit Log (Recent Blocks)
                                </h2>
                                <div className="space-y-4">
                                    {decisions.length === 0 && !report && (
                                        <div className="p-12 text-center border border-dashed border-[#2a2f3a] bg-[#161a20]/50">
                                            <Shield className="w-12 h-12 mx-auto mb-4 text-[#9aa0a6]/20" />
                                            <p className="text-[#9aa0a6] uppercase font-black tracking-widest text-xs">No blocking events recorded.</p>
                                        </div>
                                    )}

                                    {decisions.slice(0, 5).map((item) => (
                                        <Card key={item.id} className="bg-[#161a20] border-[#2a2f3a] rounded-none hover:border-orange-500/30 transition-colors">
                                            <CardHeader className="bg-orange-500/5 border-b border-[#2a2f3a]/50 pb-3 p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <Ban className="w-3.5 h-3.5 text-orange-500" />
                                                        <span className="font-black text-orange-500 text-[9px] uppercase tracking-widest">ACTION BLOCKED</span>
                                                        <span className="text-xs text-[#e6e6e6] font-bold ml-2">{item.action}</span>
                                                    </div>
                                                    <span className="text-[10px] text-[#9aa0a6] font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] text-[#9aa0a6]">
                                                    <span className="uppercase tracking-widest font-black text-[9px] opacity-50">Scope:</span>
                                                    <span className="px-2 py-0.5 bg-[#2a2f3a] text-[#e6e6e6] font-mono">{item.scope_type}</span>
                                                </div>
                                                {item.reason && (
                                                    <p className="text-xs italic text-orange-500/80 border-l-2 border-orange-500/30 pl-3 py-1">
                                                        "{item.reason}"
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* RIGHT: ACTION FORM */}
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                        <Shield className="w-4 h-4 text-orange-500" /> Enforce Protocol
                    </h2>

                    {report ? (
                        <ModerationActionForm
                            targetUserId={targetContent?.author_id || targetContent?.authorId || report?.author_id}
                            targetUsername={targetContent?.author_username || targetContent?.author || 'Author'}
                            contentType={report.content_type}
                            objectId={report.object_id}
                            onActionCompleted={handleActionCompleted}
                        />
                    ) : (
                        <div className="p-8 text-center border border-dashed border-[#2a2f3a] bg-[#1a1e26]/30">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#9aa0a6]/10" />
                            <p className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest italic">
                                Select a report from the dashboard to initiate protocol enforcement.
                            </p>
                            <Link to="/facilitator">
                                <Button variant="outline" size="sm" className="mt-6 border-[#2a2f3a] text-[#9aa0a6] hover:text-[#4f8cff] uppercase text-[9px] font-black tracking-widest h-10">
                                    Return to Reports
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="p-6 bg-[#4f8cff]/5 border border-[#4f8cff]/10">
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-[#4f8cff] mb-2 flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5" /> Moderation Principles
                        </h4>
                        <ul className="space-y-3">
                            <li className="text-[10px] text-[#9aa0a6] leading-relaxed">
                                <span className="font-bold text-[#e6e6e6]">SR-8:</span> Every action must cite a specific rule ID for absolute traceability.
                            </li>
                            <li className="text-[10px] text-[#9aa0a6] leading-relaxed">
                                <span className="font-bold text-[#e6e6e6]">SR-9:</span> Facilitators may remove content but never edit a member's words.
                            </li>
                            <li className="text-[10px] text-[#9aa0a6] leading-relaxed">
                                <span className="font-bold text-[#e6e6e6]">SR-22:</span> All mutes and removals are subject to the member appeals process.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModerationPanel;
