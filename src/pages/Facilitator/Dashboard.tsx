import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Plus, Activity, AlertTriangle, Users, ChevronRight, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const initialCommunities = [
    { id: 1, name: "Civic Tech Alliance", stats: "Open Access • Medium Governance" },
    { id: 2, name: "Urban Planning Study", stats: "Application Required • High Governance" }
];

export function FacilitatorDashboard() {
    const [communities, setCommunities] = useState(initialCommunities);

    const handleDelete = (id: number) => {
        if (window.confirm("ARE YOU SURE? This action will ARCHIVE all authority logs and DECOMMISSION this community permanently from the live ledger.")) {
            setCommunities(communities.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-[#161a20] p-8 border border-[#2a2f3a] shadow-2xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Facilitator Console</h1>
                    <p className="text-[#9aa0a6] text-sm mt-1 uppercase tracking-[0.2em] font-black">System Authority: Level 1</p>
                </div>
                <Link to="/facilitator/create-community">
                    <Button className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-bold h-11 px-6 tracking-widest uppercase text-xs">
                        <Plus className="w-4 h-4 mr-2" />
                        Init Community
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                        <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Total Roster</CardTitle>
                        <Users className="h-4 w-4 text-[#4f8cff]" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold tracking-tighter">1,234</div>
                        <p className="text-[10px] text-[#4f8cff]/70 font-bold uppercase mt-1">+12% delta increase</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                        <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Live Ledger Entries</CardTitle>
                        <Activity className="h-4 w-4 text-[#4f8cff]" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold tracking-tighter">56</div>
                        <p className="text-[10px] text-[#4f8cff]/70 font-bold uppercase mt-1">4 fresh threads</p>
                    </CardContent>
                </Card>
                <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                        <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Priority Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="text-3xl font-bold tracking-tighter text-orange-500">3</div>
                        <p className="text-[10px] text-orange-500/70 font-bold uppercase mt-1">Requires immediate resolve</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Managed Authorities</h3>
                    <div className="space-y-4">
                        {communities.map((comm) => (
                            <div key={comm.id} className="group relative flex items-center justify-between p-6 bg-[#161a20] border border-[#2a2f3a] hover:border-[#4f8cff]/40 transition-all">
                                <div>
                                    <h4 className="font-bold text-[#e6e6e6] group-hover:text-[#4f8cff] transition-colors">{comm.name}</h4>
                                    <p className="text-[10px] text-[#9aa0a6] uppercase tracking-widest mt-1 font-medium">{comm.stats}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDelete(comm.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-orange-500/50 hover:text-orange-500 flex items-center gap-2 text-[9px] uppercase font-black"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Decommission Authority
                                    </button>
                                    <Link to={`/facilitator/community/${comm.id}/manage`}>
                                        <Button variant="ghost" className="h-9 w-9 p-0 border border-[#2a2f3a] group-hover:border-[#4f8cff]/50">
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Audit Log (Recent)</h3>
                    <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none">
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#4f8cff]" />
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-[#e6e6e6]">
                                        User <span className="font-bold">Alice</span> committed proposal to <Link to="/facilitator/community/1/discussion/1" className="text-[#4f8cff] hover:underline font-bold">Civic Tech Alliance</Link>
                                    </p>
                                    <p className="text-[9px] uppercase tracking-tighter text-[#9aa0a6] font-black">2h 45m ago • Ref: AUD-7731</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-orange-500" />
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-[#e6e6e6]">
                                        Safety Lock triggered: <span className="font-bold text-orange-500">Spam Pattern-04</span> in <Link to="/facilitator/community/1/discussion/1" className="text-[#4f8cff] hover:underline">Urban Planning</Link>
                                    </p>
                                    <p className="text-[9px] uppercase tracking-tighter text-[#9aa0a6] font-black">5h 12m ago • Ref: SEC-9902</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
