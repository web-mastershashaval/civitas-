import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Shield, Users, Lock, BookOpen, UserCircle, Loader2, AlertTriangle } from "lucide-react";
import { useCommunity } from "../../hooks/useCommunity";
import api, { communityService } from "../../services/api";

export function CommunityProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { community, loading } = useCommunity(id);
    const [activeTab, setActiveTab] = useState<"about" | "rules" | "facilitators">("about");

    // Join & Rules State
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [rules, setRules] = useState<any[]>([]);
    const [loadingRules, setLoadingRules] = useState(false);
    const [joining, setJoining] = useState(false);

    const fetchRules = async () => {
        setLoadingRules(true);
        try {
            const res = await api.get(`/rules/?scope_type=COMMUNITY&scope_id=${id}`);
            setRules(res.data);
        } catch (err) {
            console.error("Failed to fetch rules", err);
        } finally {
            setLoadingRules(false);
        }
    };

    const handleJoinClick = () => {
        setIsJoinModalOpen(true);
        fetchRules();
    };

    const handleConfirmJoin = async () => {
        setJoining(true);
        try {
            await communityService.joinCommunity(id!);
            alert("Welcome! You have successfully joined the community.");
            setIsJoinModalOpen(false);
            navigate(`/member/community/${id}/home`);
        } catch (err: any) {
            console.error("Join failed", err);
            alert("Failed to join: " + (err.response?.data?.detail || "Unknown error"));
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic animate-pulse">Loading Profile...</p>
            </div>
        );
    }

    if (!community) return <div>Community not found</div>;

    return (
        <div className="space-y-8 relative">
            {/* Banner Section */}
            {community.banner && (
                <div className="w-full h-48 md:h-64 overflow-hidden border border-[#2a2f3a] shadow-2xl relative">
                    <img src={community.banner} alt="Banner" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-8 mt-4">
                <div className="flex items-start gap-6">
                    {community.image && (
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-[#161a20] border-4 border-[#2a2f3a] shadow-xl overflow-hidden shrink-0 rounded-full">
                            <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold">{community.name}</h1>
                        <p className="text-xl text-primary/80 max-w-2xl">{community.description || "No description provided."}</p>
                        <div className="flex items-center gap-4 text-sm text-primary/60">
                            <div className="flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                <span>{community.governance_type || "MEDIUM"} Governance</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{community.members || 0} Members</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="w-full md:w-80 border-accent/20">
                    <CardHeader>
                        <CardTitle>{community.is_member ? "Your Membership" : "Join Community"}</CardTitle>
                        <CardDescription>Access Type: {community.access_type || "OPEN"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {community.is_member ? (
                            <>
                                <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold uppercase tracking-widest text-center">
                                    ✓ You are a member
                                </div>
                                <Link to={`/member/community/${id}/home`}>
                                    <Button className="w-full bg-[#1a1e26] text-[#4f8cff] border border-[#4f8cff]/50 hover:bg-[#4f8cff]/10 font-bold uppercase tracking-widest" size="lg">
                                        Enter Community
                                    </Button>
                                </Link>
                            </>
                        ) : community.membership_status === "PENDING" ? (
                            <>
                                <div className="p-3 bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs font-bold uppercase tracking-widest text-center">
                                    Application submitted
                                </div>
                                <Button className="w-full bg-orange-500/10 text-orange-500 border border-orange-500/30 font-bold uppercase tracking-widest" size="lg" disabled>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Pending Approval
                                </Button>
                            </>
                        ) : community.membership_status === "REJECTED" ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                                    Application not approved
                                </div>
                                <Button className="w-full bg-red-500/10 text-red-500 border border-red-500/30 font-bold uppercase tracking-widest cursor-not-allowed" size="lg" disabled>
                                    Access Denied
                                </Button>
                            </div>
                        ) : (community.access_type || "OPEN") === "OPEN" ? (
                            <Button className="w-full" size="lg" onClick={handleJoinClick}>Join Now</Button>
                        ) : (community.access_type || "OPEN") === "APPLICATION" ? (
                            <Link to={`/member/community/${id}/apply`}>
                                <Button className="w-full" size="lg">Apply to Join</Button>
                            </Link>
                        ) : (
                            <Button className="w-full" variant="secondary" disabled>
                                <Lock className="w-4 h-4 mr-2" /> Invite Only
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <div className="border-b border-border">
                <div className="flex gap-8">
                    {["about", "rules", "facilitators"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab as any);
                                if (tab === "rules") fetchRules();
                            }}
                            className={`pb-3 px-1 border-b-2 transition-colors uppercase text-sm font-bold tracking-wider ${activeTab === tab ? "border-[#4f8cff] text-[#4f8cff]" : "border-transparent text-[#9aa0a6] hover:text-[#e6e6e6]"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "about" && (
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="bg-[#161a20] border-[#2a2f3a]">
                        <CardHeader><CardTitle>Board Architecture</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {community.boards?.map((board: any, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-black/20 rounded-sm border border-[#2a2f3a] transition-all hover:bg-black/30">
                                        <div className="w-1.5 h-1.5 bg-[#4f8cff] rotate-45" />
                                        <span className="text-[#e6e6e6] font-bold tracking-tight text-lg">{board.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "rules" && (
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="p-4 bg-orange-500/10 border-l-4 border-orange-500 text-orange-200 text-sm mb-6">
                            <p className="font-bold flex items-center gap-2 italic uppercase tracking-widest text-[10px]"><Shield className="w-4 h-4" /> Governance Protocol</p>
                            <p className="mt-2 opacity-80 leading-relaxed">Membership in this community requires strict adherence to the following rules. Failure to comply may result in suspension or automated intervention.</p>
                        </div>

                        {loadingRules ? (
                            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" /></div>
                        ) : rules.length === 0 ? (
                            <Card className="bg-[#161a20] border-[#2a2f3a] p-10 text-center border-dashed">
                                <p className="text-[#9aa0a6] text-xs font-black uppercase tracking-widest italic opacity-50">No community-specific rules defined.</p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {rules.map((rule, i) => (
                                    <Card key={i} className="bg-[#161a20] border-[#2a2f3a] p-6 hover:border-[#4f8cff]/30 transition-all group">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-black text-[#4f8cff]/80 text-[10px] uppercase tracking-[0.2em]">{rule.code || `Rule #${i + 1}`}</h4>
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border border-[#2a2f3a] text-[#9aa0a6] group-hover:text-[#e6e6e6]">{rule.action}</span>
                                        </div>
                                        <p className="text-[#e6e6e6] text-sm leading-relaxed font-medium">{rule.description}</p>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "facilitators" && (
                <div className="grid md:grid-cols-3 gap-6">
                    {community.facilitators?.map((fac: any, i: number) => (
                        <Card key={i} className="bg-[#161a20] border-[#2a2f3a] hover:border-[#4f8cff]/30 transition-colors">
                            <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-[#4f8cff]/10 border-2 border-[#4f8cff]/20 flex items-center justify-center">
                                    <UserCircle className="w-10 h-10 text-[#4f8cff]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#e6e6e6]">{fac.name}</h4>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-[#4f8cff] mt-1">Lead Facilitator</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Rules Modal Overlay */}
            {isJoinModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="max-w-xl w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-[#161a20] border-[#4f8cff]/50 shadow-2xl relative">
                        <CardHeader className="border-b border-[#2a2f3a] bg-[#1a1e26] sticky top-0 z-10">
                            <CardTitle className="text-2xl font-black text-[#e6e6e6] flex items-center gap-3">
                                <BookOpen className="w-6 h-6 text-[#4f8cff]" />
                                Review Community Rules
                            </CardTitle>
                            <CardDescription className="text-red-400 font-bold uppercase tracking-wider text-xs">
                                Compliance Required for Entry
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="p-4 bg-orange-500/10 border-l-4 border-orange-500 text-orange-200 text-sm">
                                <p className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Before you join:</p>
                                <p className="mt-1 opacity-80">You must read and agree to comply with the following rules enforced by the Facilitators.</p>
                            </div>

                            {loadingRules ? (
                                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" /></div>
                            ) : rules.length === 0 ? (
                                <p className="text-center py-8 text-[#9aa0a6] italic">This community has no specific rules yet, but standard platform conduct applies.</p>
                            ) : (
                                <div className="space-y-4">
                                    {rules.map((rule, i) => (
                                        <div key={i} className="p-4 bg-black/30 border border-[#2a2f3a] rounded-sm">
                                            <h4 className="font-bold text-[#e6e6e6] text-sm mb-1">{rule.code || `Rule #${i + 1}`}</h4>
                                            <p className="text-[#9aa0a6] text-sm">{rule.description}</p>
                                            <div className="mt-2 flex gap-2 text-[10px] uppercase font-black text-[#4f8cff] opacity-60">
                                                <span>{rule.action}</span>
                                                <span>•</span>
                                                <span>{rule.scope_type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <div className="p-6 border-t border-[#2a2f3a] bg-[#1a1e26] sticky bottom-0 z-10 flex gap-4">
                            <Button variant="outline" className="flex-1" onClick={() => setIsJoinModalOpen(false)}>Cancel</Button>
                            <Button className="flex-[2] bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black uppercase tracking-widest" onClick={handleConfirmJoin} disabled={joining}>
                                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : "I Agree & Join"}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
