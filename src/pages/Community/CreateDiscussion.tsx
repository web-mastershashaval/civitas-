import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, ShieldAlert, BarChart3, Info } from "lucide-react";
import { useNudge } from "../../components/features/NudgeProvider";

// Mock sub-board data for context
const subBoardContext = {
    1: { name: "Zoning Reform Proposals", boardName: "Housing & Zoning" },
    2: { name: "Rent Control Research", boardName: "Housing & Zoning" },
    3: { name: "Public Housing Models", boardName: "Housing & Zoning" },
    4: { name: "Announcements", boardName: "General Discussion" },
    5: { name: "Introductions", boardName: "General Discussion" }
};

export function CreateDiscussion() {
    const { id, boardId, subBoardId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isFacilitatorMode = location.pathname.includes('/facilitator');

    const context = subBoardContext[Number(subBoardId) as keyof typeof subBoardContext];

    const [formData, setFormData] = useState({
        type: isFacilitatorMode ? "System Directive" : "Evidence / Research",
        title: "",
        mainContent: "",
        sources: ""
    });

    const { addNudge } = useNudge();
    const [isRateLimited, setIsRateLimited] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFacilitatorMode) {
            // Simulated Phase 4 Governance Check for Members
            if (formData.title.toLowerCase().includes("spam")) {
                addNudge(
                    "System Nudge: This community enforces strict quality rules. Your contribution contains keywords flagged as potential spam. Please revise or your account may be temporarily locked.",
                    "error",
                    true
                );
                return;
            }

            // Simulated Rate Limit for Members
            if (isRateLimited) {
                addNudge(
                    "Rate Limit Active: You have reached the maximum number of contributions for this 24-hour window as defined in the community charter.",
                    "warning"
                );
                return;
            }
        }

        console.log(`${isFacilitatorMode ? 'ADMIN' : 'MEMBER'} creating discussion:`, formData);

        if (!isFacilitatorMode) {
            setIsRateLimited(true);
        }

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
    };

    if (!context) {
        return <div className="p-8 text-[#9aa0a6] uppercase tracking-widest font-black">Context Resolution Error</div>;
    }

    const themeColors = isFacilitatorMode
        ? { accent: "#f0b429", hover: "#f0b429/90", border: "#f0b429/30", bg: "#1a1610" }
        : { accent: "#4f8cff", hover: "#4f8cff/90", border: "#2a2f3a", bg: "#161a20" };

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
                            {context.boardName} <span className="mx-1 text-[#2a2f3a]">/</span> {context.name}
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-[#e6e6e6]">
                            {isFacilitatorMode ? "Initiate System Directive" : "Record Contribution"}
                        </h1>
                    </div>
                </div>
                {isFacilitatorMode && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f0b429]/10 border border-[#f0b429]/30">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#f0b429]" />
                        <span className="text-[9px] uppercase font-black text-[#f0b429] tracking-widest">Administrative Authority</span>
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
                                <BarChart3 className="w-3 h-3" /> Entry Classification
                            </label>
                            <select
                                className="w-full bg-[#0f1115] border border-[#2a2f3a] p-3.5 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] transition-all"
                                style={{ borderColor: isFacilitatorMode ? 'rgba(240, 180, 41, 0.3)' : undefined }}
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                {isFacilitatorMode ? (
                                    <>
                                        <option>System Directive</option>
                                        <option>Official Inquiry</option>
                                        <option>Governance Proposal</option>
                                        <option>Safety Alert</option>
                                    </>
                                ) : (
                                    <>
                                        <option>Evidence / Research</option>
                                        <option>Question</option>
                                        <option>Insight</option>
                                        <option>General Observation</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6] flex items-center gap-2">
                                <Info className="w-3 h-3" /> Designation / Title
                            </label>
                            <input
                                placeholder={isFacilitatorMode ? "e.g. Directive regarding Zoning Bylaws" : "Clear, neutralized title"}
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
                            {isFacilitatorMode ? "Official Instruction / Context" : "Main Claim / Question"}
                        </label>
                        <textarea
                            className="w-full bg-[#0f1115] border border-[#2a2f3a] p-4 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] transition-all min-h-[180px] leading-relaxed"
                            style={{ borderColor: isFacilitatorMode ? 'rgba(240, 180, 41, 0.3)' : undefined }}
                            value={formData.mainContent}
                            onChange={(e) => setFormData({ ...formData, mainContent: e.target.value })}
                            required
                        />
                    </div>

                    {/* Sources */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">Authority References / Sources</label>
                        <textarea
                            className="w-full bg-[#0f1115] border border-[#2a2f3a] p-4 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff] transition-all min-h-[100px] text-[12px] font-mono"
                            style={{ borderColor: isFacilitatorMode ? 'rgba(240, 180, 41, 0.3)' : undefined }}
                            placeholder="Provide ledger references or external links..."
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
                        disabled={!formData.title || !formData.mainContent}
                    >
                        {isFacilitatorMode ? "Commit System Directive" : "Commit to Live Ledger"}
                    </Button>
                </div>

                <p className="text-center text-[9px] text-[#9aa0a6] uppercase tracking-widest font-bold opacity-50">
                    Entries committed to the ledger are immutable and bound by civic governance.
                </p>
            </form>
        </div>
    );
}
