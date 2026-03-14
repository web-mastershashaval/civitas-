import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, ShieldAlert, BarChart3, Info, Loader2, Camera, X } from "lucide-react";
import { useNudge } from "../../components/features/NudgeProvider";
import api, { ledgerService } from "../../services/api";

export function CreateDiscussion() {
    const { id, boardId, subBoardId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isFacilitatorMode = location.pathname.includes('/facilitator');

    const [context, setContext] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        type: isFacilitatorMode ? "System Directive" : "Evidence / Research",
        title: "",
        mainContent: "",
        sources: ""
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { addNudge } = useNudge();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchContext = async () => {
            if (!subBoardId) return;
            try {
                const response = await api.get(`/sub-boards/${subBoardId}/`);
                setContext(response.data);
            } catch (err) {
                console.error("Context resolution failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContext();
    }, [subBoardId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                addNudge("Image size exceeds 5MB limit.", "error", true);
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Nudging Logic
    useEffect(() => {
        const checkNudges = () => {
            if (!formData.mainContent) return;

            // Citation Nudge
            if (context?.requires_citations && !formData.mainContent.includes('http')) {
                addNudge("High Governance Board: Please include citations or URLs to support your research.", "warning");
            }

            // Civility/Context Nudge (Simple check for demonstration - could be expanded with API terms)
            const commonTriggerTerms = ['kill', 'hate', 'attack', 'idiot'];
            const foundTerm = commonTriggerTerms.find(term => formData.mainContent.toLowerCase().includes(term));
            if (foundTerm) {
                addNudge(`Governance Reminder: Your post contains terms that may require facilitator review in this context.`, "warning");
            }
        };

        const timer = setTimeout(checkNudges, 2000);
        return () => clearTimeout(timer);
    }, [formData.mainContent, context, addNudge]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const submissionData = new FormData();
            submissionData.append('sub_board', subBoardId!);
            submissionData.append('title', formData.title);
            submissionData.append('content', formData.mainContent);
            submissionData.append('type', formData.type);

            // Handle sources - send as JSON string if simple list not supported by multipart parser directly without config
            // But let's try sending as stringified JSON which DRF usually parses for JSONField
            if (formData.sources) {
                submissionData.append('sources', JSON.stringify([formData.sources]));
            }

            if (imageFile) {
                submissionData.append('image', imageFile);
            }

            await ledgerService.createDiscussion(submissionData);

            addNudge(
                isFacilitatorMode
                    ? "AUTHORITY VERIFIED: Your system directive has been committed to the ledger."
                    : "Success: Your contribution has been recorded and is now bound by the community governance rules.",
                "info"
            );

            setTimeout(() => {
                const redirectPath = isFacilitatorMode
                    ? `/facilitator/community/${id}/manage`
                    : `/member/community/${id}/board/${boardId}/sub/${subBoardId}`;
                navigate(redirectPath);
            }, 1500);
        } catch (err: any) {
            const detail = err.response?.data?.detail || "Action Blocked by Governance Engine.";
            addNudge(detail, "error", true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Connecting to Community...</p>
            </div>
        );
    }

    if (!context) {
        return (
            <div className="p-12 border border-red-500/20 bg-red-500/5 text-red-500 max-w-2xl mx-auto mt-20 text-center">
                <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Sub-board Error</p>
                <p className="text-sm italic opacity-80">This sub-board could not be found.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Nav Header */}
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#2a2f3a]">
                <div className="flex items-center gap-4">
                    <Link to={isFacilitatorMode ? `/facilitator/community/${id}/manage` : `/member/community/${id}/board/${boardId}/sub/${subBoardId}`}>
                        <Button variant="ghost" className="h-10 w-10 p-0 border border-[#2a2f3a] text-[#9aa0a6] hover:text-[#e6e6e6]">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#9aa0a6]">
                            {context.boardName || "Board"} <span className="mx-1 text-[#2a2f3a]">/</span> {context.name}
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-[#e6e6e6]">
                            {isFacilitatorMode ? "Post Announcement" : "Create Thread"}
                        </h1>
                    </div>
                </div>
                {isFacilitatorMode && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0b429]/10 border border-[#f0b429]/30">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#f0b429]" />
                        <span className="text-[9px] uppercase font-black text-[#f0b429] tracking-widest">Facilitator Post</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Form Body Card */}
                <div className="bg-[#161a20] border border-[#2a2f3a] p-8 space-y-6 shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Discussion Type */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6] flex items-center gap-2">
                                <BarChart3 className="w-3 h-3" /> Post Type
                            </label>
                            <select
                                className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] transition-all"
                                style={{ borderColor: isFacilitatorMode ? 'rgba(240, 180, 41, 0.3)' : undefined }}
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                {isFacilitatorMode ? (
                                    <>
                                        <option>Post Announcement</option>
                                        <option>Official Inquiry</option>
                                        <option>Board Proposal</option>
                                        <option>Notice</option>
                                    </>
                                ) : (
                                    <>
                                        <option>Proposal</option>
                                        <option>Question</option>
                                        <option>Check</option>
                                        <option>General</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6] flex items-center gap-2">
                                <Info className="w-3 h-3" /> Title
                            </label>
                            <input
                                placeholder={isFacilitatorMode ? "e.g. Announcement regarding Zoning" : "Enter a clear title"}
                                className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] transition-all shadow-inner"
                                style={{ borderColor: isFacilitatorMode ? 'rgba(240, 180, 41, 0.3)' : undefined }}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">
                            Content
                        </label>
                        <textarea
                            className="w-full bg-[#0f1115] border border-[#2a2f3a] p-4 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] transition-all min-h-[180px] leading-relaxed"
                            style={{ borderColor: isFacilitatorMode ? 'rgba(240, 180, 41, 0.3)' : undefined }}
                            value={formData.mainContent}
                            onChange={(e) => setFormData({ ...formData, mainContent: e.target.value })}
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4 pt-4 border-t border-[#2a2f3a]">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6] flex items-center gap-2">
                                <Camera className="w-3.5 h-3.5" /> Attach Image (Optional)
                            </label>
                            {imagePreview && (
                                <button type="button" onClick={removeImage} className="text-[9px] uppercase font-black text-red-500 hover:text-red-400 flex items-center gap-1">
                                    <X className="w-3 h-3" /> Remove
                                </button>
                            )}
                        </div>

                        {!imagePreview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border border-dashed border-[#2a2f3a] bg-[#0f1115] hover:bg-[#161a20] p-8 text-center cursor-pointer transition-colors group"
                            >
                                <Camera className="w-8 h-8 text-[#2a2f3a] mx-auto mb-3 group-hover:text-[#4f8cff]" />
                                <p className="text-xs text-[#9aa0a6] font-medium group-hover:text-[#e6e6e6]">Click to upload an image</p>
                                <p className="text-[9px] text-[#9aa0a6]/50 mt-1 uppercase tracking-widest">Max 5MB • JPG, PNG</p>
                            </div>
                        ) : (
                            <div className="relative w-full max-w-sm border border-[#2a2f3a] bg-[#0f1115] p-1">
                                <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover opacity-80" />
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* Sources */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">References / Sources</label>
                        <textarea
                            className="w-full bg-[#0f1115] border border-[#2a2f3a] p-4 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] transition-all min-h-[100px] text-[12px] font-mono"
                            style={{ borderColor: isFacilitatorMode ? 'rgba(240, 180, 41, 0.3)' : undefined }}
                            placeholder="Provide any links or references..."
                            value={formData.sources}
                            onChange={(e) => setFormData({ ...formData, sources: e.target.value })}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl"
                        style={{
                            backgroundColor: isFacilitatorMode ? '#f0b429' : '#4f8cff',
                            color: isFacilitatorMode ? '#000' : '#fff'
                        }}
                        disabled={isSubmitting || !formData.title || !formData.mainContent}
                    >
                        {isSubmitting ? "Posting..." : (isFacilitatorMode ? "Post Announcement" : "Create Thread")}
                    </Button>
                </div>

                <p className="text-center text-[9px] text-[#9aa0a6] uppercase tracking-widest font-bold opacity-50">
                    Posts are saved to the community and bound by rules.
                </p>
            </form>
        </div>
    );
}
