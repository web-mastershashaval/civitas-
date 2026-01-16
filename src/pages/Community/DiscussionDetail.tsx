import { useParams, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { ShieldCheck, AlertCircle } from "lucide-react";

// Mock data
const discussionData = {
    1: {
        title: "Impact of zoning laws on housing density",
        author: "John",
        timestamp: "3 days ago",
        type: "Proposal",
        boardName: "General Policy",
        body: "A discussion on whether easing zoning restrictions can effectively reduce housing shortages without harming neighborhoods. Evidence from cities that have relaxed zoning shows mixed results, with some experiencing increased housing supply while others face challenges with infrastructure and community character.",
        sources: ["https://urban-studies-ledger.org/zoning-2024"],
        responses: [
            {
                id: 1,
                author: "Alice",
                timestamp: "2 days ago",
                type: "Supporting Evidence",
                content: "Studies from Minneapolis show that eliminating single-family zoning led to a 12% increase in housing permits within two years."
            },
            {
                id: 2,
                author: "Bob",
                timestamp: "1 day ago",
                type: "Clarification",
                content: "How do we ensure that increased density doesn't overwhelm existing infrastructure like schools and transportation?"
            },
            {
                id: 3,
                author: "System Facilitator",
                timestamp: "12 hours ago",
                type: "Facilitator Intervention",
                isOfficial: true,
                content: "Official Notice: This thread will be moved to the 'Urban Policy' lane for specialized review by the architectural committee if it reaches 50+ endorsements."
            }
        ]
    }
};

export function DiscussionDetail() {
    const { id, discussionId } = useParams();
    const location = useLocation();
    const isFacilitatorMode = location.pathname.includes('/facilitator');

    const discussion = discussionData[Number(discussionId) as keyof typeof discussionData] || discussionData[1];
    const [responseType, setResponseType] = useState(isFacilitatorMode ? "Facilitator Intervention" : "Clarification");
    const [responseContent, setResponseContent] = useState("");

    const handleSubmitResponse = (e: React.FormEvent) => {
        e.preventDefault();
        setResponseContent("");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {isFacilitatorMode && (
                <div className="bg-[#f0b429]/10 border border-[#f0b429]/20 p-4 flex items-center gap-3 text-[#f0b429]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Administrative Override Mode: Facilitator Authority Enabled</span>
                </div>
            )}

            {/* Thread Header */}
            <div className="border border-[#2a2f3a] bg-[#161a20] p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black px-2 py-0.5 bg-[#4f8cff]/10 text-[#4f8cff] border border-[#4f8cff]/20">
                        {discussion.type}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6]">
                        Ref: T-{id}-{discussionId}
                    </span>
                </div>

                <h1 className="text-3xl font-bold mb-4 tracking-tight">{discussion.title}</h1>

                <div className="flex items-center gap-3 text-xs text-[#9aa0a6] mb-8 pb-8 border-b border-[#2a2f3a]">
                    <Link to={`/member/profile/${discussion.author}`} className="font-bold text-[#e6e6e6] hover:text-[#4f8cff] transition-colors underline-offset-4 hover:underline">
                        Started by {discussion.author}
                    </Link>
                    <span>•</span>
                    <span>{discussion.timestamp}</span>
                    <span>•</span>
                    <span className="uppercase tracking-widest">Board: {discussion.boardName}</span>
                </div>

                <div className="prose prose-invert max-w-none">
                    <p className="text-[#e6e6e6] leading-relaxed text-lg italic">
                        "{discussion.body}"
                    </p>
                </div>

                {discussion.sources && discussion.sources.length > 0 && (
                    <div className="mt-8 pt-8 border-t border-[#2a2f3a]">
                        <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6] mb-3">Verification Sources</h4>
                        {discussion.sources.map((source, i) => (
                            <a key={i} href={source} className="text-sm text-[#4f8cff] hover:underline block font-medium">
                                {source}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Interaction Controls */}
            <div className="flex gap-2">
                {["Endorse", "Challenge", "Clarify", "Follow"].map((action) => (
                    <Button
                        key={action}
                        variant="ghost"
                        className="text-[10px] uppercase tracking-widest font-bold text-[#9aa0a6] border border-[#2a2f3a] h-9 px-4 hover:border-[#4f8cff]/40 hover:text-[#e6e6e6]"
                    >
                        {action}
                    </Button>
                ))}
            </div>

            {/* Response Section */}
            <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-black text-[#9aa0a6] pt-4">Ledger Responses</h3>

                {discussion.responses.map((response: any) => (
                    <article
                        key={response.id}
                        className={`border ${response.isOfficial ? 'border-[#f0b429]/40 bg-[#f0b429]/5' : 'border-[#2a2f3a] bg-[#161a20]/50'} p-6 flex gap-6 group relative`}
                    >
                        <div className={`shrink-0 w-1 ${response.isOfficial ? 'bg-[#f0b429]' : 'bg-[#4f8cff]/20'}`} />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold ${response.isOfficial ? 'text-[#f0b429]' : 'text-[#4f8cff]'}`}>
                                        {response.type}
                                    </span>
                                    {response.isOfficial && <AlertCircle className="w-3 h-3 text-[#f0b429]" />}
                                </div>
                                <div className="text-[10px] text-[#9aa0a6] font-medium uppercase tracking-tighter flex gap-2">
                                    <Link to={`/member/profile/${response.author}`} className="text-[#e6e6e6] font-bold hover:text-[#4f8cff] hover:underline transition-colors">
                                        Authored by {response.author}
                                    </Link>
                                    <span>•</span>
                                    <span>{response.timestamp}</span>
                                </div>
                            </div>
                            <p className={`${response.isOfficial ? 'text-[#f0b429]/90' : 'text-[#e6e6e6]'} text-sm leading-relaxed`}>
                                {response.content}
                            </p>

                            <div className="mt-4 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className={`text-[9px] uppercase tracking-widest font-black ${response.isOfficial ? 'text-[#f0b429]' : 'text-[#4f8cff]'} hover:text-[#e6e6e6] transition-colors`} onClick={() => {
                                    setResponseContent(`@${response.author} `);
                                    document.getElementById('commit-form')?.scrollIntoView({ behavior: 'smooth' });
                                }}>
                                    Reply to {response.isOfficial ? 'Official' : response.author}
                                </button>
                                <button className="text-[9px] uppercase tracking-widest font-black text-[#9aa0a6] hover:text-[#e6e6e6] transition-colors">
                                    Challenge
                                </button>
                                <button className="text-[9px] uppercase tracking-widest font-black text-[#9aa0a6] hover:text-[#e6e6e6] transition-colors">
                                    Agree
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Add Response Form */}
            <div id="commit-form" className={`border ${isFacilitatorMode ? 'border-[#f0b429]/30' : 'border-[#2a2f3a]'} bg-[#0f1115] p-8 mt-12 bg-gradient-to-b from-[#161a20] to-[#0f1115]`}>
                <h3 className="text-sm uppercase tracking-[0.2em] font-black text-[#e6e6e6] mb-6">
                    {isFacilitatorMode ? "Exercise System Authority" : "Commit Response"}
                </h3>

                <form onSubmit={handleSubmitResponse} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-[#9aa0a6]">Contribution Level</label>
                            <select
                                className={`w-full bg-[#161a20] border ${isFacilitatorMode ? 'border-[#f0b429]/20' : 'border-[#2a2f3a]'} rounded-sm p-3 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]/50`}
                                value={responseType}
                                onChange={(e) => setResponseType(e.target.value)}
                            >
                                {isFacilitatorMode ? (
                                    <>
                                        <option>Facilitator Intervention</option>
                                        <option>Official Ruling</option>
                                        <option>System Notice</option>
                                        <option>Clarification</option>
                                    </>
                                ) : (
                                    <>
                                        <option>Clarification</option>
                                        <option>Challenge</option>
                                        <option>Supporting Evidence</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#9aa0a6]">Directive Content</label>
                        <textarea
                            className={`w-full bg-[#161a20] border ${isFacilitatorMode ? 'border-[#f0b429]/20' : 'border-[#2a2f3a]'} rounded-sm p-4 text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]/50 min-h-[120px]`}
                            placeholder={isFacilitatorMode ? "Enter official ruling or intervention details..." : "Provide your contribution to the charter..."}
                            value={responseContent}
                            onChange={(e) => setResponseContent(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className={`${isFacilitatorMode ? 'bg-[#f0b429] hover:bg-[#f0b429]/90' : 'bg-[#4f8cff] hover:bg-[#4f8cff]/90'} text-black font-black uppercase tracking-[0.2em] text-[10px] h-12 w-full max-w-[240px] rounded-none shadow-lg shadow-black/20`}
                        disabled={!responseContent.trim()}
                    >
                        {isFacilitatorMode ? "Submit System Directive" : "Commit to Ledger"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
