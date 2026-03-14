import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, UserX, Shield, Ban, Loader2, Filter, Globe } from "lucide-react";
import api from "../../services/api";

export function MembersManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const [memberships, setMemberships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCommunity, setSelectedCommunity] = useState<string>("all");

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const response = await api.get('/memberships/?managed=true');
                setMemberships(response.data);
            } catch (err: any) {
                console.error("Failed to load member records:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const communities = ["all", ...new Set(memberships.map(m => m.community_name))];

    const filteredMemberships = memberships.filter(m => {
        const matchesSearch = m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.community_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesComm = selectedCommunity === "all" || m.community_name === selectedCommunity;
        return matchesSearch && matchesComm;
    });

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic tracking-[0.4em]">Retrieving Member Records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-[#2a2f3a] pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#e6e6e6]">Access Ledger</h1>
                    <p className="text-[#9aa0a6] text-[10px] mt-2 uppercase tracking-[0.4em] font-black flex items-center gap-2">
                        <Shield className="w-3 h-3 text-[#4f8cff]" /> Cross-Community Member Registry
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa0a6]" />
                    <Input
                        placeholder="SEARCH CITIZENS OR COMMUNITIES..."
                        className="pl-12 bg-[#161a20] border-[#2a2f3a] text-xs font-black uppercase tracking-widest h-12 rounded-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9aa0a6]" />
                        <select
                            className="pl-10 pr-8 bg-[#161a20] border border-[#2a2f3a] text-[10px] font-black uppercase tracking-widest h-12 rounded-none appearance-none focus:outline-none focus:border-[#4f8cff]/50 min-w-[180px]"
                            value={selectedCommunity}
                            onChange={(e) => setSelectedCommunity(e.target.value)}
                        >
                            {communities.map(c => (
                                <option key={c} value={c}>{c === "all" ? "SELECT COMMUNITY" : c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-2xl">
                <CardHeader className="border-b border-[#2a2f3a]/50">
                    <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">
                        Identified Entities ({filteredMemberships.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-[#2a2f3a]/50">
                        {filteredMemberships.length === 0 && (
                            <div className="p-20 text-center">
                                <p className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest italic opacity-50">No member records located in current community.</p>
                            </div>
                        )}
                        {filteredMemberships.map((membership) => (
                            <div
                                key={membership.id}
                                className="flex items-center justify-between p-6 hover:bg-[#1a1e26] transition-colors group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-[#4f8cff]/5 border border-[#4f8cff]/20 flex items-center justify-center group-hover:border-[#4f8cff]/50 transition-all overflow-hidden rounded-full">
                                        {membership.avatar ? (
                                            <img src={membership.avatar} alt={membership.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-black text-[#4f8cff] text-lg uppercase">{membership.username[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#e6e6e6] text-lg tracking-tight flex items-center gap-3">
                                            {membership.username}
                                            <span className="text-[9px] px-2 py-0.5 border border-[#4f8cff]/20 bg-[#4f8cff]/5 text-[#4f8cff] tracking-widest">
                                                {membership.role}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-[#9aa0a6] font-black uppercase tracking-widest mt-1.5 flex items-center gap-3 italic">
                                            <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> {membership.community_name}</span>
                                            <span>•</span>
                                            <span>{membership.posts} posts submitted</span>
                                            <span>•</span>
                                            <span>Joined {membership.joined_at_formatted}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 border ${membership.status === "ACTIVE" ? "border-green-500/30 text-green-500 bg-green-500/5" :
                                        membership.status === "PENDING" ? "border-orange-500/30 text-orange-500 bg-orange-500/5" :
                                            "border-red-500/30 text-red-500 bg-red-500/5"
                                        }`}>
                                        {membership.status}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 border border-[#2a2f3a] hover:text-[#4f8cff] hover:border-[#4f8cff]/30">
                                            <Shield className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 border border-[#2a2f3a] hover:text-orange-500 hover:border-orange-500/30">
                                            <Ban className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 border border-[#2a2f3a] hover:text-red-500 hover:border-red-500/30">
                                            <UserX className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
