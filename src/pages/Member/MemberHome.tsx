import { Link } from "react-router-dom";
import { Card, CardTitle, CardContent, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ArrowRight, Users, MessageSquare, Loader2, Shield, Compass, History, Bell } from "lucide-react";
import { useCommunities } from "../../hooks/useCommunities";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export function MemberHome() {
    const { communities, loading, error } = useCommunities(false, true);
    const { permission, requestPermission, isSupported } = usePushNotifications();

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Synchronizing Member Context...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 border border-red-500/20 bg-red-500/5 text-red-500 max-w-2xl mx-auto mt-20 text-center">
                <Shield className="w-10 h-10 mx-auto mb-4 opacity-50 text-red-500" />
                <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Community Sync Error</p>
                <p className="text-sm italic opacity-80 leading-relaxed mb-8">{error}</p>
                <Button variant="ghost" className="border border-red-500/30 text-[10px] uppercase font-black px-8">
                    Retry Synchronization
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-[#2a2f3a] pb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#e6e6e6]">Member Dashboard</h1>
                    <p className="text-[#9aa0a6] text-[10px] mt-2 uppercase tracking-[0.4em] font-black flex items-center gap-2">
                        <Shield className="w-3 h-3 text-[#4f8cff]" /> Active Membership Portfolio
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    {isSupported && permission === 'default' && (
                        <Button
                            onClick={requestPermission}
                            variant="ghost"
                            className="text-[10px] uppercase tracking-widest font-black text-[#f0b429] border border-[#f0b429]/20 hover:bg-[#f0b429]/5 h-10 px-6 rounded-none w-full sm:w-auto"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Enable Alerts
                        </Button>
                    )}
                    <Link to="/member/communities" className="w-full sm:w-auto">
                        <Button variant="ghost" className="text-[10px] uppercase tracking-widest font-black text-[#4f8cff] border border-[#4f8cff]/20 hover:bg-[#4f8cff]/5 h-10 px-6 rounded-none w-full">
                            <Compass className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Explore More Communities</span>
                            <span className="sm:hidden">Explore Communities</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {communities.length === 0 ? (
                <div className="p-20 border border-dashed border-[#2a2f3a] text-center bg-[#161a20]/30">
                    <p className="text-[11px] text-[#9aa0a6] uppercase font-black tracking-widest italic mb-6">No community associations found in your member profile.</p>
                    <Link to="/member/communities">
                        <Button className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black h-12 px-10 tracking-[0.2em] uppercase text-[10px] rounded-none">
                            Join First Community
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {communities.map((community) => (
                        <Card key={community.id} className="bg-[#161a20] border-[#2a2f3a] shadow-xl hover:border-[#4f8cff]/50 transition-all group relative overflow-hidden flex flex-col">
                            {community.banner ? (
                                <div className="w-full h-24 overflow-hidden border-b border-[#2a2f3a]">
                                    <img src={community.banner} alt="Banner" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                                </div>
                            ) : (
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <Shield className="w-20 h-20" />
                                </div>
                            )}
                            <div className="flex-1 flex flex-col p-6">
                                <div className="flex gap-4 items-start mb-4">
                                    {community.image && (
                                        <div className="w-12 h-12 bg-[#0f1115] border border-[#2a2f3a] overflow-hidden shrink-0 mt-[-12px] rounded-full">
                                            <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <CardTitle className="text-xl font-bold text-[#e6e6e6] group-hover:text-[#4f8cff] transition-colors tracking-tight">{community.name}</CardTitle>
                                        <CardDescription className="text-xs italic text-[#9aa0a6] line-clamp-1 mt-1">{community.description || "Building future-proof governance models."}</CardDescription>
                                    </div>
                                </div>

                                <CardContent className="space-y-6 p-0 mt-auto">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#9aa0a6]">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-[#4f8cff]" />
                                                <span>{community.members || 0} Members</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="w-3.5 h-3.5 text-accent" />
                                                <span className="text-white">{community.activeDiscussions || 0} Threads</span>
                                            </div>
                                        </div>
                                        <div className="px-2 py-0.5 bg-[#4f8cff]/5 border border-[#4f8cff]/20 text-[#4f8cff] text-[9px]">
                                            {community.access || "Open"}
                                        </div>
                                    </div>
                                    <Link to={`/member/community/${community.id}/home`} className="block">
                                        <Button className="w-full bg-transparent hover:bg-[#4f8cff]/10 text-[#e6e6e6] border border-[#2a2f3a] hover:border-[#4f8cff]/50 font-black h-12 tracking-[0.2em] uppercase text-[10px] rounded-none transition-all">
                                            Open Community Portal
                                            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Quick System Brief */}
            <div className="bg-[#161a20] border border-[#2a2f3a] p-8 space-y-4">
                <header className="mb-8">
                    <h1 className="text-3xl font-black tracking-tighter text-[#e6e6e6]">Member Hub</h1>
                    <p className="text-[#9aa0a6] text-sm uppercase tracking-[0.2em] font-medium mt-1">Operational Overview</p>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-[#9aa0a6]">
                    <div className="bg-[#161a20] border border-[#2a2f3a] p-4 text-center md:text-left">
                        <p className="text-[9px] md:text-[10px] uppercase font-black mb-1">Active Communities</p>
                        <p className="text-xl md:text-2xl font-black text-[#e6e6e6] tracking-tighter">04</p>
                    </div>
                    <div className="bg-[#161a20] border border-[#2a2f3a] p-4 text-center md:text-left">
                        <p className="text-[9px] md:text-[10px] uppercase font-black mb-1">Total Members</p>
                        <p className="text-xl md:text-2xl font-black text-[#e6e6e6] tracking-tighter">1,242</p>
                    </div>
                    <div className="bg-[#161a20] border border-[#2a2f3a] p-4 text-center md:text-left">
                        <p className="text-[9px] md:text-[10px] uppercase font-black mb-1">Open Proposals</p>
                        <p className="text-xl md:text-2xl font-black text-[#e6e6e6] tracking-tighter">12</p>
                    </div>
                    <div className="bg-[#161a20] border border-[#2a2f3a] p-4 text-center md:text-left">
                        <p className="text-[9px] md:text-[10px] uppercase font-black mb-1">Active Discussions</p>
                        <p className="text-xl md:text-2xl font-black text-[#e6e6e6] tracking-tighter">34</p>
                    </div>
                </div>

                <div className="hidden md:block">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#9aa0a6] border-b border-[#2a2f3a] pb-4 flex items-center gap-2">
                        <History className="w-4 h-4 text-[#4f8cff]" /> System Updates
                    </h3>
                    <div className="grid gap-6 md:grid-cols-3 text-[10px] uppercase font-bold tracking-widest text-[#9aa0a6] mt-4">
                        <div className="space-y-2 border-l border-[#2a2f3a] pl-4">
                            <p className="text-white">Structured Engagement</p>
                            <p className="opacity-60 italic leading-relaxed">Choose precise contribution types: Proposal, Question, or Evidence.</p>
                        </div>
                        <div className="space-y-2 border-l border-[#2a2f3a] pl-4">
                            <p className="text-white">Active Community</p>
                            <p className="opacity-60 italic leading-relaxed">All contributions are recorded permanently. Accuracy is paramount.</p>
                        </div>
                        <div className="space-y-2 border-l border-[#2a2f3a] pl-4">
                            <p className="text-white">Tiered Governance</p>
                            <p className="opacity-60 italic leading-relaxed">Boards provide scoped deliberation for effective legislative flow.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
