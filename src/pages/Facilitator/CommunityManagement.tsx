import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { cn } from "../../lib/utils";
import {
    Settings, Users, Shield, Plus, X,
    Link as LinkIcon, Trash2, MessageSquarePlus,
    ChevronRight, Layers, Globe, Loader2,
    Layout, UserCircle, Save, AlertCircle, Camera, Pencil
} from "lucide-react";
import { useCommunity } from "../../hooks/useCommunity";
import { Input } from "../../components/ui/Input";

export function CommunityManagement() {
    const { id } = useParams();
    const { community, loading, error, createBoard, updateBoard, deleteBoard, createSubBoard, updateSubBoard, deleteSubBoard, addFacilitator, respondToApplication, updateCommunity } = useCommunity(id);

    const [isConfiguring, setIsConfiguring] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        name: "",
        description: "",
        access_type: "OPEN",
    });
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>("");
    const [bannerPreview, setBannerPreview] = useState<string>("");

    const [isCreatingBoard, setIsCreatingBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [boardImageFile, setBoardImageFile] = useState<File | null>(null);
    const [boardImagePreview, setBoardImagePreview] = useState<string>("");
    const boardFileInputRef = useRef<HTMLInputElement>(null);

    const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
    const [editingBoardName, setEditingBoardName] = useState("");

    // Sub-board management state
    const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null); // Changed to string UUID
    const [isCreatingSubBoard, setIsCreatingSubBoard] = useState(false);
    const [editingSubBoardId, setEditingSubBoardId] = useState<string | null>(null);
    const [newSubBoard, setNewSubBoard] = useState({ name: "", topic: "", description: "", sources: [] as string[] });
    const [sourceLink, setSourceLink] = useState("");

    useEffect(() => {
        if (community && !isConfiguring) {
            setSettingsForm({
                name: community.name,
                description: community.description || "",
                access_type: community.access_type || "OPEN",
            });
            setIconPreview(community.image || "");
            setBannerPreview(community.banner || "");
            setIconFile(null);
            setBannerFile(null);
        }
    }, [community, isConfiguring]);

    const handleUpdateSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);

        const formData = new FormData();
        formData.append('name', settingsForm.name);
        formData.append('description', settingsForm.description);
        formData.append('access_type', settingsForm.access_type);
        if (iconFile) formData.append('image', iconFile);
        if (bannerFile) formData.append('banner', bannerFile);

        const res = await updateCommunity(formData);
        setActionLoading(false);
        if (res.success) {
            setIsConfiguring(false);
        } else {
            alert(res.error || "Update failed");
        }
    };

    const handleAddFacilitator = async () => {
        const username = window.prompt("Enter the username of the member to promote to Facilitator:");
        if (username) {
            const res = await addFacilitator(username);
            if (!res.success) alert(res.error || "Failed to add facilitator");
        }
    };

    if (loading) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-10 h-10 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-[0.4em] italic animate-pulse">Loading Community Details...</p>
            </div>
        );
    }

    if (error || !community) {
        return <div className="p-8 text-red-500 uppercase tracking-widest font-black border border-red-500/20 bg-red-500/5 m-8 text-center">Community Not Found or Access Denied</div>;
    }

    const selectedBoard = community.boards?.find((b: any) => b.id === selectedBoardId);

    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBoardName.trim()) return;

        setActionLoading(true);

        const formData = new FormData();
        formData.append('name', newBoardName);
        if (boardImageFile) formData.append('image', boardImageFile);

        const res = await createBoard(formData);
        setActionLoading(false);

        if (res.success) {
            setNewBoardName("");
            setBoardImageFile(null);
            setBoardImagePreview("");
            setIsCreatingBoard(false);
        } else {
            alert(res.error || "Failed to create board");
        }
    };

    const handleUpdateBoardName = async (boardId: string) => {
        if (!editingBoardName.trim()) return;
        setActionLoading(true);
        const res = await updateBoard(boardId, { name: editingBoardName });
        setActionLoading(false);
        if (res.success) {
            setEditingBoardId(null);
        } else {
            alert(res.error || "Failed to update board name");
        }
    };

    const handleUpdateSubBoardData = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubBoard.name || !editingSubBoardId) return;

        setActionLoading(true);
        const res = await updateSubBoard(editingSubBoardId, newSubBoard);
        setActionLoading(false);

        if (res.success) {
            setEditingSubBoardId(null);
            setNewSubBoard({ name: "", topic: "", description: "", sources: [] });
            setIsCreatingSubBoard(false);
        } else {
            alert(res.error || "Failed to update sub-board");
        }
    };

    const handleUpdateBoardImage = async (boardId: string, file: File) => {
        setActionLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        const res = await updateBoard(boardId, formData);
        setActionLoading(false);
        if (!res.success) alert(res.error || "Failed to update board image");
    };

    const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure? This will delete the board and all its sub-boards and discussions.")) {
            await deleteBoard(boardId);
            if (selectedBoardId === boardId) setSelectedBoardId(null);
        }
    };

    const handleCreateSubBoard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubBoard.name || !selectedBoardId) return;

        setActionLoading(true);
        const res = await createSubBoard(selectedBoardId, newSubBoard);
        setActionLoading(false);

        if (res.success) {
            setNewSubBoard({ name: "", topic: "", description: "", sources: [] });
            setIsCreatingSubBoard(false);
        } else {
            alert(res.error || "Failed to create sub-board");
        }
    };

    const handleDeleteSubBoard = async (subBoardId: string) => {
        if (window.confirm("Are you sure? This will delete this sub-board and all discussions within it.")) {
            await deleteSubBoard(subBoardId);
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

    // Calculate generic stats if not present in backend response yet
    const pendingFlags = community.pendingFlags || 0;
    const memberCount = typeof community.members === 'number' ? community.members : (community.members?.length || 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center bg-[#161a20] p-8 border border-[#2a2f3a] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#4f8cff]" />
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-[#e6e6e6]">
                        {selectedBoard ? `Board: ${selectedBoard.name}` : community.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-[#4f8cff] text-[10px] uppercase font-black tracking-widest">
                            {selectedBoard ? "Sub-Board Management" : "Community Management"}
                        </p>
                        <span className="text-[#2a2f3a] text-xs">|</span>
                        <p className="text-[#9aa0a6] text-[10px] uppercase font-bold tracking-widest">ID: {id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {selectedBoard ? (
                        <Button
                            onClick={() => setSelectedBoardId(null)}
                            variant="ghost"
                            className="border border-[#2a2f3a] text-[10px] uppercase tracking-widest font-black h-10 px-6 text-[#9aa0a6] hover:text-[#e6e6e6] hover:border-[#4f8cff]/50"
                        >
                            <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                            Return to Overview
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={() => setIsConfiguring(!isConfiguring)}
                            className={cn(
                                "border text-[10px] uppercase tracking-widest font-black h-10 px-6 transition-all",
                                isConfiguring
                                    ? "bg-[#4f8cff]/10 border-[#4f8cff] text-[#4f8cff]"
                                    : "border-[#2a2f3a] text-[#9aa0a6] hover:text-[#e6e6e6]"
                            )}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            {isConfiguring ? "Discard Changes" : "Configure Settings"}
                        </Button>
                    )}
                </div>
            </div>

            {selectedBoard ? (
                <div className="space-y-8 max-w-5xl animate-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-end border-b border-[#2a2f3a] pb-4">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Sub-Boards</h3>
                        <Button
                            onClick={() => setIsCreatingSubBoard(true)}
                            size="sm"
                            className="bg-[#4f8cff] h-9 text-[9px] tracking-widest uppercase font-black px-6 shadow-lg shadow-[#4f8cff]/10 rounded-none"
                        >
                            <Plus className="w-3 h-3 mr-2" />
                            Create Sub-Board
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {isCreatingSubBoard && (
                            <Card className="bg-[#161a20] border-2 border-[#4f8cff]/50 animate-in slide-in-from-top-2">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#4f8cff]/20">
                                    <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#4f8cff]">
                                        {editingSubBoardId ? "Modify Sub-Board" : "New Sub-Board"}
                                    </CardTitle>
                                    <button onClick={() => {
                                        setIsCreatingSubBoard(false);
                                        setEditingSubBoardId(null);
                                        setNewSubBoard({ name: "", topic: "", description: "", sources: [] });
                                    }} type="button">
                                        <X className="w-4 h-4 text-[#9aa0a6] hover:text-white" />
                                    </button>
                                </CardHeader>
                                <CardContent className="pt-8">
                                    <form onSubmit={editingSubBoardId ? handleUpdateSubBoardData : handleCreateSubBoard} className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Designation / Name</label>
                                                <input
                                                    autoFocus
                                                    value={newSubBoard.name}
                                                    onChange={(e) => setNewSubBoard({ ...newSubBoard, name: e.target.value })}
                                                    className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]"
                                                    placeholder="e.g. General Discussion"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Topic / Category</label>
                                                <input
                                                    value={newSubBoard.topic}
                                                    onChange={(e) => setNewSubBoard({ ...newSubBoard, topic: e.target.value })}
                                                    className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]"
                                                    placeholder="e.g. Miscellaneous"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Description & Rules</label>
                                            <textarea
                                                value={newSubBoard.description}
                                                onChange={(e) => setNewSubBoard({ ...newSubBoard, description: e.target.value })}
                                                className="w-full bg-[#0f1115] border border-[#2a2f3a] p-4 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] min-h-[120px] leading-relaxed"
                                                placeholder="Describe the purpose of this sub-board..."
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Resources / Links</label>
                                            <div className="flex gap-3">
                                                <input
                                                    value={sourceLink}
                                                    onChange={(e) => setSourceLink(e.target.value)}
                                                    className="flex-1 bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]"
                                                    placeholder="https://..."
                                                />
                                                <Button type="button" onClick={addSource} className="bg-[#2a2f3a] hover:bg-[#3a3f4a] font-bold uppercase tracking-widest text-[9px] h-12 px-6 rounded-none">
                                                    Add Link
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

                                        <Button type="submit" disabled={actionLoading} className="w-full bg-[#4f8cff] font-bold uppercase tracking-widest text-[10px] h-12 rounded-none">
                                            {actionLoading ? "Processing..." : editingSubBoardId ? "Commit Protocol Changes" : "Confirm Create Sub-Board"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {(!selectedBoard.subBoards || selectedBoard.subBoards.length === 0) && !isCreatingSubBoard && (
                            <div className="p-24 border border-dashed border-[#2a2f3a] bg-[#161a20]/20 flex flex-col items-center gap-4 text-center">
                                <Layers className="w-12 h-12 text-[#2a2f3a]" />
                                <div className="space-y-1">
                                    <p className="text-[#9aa0a6] uppercase tracking-[0.3em] font-black text-xs">No Sub-Boards</p>
                                    <p className="text-[10px] text-[#9aa0a6]/50 uppercase font-bold tracking-widest leading-loose">Create a sub-board to start discussions.</p>
                                </div>
                            </div>
                        )}

                        {selectedBoard.subBoards?.map((sub: any) => (
                            <Card key={sub.id} className="bg-[#161a20] border-[#2a2f3a] group hover:border-[#4f8cff]/40 transition-all overflow-hidden relative">
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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-9 w-9 p-0 border border-[#2a2f3a] text-[#9aa0a6] hover:text-[#4f8cff] hover:bg-[#4f8cff]/5"
                                            onClick={() => {
                                                setEditingSubBoardId(sub.id);
                                                setNewSubBoard({
                                                    name: sub.name,
                                                    topic: sub.topic,
                                                    description: sub.description,
                                                    sources: sub.sources || []
                                                });
                                                setIsCreatingSubBoard(true);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Link to={`/facilitator/community/${id}/board/${selectedBoardId}/sub/${sub.id}`}>
                                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 border border-[#f0b429]/30 text-[#f0b429] hover:bg-[#f0b429]/10" title="View Sub-board">
                                                <Layout className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Link to={`/facilitator/community/${id}/board/${selectedBoardId}/sub/${sub.id}/create-thread`}>
                                            <Button variant="ghost" size="sm" className="h-9 border border-[#4f8cff]/30 text-[#4f8cff] text-[9px] uppercase font-black tracking-widest px-4 hover:bg-[#4f8cff]/10">
                                                <MessageSquarePlus className="w-4 h-4 mr-2" />
                                                Create Post
                                            </Button>
                                        </Link>
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
            ) : isConfiguring ? (
                <div className="animate-in slide-in-from-top-4 duration-500">
                    <form onSubmit={handleUpdateSettings} className="space-y-8">
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Profile Settings */}
                            <Card className="bg-[#161a20] border-[#2a2f3a] shadow-2xl h-fit">
                                <CardHeader className="border-b border-[#2a2f3a]/50">
                                    <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                                        <UserCircle className="w-4 h-4 text-[#4f8cff]" /> Community Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">Community Name</label>
                                        <Input
                                            value={settingsForm.name}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                                            className="bg-[#0f1115] border-[#2a2f3a] text-[#e6e6e6] rounded-none font-bold tracking-tight h-12"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">Description</label>
                                        <textarea
                                            value={settingsForm.description}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                                            className="w-full bg-[#0f1115] border border-[#2a2f3a] text-[#e6e6e6] rounded-none p-4 text-sm font-medium min-h-[120px] focus:outline-none focus:border-[#4f8cff]/50 leading-relaxed italic"
                                        />
                                    </div>

                                    <div className="space-y-6 pt-4 border-t border-[#2a2f3a]/50">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-[#4f8cff]">Visual Identity</label>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Icon Upload */}
                                            <div className="space-y-4">
                                                <label className="text-[9px] uppercase tracking-widest font-bold text-[#9aa0a6]">Community Icon</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 h-20 bg-[#0f1115] border border-[#2a2f3a] flex items-center justify-center overflow-hidden">
                                                        {iconPreview ? (
                                                            <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Globe className="w-8 h-8 text-[#2a2f3a]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="file"
                                                            id="icon-upload"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    setIconFile(file);
                                                                    setIconPreview(URL.createObjectURL(file));
                                                                }
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => document.getElementById('icon-upload')?.click()}
                                                            className="h-10 text-[8px] uppercase font-black border-[#2a2f3a] rounded-none px-4"
                                                        >
                                                            <Camera className="w-3.5 h-3.5 mr-2" />
                                                            Choose Local Image
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Banner Upload */}
                                            <div className="space-y-4">
                                                <label className="text-[9px] uppercase tracking-widest font-bold text-[#9aa0a6]">Brand Banner</label>
                                                <div className="space-y-3">
                                                    <div className="w-full h-20 bg-[#0f1115] border border-[#2a2f3a] flex items-center justify-center overflow-hidden">
                                                        {bannerPreview ? (
                                                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-[9px] text-[#2a2f3a] font-black uppercase tracking-widest">No Banner Selected</div>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        id="banner-upload"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setBannerFile(file);
                                                                setBannerPreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById('banner-upload')?.click()}
                                                        className="h-10 w-full text-[8px] uppercase font-black border-[#2a2f3a] rounded-none"
                                                    >
                                                        <Camera className="w-3.5 h-3.5 mr-2" />
                                                        Choose Banner Asset
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Access & Protocol Settings */}
                            <div className="space-y-8">
                                <Card className="bg-[#161a20] border-[#2a2f3a] shadow-2xl">
                                    <CardHeader className="border-b border-[#2a2f3a]/50">
                                        <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-orange-500" /> Access Rules
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-8 space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">Who Can Join</label>
                                            <div className="grid gap-3">
                                                {['OPEN', 'APPLICATION', 'INVITE'].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setSettingsForm({ ...settingsForm, access_type: type })}
                                                        className={cn(
                                                            "w-full p-4 border text-left flex items-center justify-between transition-all group",
                                                            settingsForm.access_type === type
                                                                ? "bg-[#4f8cff]/5 border-[#4f8cff] text-[#e6e6e6]"
                                                                : "bg-[#0f1115] border-[#2a2f3a] text-[#9aa0a6] hover:border-[#2a2f3a]*2"
                                                        )}
                                                    >
                                                        <div>
                                                            <div className="font-black text-xs tracking-widest uppercase">{type} ACCESS</div>
                                                            <div className="text-[9px] font-medium opacity-60 mt-0.5">
                                                                {type === 'OPEN' && "Anyone can join this community instantly."}
                                                                {type === 'APPLICATION' && "Prospective members must submit an application for review."}
                                                                {type === 'INVITE' && "Entrance is restricted to manual facilitator invitations."}
                                                            </div>
                                                        </div>
                                                        <div className={cn(
                                                            "w-4 h-4 rounded-full border-2",
                                                            settingsForm.access_type === type ? "border-[#4f8cff] bg-[#4f8cff] shadow-[0_0_8px_rgba(79,140,255,0.5)]" : "border-[#2a2f3a]"
                                                        )} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* MONETIZATION PLACEHOLDER */}
                                <Card className="bg-[#161a20] border-[#2a2f3a] opacity-50 grayscale pointer-events-none">
                                    <CardHeader className="border-b border-[#2a2f3a]/50 bg-black/20">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] flex items-center gap-2">
                                                <Globe className="w-4 h-4" /> Community Monetization
                                            </CardTitle>
                                            <span className="text-[8px] font-black bg-[#2a2f3a] text-[#9aa0a6] px-2 py-0.5 tracking-widest uppercase">Coming Soon</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="py-6 italic text-[9px] text-[#9aa0a6] leading-relaxed">
                                        Monetization and economic features will be enabled in a future update.
                                        Facilitators will be able to manage community funds and member rewards.
                                    </CardContent>
                                </Card>

                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-none shadow-xl shadow-[#4f8cff]/10"
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <><Save className="w-4 h-4 mr-2" /> Save Settings</>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsConfiguring(false)}
                                        className="px-8 border border-[#2a2f3a] text-[#9aa0a6] hover:text-[#e6e6e6] font-black uppercase tracking-[0.2em] text-[10px] h-14 rounded-none"
                                    >
                                        Abort
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#4f8cff]/5 border border-[#4f8cff]/20 p-6 flex items-start gap-4">
                            <AlertCircle className="w-5 h-5 text-[#4f8cff] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-[#4f8cff] uppercase tracking-[0.2em]">Important Note</p>
                                <p className="text-xs text-[#9aa0a6] mt-1 leading-relaxed">
                                    Updating these rules will immediately change how new members join.
                                    Existing members will not be affected, but all community settings will align with the new configuration.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    {/* Metrics */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="bg-[#161a20] border-[#2a2f3a] shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                                <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Pending Applications</CardTitle>
                                <Users className="h-4 w-4 text-[#4f8cff]" />
                            </CardHeader>
                            <CardContent className="pt-8">
                                <div className="text-3xl font-black tracking-tighter text-[#4f8cff]">{community.pending_applications?.length || 0}</div>
                                <p className="text-[9px] text-[#4f8cff]/70 font-black uppercase mt-2 tracking-widest">Awaiting Review</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#161a20] border-[#2a2f3a] shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                                <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Pending Moderation</CardTitle>
                                <Shield className="h-4 w-4 text-orange-500" />
                            </CardHeader>
                            <CardContent className="pt-8">
                                <div className="text-3xl font-black tracking-tighter text-orange-500">{pendingFlags}</div>
                                <Link to={`/facilitator/community/${id}/moderation`} className="text-[9px] uppercase font-black text-[#4f8cff] mt-2 hover:underline inline-block tracking-widest">
                                    Review Flagged Items
                                </Link>
                            </CardContent>
                        </Card>
                        <Card className="bg-[#161a20] border-[#2a2f3a] shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#2a2f3a]/50">
                                <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Members</CardTitle>
                                <Users className="h-4 w-4 text-[#9aa0a6]" />
                            </CardHeader>
                            <CardContent className="pt-8">
                                <div className="text-3xl font-black tracking-tighter text-[#e6e6e6]">{memberCount}</div>
                                <p className="text-[9px] text-[#9aa0a6] font-black uppercase mt-2 tracking-widest">Verified Accounts</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-2">
                        {/* BOARDS MANAGEMENT */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-[#2a2f3a] pb-4">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6]">Boards Structure</h3>
                                <Button
                                    onClick={() => setIsCreatingBoard(true)}
                                    size="sm"
                                    className="bg-[#4f8cff] h-8 text-[9px] tracking-widest uppercase font-black px-4 rounded-none hover:bg-[#4f8cff]/90"
                                >
                                    <Plus className="w-3 h-3 mr-2" />
                                    Create Board
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {isCreatingBoard && (
                                    <Card className="bg-[#161a20] border-2 border-[#4f8cff]/50 animate-in slide-in-from-top-2">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-[#4f8cff]/20">
                                            <CardTitle className="text-[10px] uppercase tracking-[0.3em] font-black text-[#4f8cff]">New Board</CardTitle>
                                            <button onClick={() => setIsCreatingBoard(false)} type="button">
                                                <X className="w-4 h-4 text-[#9aa0a6] hover:text-white" />
                                            </button>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <form onSubmit={handleCreateBoard} className="space-y-6">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Board Name</label>
                                                        <input
                                                            autoFocus
                                                            value={newBoardName}
                                                            onChange={(e) => setNewBoardName(e.target.value)}
                                                            className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] transition-all"
                                                            placeholder="e.g. Projects, Ideas, Announcements"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#9aa0a6]">Board Image (Optional)</label>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 bg-[#0f1115] border border-[#2a2f3a] flex items-center justify-center overflow-hidden">
                                                                {boardImagePreview ? (
                                                                    <img src={boardImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Layout className="w-6 h-6 text-[#2a2f3a]" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <input
                                                                    type="file"
                                                                    ref={boardFileInputRef}
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            setBoardImageFile(file);
                                                                            setBoardImagePreview(URL.createObjectURL(file));
                                                                        }
                                                                    }}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => boardFileInputRef.current?.click()}
                                                                    className="h-10 text-[8px] uppercase font-black border-[#2a2f3a] rounded-none px-4"
                                                                >
                                                                    <Camera className="w-3.5 h-3.5 mr-2" />
                                                                    Choose Image
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button type="submit" disabled={actionLoading || !newBoardName.trim()} className="w-full bg-[#4f8cff] font-bold uppercase tracking-widest text-[10px] h-10 rounded-none">
                                                    {actionLoading ? "Creating..." : "Confirm Create Board"}
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>
                                )}

                                {(!community.boards || community.boards.length === 0) && !isCreatingBoard && (
                                    <div className="p-12 border border-dashed border-[#2a2f3a] text-center">
                                        <p className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest italic">No boards found.</p>
                                    </div>
                                )}

                                {community.boards?.map((board: any) => (
                                    <div
                                        key={board.id}
                                        className="group relative flex items-center justify-between p-6 bg-[#161a20] border border-[#2a2f3a] hover:border-[#4f8cff]/40 transition-all cursor-pointer shadow-sm hover:shadow-md"
                                        onClick={() => setSelectedBoardId(board.id)}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="relative group/avatar">
                                                <div className="w-10 h-10 bg-[#2a2f3a]/30 border border-[#2a2f3a] flex items-center justify-center text-[#9aa0a6] group-hover:text-[#4f8cff] group-hover:border-[#4f8cff]/30 transition-all overflow-hidden rounded-full">
                                                    {board.image ? (
                                                        <img src={board.image} alt={board.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Layout className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = 'image/*';
                                                        input.onchange = (ev) => {
                                                            const file = (ev.target as HTMLInputElement).files?.[0];
                                                            if (file) handleUpdateBoardImage(board.id, file);
                                                        };
                                                        input.click();
                                                    }}
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-full"
                                                >
                                                    <Camera className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                            <div>
                                                {editingBoardId === board.id ? (
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            autoFocus
                                                            value={editingBoardName}
                                                            onChange={(e) => setEditingBoardName(e.target.value)}
                                                            className="bg-[#0f1115] border border-[#4f8cff]/50 p-1 text-sm text-[#e6e6e6] focus:outline-none"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleUpdateBoardName(board.id);
                                                                if (e.key === 'Escape') setEditingBoardId(null);
                                                            }}
                                                        />
                                                        <button onClick={() => handleUpdateBoardName(board.id)} className="p-1 bg-[#4f8cff] text-white rounded-sm hover:bg-[#4f8cff]/90"><Save className="w-3 h-3" /></button>
                                                        <button onClick={() => setEditingBoardId(null)} className="p-1 bg-[#2a2f3a] text-[#9aa0a6] rounded-sm hover:bg-[#3a3f4a]"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ) : (
                                                    <h4 className="font-bold text-[#e6e6e6] group-hover:text-[#4f8cff] transition-colors">{board.name}</h4>
                                                )}
                                                <p className="text-[9px] text-[#9aa0a6] uppercase font-black tracking-widest mt-1">
                                                    {board.subBoards?.length || 0} Sub-Boards
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 border border-[#2a2f3a] text-[#9aa0a6] hover:text-[#4f8cff]"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingBoardId(board.id);
                                                        setEditingBoardName(board.name);
                                                    }}>
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Link to={`/facilitator/community/${id}/board/${board.id}`} onClick={(e) => e.stopPropagation()}>
                                                    <Button size="sm" variant="ghost" className="h-9 w-9 p-0 border border-[#f0b429]/30 text-[#f0b429] hover:bg-[#f0b429]/10" title="Enter Board View">
                                                        <Globe className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 border border-[#2a2f3a] hover:text-orange-500 hover:bg-orange-500/10"
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

                        {/* PENDING APPLICATIONS */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] border-b border-[#2a2f3a] pb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-orange-500" />
                                Pending Applications
                            </h3>
                            <div className="space-y-4">
                                {(!community.pending_applications || community.pending_applications.length === 0) && (
                                    <div className="p-8 border border-dashed border-[#2a2f3a] text-center">
                                        <p className="text-[9px] text-[#9aa0a6] uppercase font-black tracking-widest italic opacity-50">No pending requests.</p>
                                    </div>
                                )}
                                {community.pending_applications?.map((app: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-[#161a20] border border-[#2a2f3a] border-l-2 border-l-orange-500/50">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                                                <UserCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#e6e6e6] text-sm block">{app.username}</span>
                                                <span className="text-[9px] uppercase font-black tracking-widest text-[#9aa0a6]">Requesting Access</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={async () => {
                                                    const res = await respondToApplication(app.username, true);
                                                    if (!res.success) alert(res.error);
                                                }}
                                                size="sm"
                                                className="bg-green-500 hover:bg-green-600 text-black font-black uppercase tracking-widest text-[9px] h-9 px-4 rounded-none"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                onClick={async () => {
                                                    if (window.confirm("Reject this application?")) {
                                                        const res = await respondToApplication(app.username, false);
                                                        if (!res.success) alert(res.error);
                                                    }
                                                }}
                                                size="sm"
                                                variant="ghost"
                                                className="border border-[#2a2f3a] text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-[9px] h-9 px-4 rounded-none"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* FACILITATORS */}
                            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] border-b border-[#2a2f3a] pb-4 pt-10">Facilitators</h3>
                            <div className="space-y-4">
                                {community.facilitators?.map((person: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-[#161a20] border border-[#2a2f3a]">
                                        <div className="flex items-center gap-5">
                                            <div className="w-10 h-10 bg-[#4f8cff]/10 border border-[#4f8cff]/20 flex items-center justify-center text-[#4f8cff] font-black text-xs">
                                                {person.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#e6e6e6] text-sm block">{person.name}</span>
                                                <span className="text-[9px] uppercase font-black tracking-widest text-[#9aa0a6]">{person.bio || "Administrator"}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button onClick={handleAddFacilitator} variant="ghost" className="w-full border border-dashed border-[#2a2f3a] h-14 text-[9px] uppercase font-black tracking-widest text-[#9aa0a6] hover:border-[#4f8cff]/40 hover:text-[#4f8cff] transition-all">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Facilitator
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
