import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Plus, Users, Activity, ShieldCheck, Loader2 } from "lucide-react";
import { useCommunities } from "../../hooks/useCommunities";

export function CommunitiesList() {
    const { communities, loading, error } = useCommunities(true); // managed=true

    if (loading) {
        return (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic animate-pulse">Loading Managed Communities...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 border border-red-500/20 bg-red-500/5 text-red-500 text-center">
                <p className="text-sm font-bold">Failed to load communities.</p>
                <p className="text-xs mt-2 opacity-80">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-[#161a20] p-8 border border-[#2a2f3a] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#4f8cff]" />
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-[#e6e6e6]">Your Communities</h1>
                    <p className="text-[#9aa0a6] text-[10px] mt-2 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                        Manage the communities where you are a facilitator
                    </p>
                </div>
                <Link to="/facilitator/create-community">
                    <Button className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black h-12 px-8 tracking-[0.2em] uppercase text-[10px] rounded-none shadow-lg shadow-[#4f8cff]/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Community
                    </Button>
                </Link>
            </div>

            {communities.length === 0 ? (
                <div className="p-24 border border-dashed border-[#2a2f3a] bg-[#161a20]/30 flex flex-col items-center gap-6 text-center">
                    <ShieldCheck className="w-16 h-16 text-[#2a2f3a]" />
                    <div className="space-y-2">
                        <p className="text-[#9aa0a6] uppercase tracking-[0.3em] font-black text-xs">No Communities Found</p>
                        <p className="text-[10px] text-[#9aa0a6]/50 uppercase font-bold tracking-widest leading-loose">
                            You are not managing any communities yet.<br />Create one to get started.
                        </p>
                    </div>
                    <Link to="/facilitator/create-community">
                        <Button variant="outline" className="border-[#4f8cff] text-[#4f8cff] hover:bg-[#4f8cff]/10 uppercase text-[10px] font-black tracking-widest h-10 px-6 rounded-none">
                            Create First Community
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {communities.map((community) => (
                        <Card key={community.id} className="bg-[#161a20] border-[#2a2f3a] shadow-lg hover:border-[#4f8cff]/50 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#4f8cff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {community.banner && (
                                <div className="w-full h-24 overflow-hidden border-b border-[#2a2f3a]">
                                    <img src={community.banner} alt="Banner" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
                                </div>
                            )}
                            <CardHeader className="border-b border-[#2a2f3a]/50 pb-4">
                                <CardTitle className="flex flex-col gap-2">
                                    <div className="flex items-center gap-4">
                                        {community.image && (
                                            <div className="w-12 h-12 bg-[#0f1115] border border-[#2a2f3a] overflow-hidden shrink-0 rounded-full">
                                                <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[#e6e6e6] font-bold tracking-tight truncate">{community.name}</span>
                                                {community.active_discussions > 0 && (
                                                    <div className="w-2 h-2 rounded-full bg-[#4f8cff] animate-pulse shrink-0 ml-2" title="Active Discussions" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded-sm border ${(community.access_type || "OPEN") === 'APPLICATION' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                            (community.access_type || "OPEN") === 'INVITE' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                'bg-[#2a2f3a] text-[#9aa0a6] border-[#2a2f3a]/50'
                                            }`}>
                                            {community.access_type || "OPEN"}
                                        </span>
                                        <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded-sm border ${community.governance_type === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                            community.governance_type === 'LOW' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                'bg-[#4f8cff]/10 text-[#4f8cff] border-[#4f8cff]/20'
                                            }`}>
                                            STRICTNESS: {community.governance_type || "MEDIUM"}
                                        </span>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] uppercase font-black text-[#9aa0a6] tracking-widest flex items-center gap-2">
                                            <Users className="w-3 h-3" /> Members
                                        </p>
                                        <p className="text-xl font-bold text-[#e6e6e6] pl-5">{community.members || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] uppercase font-black text-[#9aa0a6] tracking-widest flex items-center gap-2">
                                            <Activity className="w-3 h-3" /> Activity
                                        </p>
                                        <p className="text-xl font-bold text-[#e6e6e6] pl-5">{community.active_discussions || 0}</p>
                                    </div>
                                </div>
                                <Link to={`/facilitator/community/${community.id}/manage`} className="block">
                                    <Button className="w-full bg-[#2a2f3a] hover:bg-[#3a3f4a] text-[#9aa0a6] hover:text-white uppercase font-black tracking-widest text-[10px] h-10 rounded-none transition-all group-hover:bg-[#4f8cff] group-hover:text-white border-0">
                                        Manage Board
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
