import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Plus, Activity, AlertTriangle, Users, ChevronRight, Trash2, Loader2, ShieldCheck, History } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";

export function FacilitatorDashboard() {
    const { communities, auditLogs, stats, loading, error, deleteCommunity } = useDashboard();

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure? This will permanently delete this community.")) {
            const result = await deleteCommunity(id);
            if (!result.success) {
                alert(result.error || "Failed to delete community.");
            }
        }
    };

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-10 h-10 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-[0.4em] italic animate-pulse">Loading Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 border border-red-500/20 bg-red-500/5 text-red-500 max-w-2xl mx-auto mt-20">
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 mb-4">
                    <ShieldCheck className="w-5 h-5" /> Connection Failed
                </h2>
                <p className="text-xs font-medium italic opacity-80 leading-relaxed">
                    {error}
                </p>
                <Button onClick={() => window.location.reload()} className="mt-8 border border-red-500/30 text-[9px] uppercase font-black tracking-widest bg-transparent hover:bg-red-500/10 h-10 px-6 rounded-none">
                    Retry Connection
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center bg-[#161a20] p-8 border border-[#2a2f3a] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#4f8cff]" />
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#e6e6e6]">Facilitator Console</h1>
                    <p className="text-[#9aa0a6] text-[10px] mt-2 uppercase tracking-[0.4em] font-black flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-[#4f8cff]" /> Administrator
                    </p>
                </div>
                <Link to="/facilitator/create-community">
                    <Button className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black h-12 px-8 tracking-[0.2em] uppercase text-[10px] rounded-none shadow-lg shadow-[#4f8cff]/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Community
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-xl border-l-2 border-l-[#4f8cff]/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                        <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-[#4f8cff]" />
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="text-3xl font-black tracking-tighter text-[#e6e6e6]">{stats.totalMembers.toLocaleString()}</div>
                        <p className="text-[9px] text-[#4f8cff]/70 font-black uppercase mt-2 tracking-widest">Across all communities</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-xl border-l-2 border-l-[#4f8cff]/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                        <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Active Discussions</CardTitle>
                        <Activity className="h-4 w-4 text-[#4f8cff]" />
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="text-3xl font-black tracking-tighter text-[#e6e6e6]">{stats.totalDiscussions}</div>
                        <p className="text-[9px] text-[#4f8cff]/70 font-black uppercase mt-2 tracking-widest">Total Threads</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-xl border-l-2 border-l-orange-500/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                        <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Moderation Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="text-3xl font-black tracking-tighter text-orange-500">{stats.totalFlags}</div>
                        <p className="text-[9px] text-orange-500/70 font-black uppercase mt-2 tracking-widest">Pending Review</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-xl border-l-2 border-l-[#4f8cff]/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                        <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Pending Applications</CardTitle>
                        <Users className="h-4 w-4 text-[#4f8cff]" />
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="text-3xl font-black tracking-tighter text-[#4f8cff]">{stats.totalPendingApplications}</div>
                        <p className="text-[9px] text-[#4f8cff]/70 font-black uppercase mt-2 tracking-widest">Awaiting Approval</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#2a2f3a] pb-4">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">My Communities</h3>
                        <span className="text-[10px] text-[#4f8cff] font-black uppercase">{communities.length} Active</span>
                    </div>
                    <div className="space-y-4">
                        {communities.length === 0 && (
                            <div className="p-12 border border-dashed border-[#2a2f3a] text-center bg-[#161a20]/50">
                                <p className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest italic">No communities found.</p>
                            </div>
                        )}
                        {communities.map((comm) => (
                            <div key={comm.id} className="group relative flex items-center justify-between p-6 bg-[#161a20] border border-[#2a2f3a] hover:border-[#4f8cff]/50 transition-all shadow-lg hover:shadow-[#4f8cff]/5">
                                <div className="absolute left-0 top-0 w-0.5 h-full bg-transparent group-hover:bg-[#4f8cff] transition-all" />
                                <div className="flex items-center gap-5">
                                    {comm.image && (
                                        <div className="w-12 h-12 bg-[#0f1115] border border-[#2a2f3a] overflow-hidden shrink-0">
                                            <img src={comm.image} alt={comm.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-lg font-bold text-[#e6e6e6] group-hover:text-[#4f8cff] transition-colors tracking-tight">{comm.name}</h4>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="w-1 h-1 rounded-full bg-[#2a2f3a]" />
                                            <p className="text-[9px] text-[#4f8cff] uppercase tracking-widest font-black">
                                                {comm.members} Members
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleDelete(comm.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-orange-500/40 hover:text-orange-500 flex items-center gap-2 text-[8px] uppercase font-black tracking-tighter"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                    <Link to={`/facilitator/community/${comm.id}/manage`}>
                                        <Button variant="ghost" className="h-10 px-4 border border-[#2a2f3a] hover:border-[#4f8cff]/40 bg-[#0f1115] group-hover:bg-[#4f8cff]/5 text-[#9aa0a6] group-hover:text-[#4f8cff] font-black uppercase tracking-widest text-[10px]">
                                            Manage
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#2a2f3a] pb-4">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                            <History className="w-4 h-4" /> Recent Activity
                        </h3>
                    </div>
                    <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-2xl overflow-hidden">
                        <CardContent className="p-0">
                            {auditLogs.length === 0 && (
                                <div className="p-12 text-center">
                                    <p className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest italic">No recent activity.</p>
                                </div>
                            )}
                            {auditLogs.map((log, i) => (
                                <div key={log.id} className={`p-5 flex items-start gap-4 hover:bg-[#1a1e26] transition-colors ${i !== auditLogs.length - 1 ? 'border-b border-[#2a2f3a]/50' : ''}`}>
                                    <div className={`w-1.5 h-1.5 mt-2 rounded-none rotate-45 flex-shrink-0 ${log.is_allowed ? 'bg-[#4f8cff]' : 'bg-red-500'}`} />
                                    <div className="space-y-1">
                                        <p className="text-xs font-medium text-[#e6e6e6] leading-relaxed">
                                            {log.user_name || 'System'}: <span className="opacity-80">{log.action_type}</span> -
                                            <span className={log.is_allowed ? 'text-[#4f8cff] font-bold' : 'text-red-500 font-bold'}>
                                                {log.is_allowed ? ' ALLOWED' : ' BLOCKED'}
                                            </span>
                                        </p>
                                        {log.reason && (
                                            <p className="text-[10px] text-red-500/80 italic border-l border-red-500/30 pl-2 py-0.5 my-1">
                                                "{log.reason}"
                                            </p>
                                        )}
                                        <p className="text-[9px] uppercase tracking-tighter text-[#9aa0a6] font-black flex items-center gap-2">
                                            {log.timestamp_relative || 'Recently'} • Rule: {log.rule_code || 'General'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
