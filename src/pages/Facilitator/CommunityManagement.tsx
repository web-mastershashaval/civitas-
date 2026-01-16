import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import {
    Settings, Users, Activity, Shield, Edit, Plus, X,
    Server, Link as LinkIcon, Trash2, MessageSquarePlus,
    ChevronRight, Layers, FileText, Globe
} from "lucide-react";

// Mock data
const communityData = {
    1: {
        name: "Civic Tech Alliance",
        members: 1234,
        activeDiscussions: 56,
        pendingFlags: 3,
        boards: [
            { id: 1, name: "Projects", ref: "B-PRO-01", subBoards: [] as any[] },
            { id: 2, name: "Ideas", ref: "B-IDE-02", subBoards: [] as any[] },
            { id: 3, name: "Events", ref: "B-EVE-03", subBoards: [] as any[] }
        ],
        facilitators: ["Alice", "Bob"]
    }
};

export function CommunityManagement() {
    const { id } = useParams();
    const [community, setCommunity] = useState(communityData[Number(id) as keyof typeof communityData]);
    const [isCreatingBoard, setIsCreatingBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");

    // Sub-board management state
    const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
    const [isCreatingSubBoard, setIsCreatingSubBoard] = useState(false);
    const [newSubBoard, setNewSubBoard] = useState({ name: "", topic: "", description: "", sources: [] as string[] });
    const [sourceLink, setSourceLink] = useState("");

    if (!community) {
        return <div className="p-8 text-[#9aa0a6] uppercase tracking-widest font-black">Community Not Found</div>;
    }

    const selectedBoard = community.boards.find(b => b.id === selectedBoardId);

    const handleCreateBoard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBoardName.trim()) return;

        const newBoard = {
            id: community.boards.length + 1,
            name: newBoardName,
            ref: `B-NEW-0${community.boards.length + 1}`,
            subBoards: []
        };

        setCommunity({
            ...community,
            boards: [...community.boards, newBoard]
        });
        setNewBoardName("");
        setIsCreatingBoard(false);
    };

    const handleDeleteBoard = (boardId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("DECOMMISSION SECTOR? All active lanes and threads within this board will be permanently archived and removed from the live directory.")) {
            setCommunity({
                ...community,
                boards: community.boards.filter(b => b.id !== boardId)
            });
        }
    };

    const handleCreateSubBoard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubBoard.name || !selectedBoardId) return;

        const updatedBoards = community.boards.map(board => {
            if (board.id === selectedBoardId) {
                const subBoardWithId = {
                    ...newSubBoard,
                    id: (board.subBoards?.length || 0) + 1
                };
                return {
                    ...board,
                    subBoards: [...(board.subBoards || []), subBoardWithId]
                };
            }
            return board;
        });

        setCommunity({ ...community, boards: updatedBoards as any });
        setNewSubBoard({ name: "", topic: "", description: "", sources: [] });
        setIsCreatingSubBoard(false);
    };

    const handleDeleteSubBoard = (subBoardId: number) => {
        if (window.confirm("DECOMMISSION LANE? This sub-board and all references will be removed from the board's active infrastructure.")) {
            const updatedBoards = community.boards.map(board => {
                if (board.id === selectedBoardId) {
                    return {
                        ...board,
                        subBoards: board.subBoards.filter((sb: any) => sb.id !== subBoardId)
                    };
                }
                return board;
            });
            setCommunity({ ...community, boards: updatedBoards as any });
        }
    };

    const addSource = () => {
        if (!sourceLink.trim()) return;
        setNewSubBoard({ ...newSubBoard, sources: [...newSubBoard.sources, sourceLink] });
        setSourceLink("");
    };

    const removeSource = (index: number) => {
        setNewSubBoard({
            ...newSubBoard,
            sources: newSubBoard.sources.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Context Header */}
            <div className="flex justify-between items-center bg-[#161a20] p-8 border border-[#2a2f3a] shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {selectedBoard ? `${selectedBoard.name} Lane Architect` : community.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-[#4f8cff] text-[10px] uppercase font-black tracking-widest">
                            {selectedBoard ? "Board Sub-Structure" : "Management Control"}
                        </p>
                        <span className="text-[#2a2f3a] text-xs">|</span>
                        <p className="text-[#9aa0a6] text-[10px] uppercase font-bold tracking-widest">Auth ID: {id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {selectedBoard ? (
                        <Button
                            onClick={() => setSelectedBoardId(null)}
                            variant="ghost"
                            className="border border-[#2a2f3a] text-xs uppercase tracking-widest font-bold h-10 px-6 text-[#9aa0a6] hover:text-[#e6e6e6] hover:border-[#4f8cff]/50"
                        >
                            Return to Overview
                        </Button>
                    ) : (
                        <Button variant="ghost" className="border border-[#2a2f3a] text-xs uppercase tracking-widest font-bold h-10 px-6 text-[#9aa0a6] hover:text-[#e6e6e6]">
                            <Settings className="w-4 h-4 mr-2" />
                            Core Config
                        </Button>
                    )}
                </div>
            </div>

            {!selectedBoard ? (
                <>
                    {/* Metrics */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                                <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Health delta</CardTitle>
                                <Activity className="h-4 w-4 text-[#4f8cff]" />
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold tracking-tighter text-[#4f8cff]">92%</div>
                                <p className="text-[10px] text-[#4f8cff]/70 font-bold uppercase mt-1">Stable Governance Path</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                                <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Priority Flags</CardTitle>
                                <Shield className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold tracking-tighter text-orange-500">{community.pendingFlags}</div>
                                <Link to={`/facilitator/community/${id}/moderation`} className="text-[9px] uppercase font-black text-[#4f8cff] mt-2 hover:underline inline-block">
                                    Audit Violations
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                                <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Citizenship</CardTitle>
                                <Users className="h-4 w-4 text-[#9aa0a6]" />
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold tracking-tighter text-[#e6e6e6]">{community.members}</div>
                                <p className="text-[10px] text-[#9aa0a6] font-bold uppercase mt-1">Verified Identities</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* BOARDS MANAGEMENT */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Sector Infrastructure</h3>
                                <Button
                                    onClick={() => setIsCreatingBoard(true)}
                                    size="sm"
                                    className="bg-[#4f8cff] h-8 text-[10px] tracking-widest uppercase font-black px-4 rounded-none hover:bg-[#4f8cff]/80"
                                >
                                    <Plus className="w-3 h-3 mr-2" />
                                    Deploy Sector
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {isCreatingBoard && (
                                    <Card className="bg-[#161a20] border-2 border-[#4f8cff]/50 rounded-none animate-in slide-in-from-top-2">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#4f8cff]/20">
                                            <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#4f8cff]">Sector Architect</CardTitle>
                                            <button onClick={() => setIsCreatingBoard(false)} type="button">
                                                <X className="w-4 h-4 text-[#9aa0a6] hover:text-white" />
                                            </button>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <form onSubmit={handleCreateBoard} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Sector Designation</label>
                                                    <input
                                                        autoFocus
                                                        value={newBoardName}
                                                        onChange={(e) => setNewBoardName(e.target.value)}
                                                        className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] transition-all"
                                                        placeholder="e.g. Zoning & Urban Policy"
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full bg-[#4f8cff] font-bold uppercase tracking-widest text-[10px] h-11 rounded-none">
                                                    Initialize Sector Resources
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}

                                {community.boards.map((board) => (
                                    <div
                                        key={board.id}
                                        className="group relative flex items-center justify-between p-6 bg-[#161a20] border border-[#2a2f3a] hover:border-[#4f8cff]/40 transition-all cursor-pointer"
                                        onClick={() => setSelectedBoardId(board.id)}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 bg-[#2a2f3a]/30 border border-[#2a2f3a] flex items-center justify-center text-[#9aa0a6] group-hover:text-[#4f8cff] group-hover:border-[#4f8cff]/30 transition-all">
                                                <Layers className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[#e6e6e6] group-hover:text-[#4f8cff] transition-colors">{board.name}</h4>
                                                <p className="text-[9px] text-[#9aa0a6] uppercase font-black tracking-widest mt-1">Ref: {board.ref} • {board.subBoards?.length || 0} Functional Lanes</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 border border-[#2a2f3a] hover:text-[#4f8cff]"
                                                    onClick={(e) => { e.stopPropagation(); }}>
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 border border-[#2a2f3a] hover:text-orange-500"
                                                    onClick={(e) => handleDeleteBoard(board.id, e)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                            <Button variant="ghost" className="h-9 w-9 p-0 border border-[#2a2f3a] group-hover:border-[#4f8cff]/50">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CO-FACILITATORS */}
                        <div className="space-y-4">
                            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Authority Roster</h3>
                            <div className="space-y-4">
                                {community.facilitators.map((person, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-[#161a20] border border-[#2a2f3a]">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 bg-[#4f8cff]/10 border border-[#4f8cff]/20 flex items-center justify-center text-[#4f8cff] font-black text-xs">
                                                {person[0]}
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#e6e6e6] text-sm block">{person}</span>
                                                <span className="text-[9px] uppercase font-black tracking-widest text-[#9aa0a6]">Lead Facilitator</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-[9px] uppercase tracking-widest font-black text-orange-500/50 hover:text-orange-500 hover:bg-orange-500/5 h-10 px-4">
                                            Revoke Auth
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full border border-dashed border-[#2a2f3a] h-16 text-[10px] uppercase font-black tracking-widest text-[#9aa0a6] hover:border-[#4f8cff]/40 hover:text-[#4f8cff] transition-all">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Expand Authority Matrix
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-8 max-w-5xl animate-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-end">
                        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Sub-Board Sub-Structure (Lanes)</h3>
                        <Button
                            onClick={() => setIsCreatingSubBoard(true)}
                            size="sm"
                            className="bg-[#4f8cff] h-8 text-[10px] tracking-widest uppercase font-black px-4 rounded-none"
                        >
                            <Plus className="w-3 h-3 mr-2" />
                            Provision Lane
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {isCreatingSubBoard && (
                            <Card className="bg-[#161a20] border-2 border-[#4f8cff]/50 rounded-none animate-in slide-in-from-top-2">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#4f8cff]/20">
                                    <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#4f8cff]">Infrastructure Architect</CardTitle>
                                    <button onClick={() => setIsCreatingSubBoard(false)} type="button">
                                        <X className="w-4 h-4 text-[#9aa0a6] hover:text-white" />
                                    </button>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <form onSubmit={handleCreateSubBoard} className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Lane Designation</label>
                                                <input
                                                    autoFocus
                                                    value={newSubBoard.name}
                                                    onChange={(e) => setNewSubBoard({ ...newSubBoard, name: e.target.value })}
                                                    className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]"
                                                    placeholder="e.g. Zoning Reform Proposals"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Domain Topic</label>
                                                <input
                                                    value={newSubBoard.topic}
                                                    onChange={(e) => setNewSubBoard({ ...newSubBoard, topic: e.target.value })}
                                                    className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]"
                                                    placeholder="e.g. Urban Policy"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Operational Charter / Scope</label>
                                            <textarea
                                                value={newSubBoard.description}
                                                onChange={(e) => setNewSubBoard({ ...newSubBoard, description: e.target.value })}
                                                className="w-full bg-[#0f1115] border border-[#2a2f3a] p-4 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] min-h-[120px] leading-relaxed"
                                                placeholder="Define the specific scope of discussion for this lane..."
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Authority verification Sources (Ledgers/Links)</label>
                                            <div className="flex gap-3">
                                                <input
                                                    value={sourceLink}
                                                    onChange={(e) => setSourceLink(e.target.value)}
                                                    className="flex-1 bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]"
                                                    placeholder="https://ledger-reference.org/..."
                                                />
                                                <Button type="button" onClick={addSource} className="bg-[#2a2f3a] hover:bg-[#3a3f4a] font-bold uppercase tracking-widest text-[9px] h-12 px-6 rounded-none">
                                                    Link Source
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {newSubBoard.sources.map((link, i) => (
                                                    <div key={i} className="flex items-center gap-3 bg-[#0f1115] border border-[#2a2f3a] px-4 py-2">
                                                        <Globe className="w-3 h-3 text-[#4f8cff]" />
                                                        <span className="text-[10px] text-[#e6e6e6] font-mono truncate max-w-[200px]">{link}</span>
                                                        <button type="button" onClick={() => removeSource(i)}>
                                                            <X className="w-3.5 h-3.5 text-[#9aa0a6] hover:text-orange-500" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full bg-[#4f8cff] font-bold uppercase tracking-widest text-[10px] h-14 rounded-none">
                                            Commit Lane Infrastructure to Sector
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {selectedBoard.subBoards?.length === 0 && !isCreatingSubBoard && (
                            <div className="p-24 border border-dashed border-[#2a2f3a] bg-[#161a20]/20 flex flex-col items-center gap-4 text-center">
                                <Layers className="w-12 h-12 text-[#2a2f3a]" />
                                <div className="space-y-1">
                                    <p className="text-[#9aa0a6] uppercase tracking-[0.3em] font-black text-xs">Infrastructure Void</p>
                                    <p className="text-[10px] text-[#9aa0a6]/50 uppercase font-bold tracking-widest leading-loose">No active lanes detected in this sector context.</p>
                                </div>
                            </div>
                        )}

                        {selectedBoard.subBoards?.map((sub: any) => (
                            <Card key={sub.id} className="bg-[#161a20] border-[#2a2f3a] rounded-none group hover:border-[#4f8cff]/40 transition-all overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
                                    <FileText className="w-32 h-32" />
                                </div>
                                <CardHeader className="flex flex-row items-center justify-between border-b border-[#2a2f3a]/50 bg-[#1a1e26]/30">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-[#4f8cff]/5 border border-[#4f8cff]/20 flex items-center justify-center text-[#4f8cff]">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-bold tracking-tight text-[#e6e6e6]">{sub.name}</CardTitle>
                                            <p className="text-[9px] uppercase tracking-widest font-black text-[#4f8cff] mt-0.5">Topic: {sub.topic}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 relative z-10">
                                        <Link to={`/facilitator/community/${id}/board/${selectedBoardId}/sub/${sub.id}/create-thread`}>
                                            <Button variant="ghost" size="sm" className="h-9 border border-[#4f8cff]/30 text-[#4f8cff] text-[9px] uppercase font-black tracking-widest px-4 hover:bg-[#4f8cff]/10">
                                                <MessageSquarePlus className="w-4 h-4 mr-2" />
                                                Initiate directive
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 border border-[#2a2f3a] hover:text-[#4f8cff] hover:bg-[#2a2f3a]/50">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 border border-[#2a2f3a] hover:text-orange-500 hover:bg-orange-500/5"
                                            onClick={() => handleDeleteSubBoard(sub.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    <p className="text-sm text-[#9aa0a6] leading-relaxed italic border-l-2 border-[#4f8cff]/30 pl-6 py-2 bg-[#4f8cff]/2">
                                        "{sub.description}"
                                    </p>

                                    {sub.sources && sub.sources.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {sub.sources.map((link: string, i: number) => (
                                                <a
                                                    key={i}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-3 bg-[#0f1115] border border-[#2a2f3a] hover:border-[#4f8cff]/40 transition-colors group/link"
                                                >
                                                    <LinkIcon className="w-3 h-3 text-[#4f8cff]/60 group-hover/link:text-[#4f8cff]" />
                                                    <span className="text-[10px] text-[#9aa0a6] group-hover/link:text-[#e6e6e6] truncate font-mono">
                                                        {new URL(link).hostname}
                                                    </span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
