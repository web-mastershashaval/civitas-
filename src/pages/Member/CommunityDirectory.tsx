import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, Filter, Lock, Unlock, Loader2, Shield, Compass, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useCommunities } from "../../hooks/useCommunities";

export function CommunityDirectory() {
    const { communities, loading, error } = useCommunities();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Scanning Decentralized Nodes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 border border-red-500/20 bg-red-500/5 text-red-500 max-w-2xl mx-auto mt-20 text-center">
                <Shield className="w-10 h-10 mx-auto mb-4 opacity-50 text-red-500" />
                <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Directory Sync Failed</p>
                <p className="text-sm italic opacity-80 leading-relaxed mb-8">{error}</p>
                <Button variant="ghost" className="border border-red-500/30 text-[10px] uppercase font-black px-8">
                    Retry Scan
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#2a2f3a] pb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter text-[#e6e6e6]">Community Directory</h1>
                    <p className="text-[#9aa0a6] text-[10px] uppercase tracking-[0.4em] font-black flex items-center gap-2">
                        <Compass className="w-3 h-3 text-[#4f8cff]" /> Global Authority Index
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9aa0a6]" />
                        <Input
                            placeholder="SEARCH COMMUNITIES..."
                            className="pl-12 bg-[#161a20] border-[#2a2f3a] focus:border-[#4f8cff] text-xs font-black tracking-widest uppercase rounded-none h-12 transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" className="h-12 w-12 p-0 border border-[#2a2f3a] hover:border-[#4f8cff]/40 bg-[#161a20] rounded-none">
                        <Filter className="h-4 w-4 text-[#9aa0a6]" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCommunities.map((community) => (
                    <Card key={community.id} className="flex flex-col bg-[#161a20] border-[#2a2f3a] shadow-xl hover:border-[#4f8cff]/50 transition-all group overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Shield className="w-16 h-16" />
                        </div>
                        <CardHeader className="border-b border-[#2a2f3a]/50 mb-6">
                            <div className="flex gap-4 items-start">
                                {community.image && (
                                    <div className="w-12 h-12 bg-[#0f1115] border border-[#2a2f3a] overflow-hidden shrink-0 rounded-full">
                                        <img src={community.image} alt={community.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-2xl font-bold text-[#e6e6e6] tracking-tighter">{community.name}</CardTitle>
                                        {community.access === "Open" ? <Unlock className="w-4 h-4 text-[#4f8cff]" /> : <Lock className="w-4 h-4 text-orange-500" />}
                                    </div>
                                    <CardDescription className="text-[10px] uppercase font-black tracking-widest text-[#4f8cff] mt-2">Community #{community.id.toString().substring(0, 4).toUpperCase()}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <p className="text-sm italic text-[#9aa0a6] leading-relaxed min-h-[50px]">{community.description || "Building future-proof governance models."}</p>
                            <div className="space-y-4 pt-4 border-t border-[#2a2f3a]">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-[#9aa0a6]">
                                        <Users className="w-3 h-3 text-[#4f8cff]" />
                                        <span>{community.members} Members</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-2 py-1 text-[9px] uppercase font-black tracking-widest border ${(community.access_type || 'OPEN') === 'OPEN' ? 'border-[#4f8cff]/30 text-[#4f8cff] bg-[#4f8cff]/5' :
                                            (community.access_type) === 'APPLICATION' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' :
                                                'border-red-500/30 text-red-500 bg-red-500/5'
                                        }`}>
                                        {(community.access_type || 'OPEN') === 'OPEN' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                        <span>{(community.access_type || 'OPEN')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                                    <span className="text-[#9aa0a6]">Authority Access</span>
                                    <span className={`px-2 py-0.5 border ${community.membership_status === 'PENDING' ? 'border-orange-500/50 text-orange-500 bg-orange-500/5' :
                                        community.membership_status === 'REJECTED' ? 'border-red-500/50 text-red-500 bg-red-500/5' :
                                            community.access === 'Open' ? 'border-[#4f8cff]/30 text-[#4f8cff] bg-[#4f8cff]/5' :
                                                'border-orange-500/30 text-orange-500 bg-orange-500/5'
                                        }`}>
                                        {community.membership_status === 'PENDING' ? 'PENDING APPROVAL' :
                                            community.membership_status === 'REJECTED' ? 'DENIED' :
                                                community.access || "SECURED"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-6 border-t border-[#2a2f3a]/50 mt-4">
                            {community.membership_status === 'PENDING' ? (
                                <Button className="w-full bg-[#0f1115] text-[#9aa0a6] border border-[#2a2f3a] font-black h-12 tracking-[0.2em] uppercase text-[10px] rounded-none transition-all cursor-not-allowed" disabled>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Review In Progress
                                </Button>
                            ) : community.membership_status === 'REJECTED' ? (
                                <Button className="w-full bg-[#0f1115] text-red-500/50 border border-red-500/20 font-black h-12 tracking-[0.2em] uppercase text-[10px] rounded-none transition-all cursor-not-allowed" disabled>
                                    Access Denied
                                </Button>
                            ) : (
                                <Link to={`/member/community/${community.id}`} className="w-full">
                                    <Button className="w-full bg-[#0f1115] hover:bg-[#4f8cff]/10 text-[#e6e6e6] border border-[#2a2f3a] hover:border-[#4f8cff]/50 font-black h-12 tracking-[0.2em] uppercase text-[10px] rounded-none transition-all">
                                        Verify Profile
                                    </Button>
                                </Link>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {filteredCommunities.length === 0 && (
                <div className="p-20 border border-dashed border-[#2a2f3a] text-center bg-[#161a20]/30 grayscale opacity-50">
                    <p className="text-[11px] text-[#9aa0a6] uppercase font-black tracking-widest italic">No communities match the current search filter.</p>
                </div>
            )}
        </div>
    );
}
