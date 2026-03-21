import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { ShieldCheck, AlertCircle, Loader2, ArrowBigUp, ArrowBigDown, Plus, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import ReportButton from "../../components/features/ReportButton";
import { useDiscussion } from "../../hooks/useDiscussion";
import { useCommunityContext } from "../../components/layout/CommunityLayout";
import { voteService } from "../../services/api";
import { useNudge } from "../../components/features/NudgeProvider";

export function DiscussionDetail() {
    const { id, discussionId } = useParams();
    const location = useLocation();
    const isFacilitatorMode = location.pathname.includes('/facilitator');
    const { discussion, loading, error, submitResponse, refresh } = useDiscussion(discussionId);
    const context = useCommunityContext();
    const { addNudge } = useNudge();
    const setBreadcrumbs = context?.setBreadcrumbs;


    useEffect(() => {
        if (discussion && setBreadcrumbs) {
            setBreadcrumbs([
                {
                    label: discussion.boardName || "Board",
                    href: isFacilitatorMode ? `/facilitator/community/${id}/board/${discussion.board}` : `/member/community/${id}/board/${discussion.board}`
                },
                {
                    label: discussion.subBoardName || "Sub-board",
                    href: isFacilitatorMode ? `/facilitator/community/${id}/board/${discussion.board}/sub/${discussion.sub_board}` : `/member/community/${id}/board/${discussion.board}/sub/${discussion.sub_board}`
                },
                {
                    label: discussion.title,
                    href: location.pathname
                }
            ]);
        }
    }, [discussion, id, location.pathname, isFacilitatorMode, setBreadcrumbs]);

    const [responseType, setResponseType] = useState(isFacilitatorMode ? "Facilitator Intervention" : "Clarification");
    const [responseContent, setResponseContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<{username: string} | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleInteraction = (type: string) => {
        setResponseType(type);
        document.getElementById('commit-form')?.scrollIntoView({ behavior: 'smooth' });
        // Focus textarea after a short delay to allow scroll
        setTimeout(() => {
            const textarea = document.querySelector('textarea');
            if (textarea) textarea.focus();
        }, 500);
    };

    const handleVote = async (contentType: 'DISCUSSION' | 'RESPONSE', objectId: string, voteType: 'UP' | 'DOWN') => {
        try {
            await voteService.castVote(contentType, objectId, voteType);
            refresh(); // Refresh to get updated counts
        } catch (err: any) {
            addNudge("Voting failed. Your reputation might be too low or session expired.", "error");
        }
    };

    const handleSubmitResponse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!responseContent.trim() && !imageFile) return;

        setIsSubmitting(true);
        const finalContent = replyTo ? `@${replyTo.username} ${responseContent}` : responseContent;
        const result = await submitResponse(responseType, finalContent, imageFile || undefined);
        if (result.success) {
            setResponseContent("");
            setReplyTo(null);
            setImageFile(null);
            setImagePreview(null);
        } else {
            addNudge(result.error || "Action Blocked by Governance Engine.", "error");
        }
        setIsSubmitting(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                addNudge("File too large. Max 5MB allowed.", "error");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const renderContentWithMentions = (content: string) => {
        if (!content) return null;
        const parts = content.split(/(@[a-zA-Z0-9_]+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                const username = part.substring(1);
                return (
                    <Link
                        key={i}
                        to={`/member/profile/${username}`}
                        className="text-[#4f8cff] font-bold hover:underline transition-colors px-1 bg-[#4f8cff]/10 rounded"
                    >
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Loading Thread...</p>
            </div>
        );
    }

    if (error || !discussion) {
        return (
            <div className="p-12 border border-red-500/20 bg-red-500/5 text-red-500 max-w-2xl mx-auto mt-20 text-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Thread Error</p>
                <p className="text-sm italic opacity-80 mb-8">{error || "The requested thread does not exist."}</p>
                <Link to={isFacilitatorMode ? `/facilitator/community/${id}/manage` : `/member/community/${id}`}>
                    <Button variant="ghost" className="border border-red-500/30 text-[10px] uppercase font-black px-8">
                        Return Home
                    </Button>
                </Link>
            </div>
        );
    }

    const isAnnouncement = discussion.boardName === 'Announcements';

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {isFacilitatorMode && (
                <div className="bg-[#f0b429]/10 border border-[#f0b429]/20 p-4 flex items-center gap-3 text-[#f0b429]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Administrative Override Mode: Facilitator Authority Enabled</span>
                </div>
            )}

            {/* Thread Header */}
            <div className="border border-[#2a2f3a] bg-[#161a20] p-6 md:p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black px-2 py-0.5 bg-[#4f8cff]/10 text-[#4f8cff] border border-[#4f8cff]/20">
                        {discussion.type}
                    </span>
                    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6] hidden sm:inline">
                        Ref: T-{id}-{discussionId}
                    </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight leading-tight">{discussion.title}</h1>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-[#9aa0a6] mb-8 pb-8 border-b border-[#2a2f3a]">
                    <div className="flex items-center gap-3 md:gap-4">
                        {discussion.author_avatar ? (
                            <img src={discussion.author_avatar} alt={discussion.author_username || discussion.author} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#4f8cff]/30 shadow-lg shadow-[#4f8cff]/5" />
                        ) : (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#4f8cff]/10 flex items-center justify-center border-2 border-[#4f8cff]/30 shadow-lg shadow-[#4f8cff]/5">
                                <span className="text-xs md:text-sm font-black text-[#4f8cff]">{discussion.author[0].toUpperCase()}</span>
                            </div>
                        )}
                        <div>
                            <Link to={`/member/profile/${discussion.author}`} className="font-bold text-[#e6e6e6] hover:text-[#4f8cff] transition-colors underline-offset-4 hover:underline text-sm md:text-base">
                                {discussion.author_username || discussion.author}
                            </Link>
                            <div className="flex items-center gap-2 text-[9px] md:text-[10px] mt-0.5">
                                <span>{discussion.timestamp}</span>
                                <span className="text-[#2a2f3a]">•</span>
                                <span className="uppercase tracking-widest truncate max-w-[100px]">{discussion.boardName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <div className="text-[#e6e6e6] leading-relaxed text-base md:text-lg italic">
                        "{renderContentWithMentions(discussion.body)}"
                    </div>
                </div>

                {discussion.image && (
                    <div className="mt-6 md:mt-8 relative max-w-2xl overflow-hidden rounded-lg border border-[#2a2f3a] bg-black/20">
                        <img
                            src={discussion.image}
                            alt="Discussion visual attachment"
                            className="w-full h-auto max-h-[400px] md:max-h-[500px] object-contain"
                        />
                    </div>
                )}

                {discussion.sources && discussion.sources.length > 0 && (
                    <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#2a2f3a]">
                        <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6] mb-3">Verification Sources</h4>
                        <div className="space-y-2">
                            {discussion.sources.map((source: string, i: number) => (
                                <a key={i} href={source} className="text-xs md:text-sm text-[#4f8cff] hover:underline block font-medium truncate">
                                    {source}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Discussion Votes */}
                <div className="mt-8 flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-black/20 rounded-md border border-[#2a2f3a] p-1">
                        <button 
                            onClick={() => handleVote('DISCUSSION', discussionId!, 'UP')}
                            className="p-1 hover:text-[#4f8cff] transition-colors"
                            title="Upvote"
                        >
                            <ArrowBigUp className="w-6 h-6" />
                        </button>
                        <span className="text-sm font-bold min-w-[2ch] text-center">{discussion.upvotes - discussion.downvotes}</span>
                        <button 
                            onClick={() => handleVote('DISCUSSION', discussionId!, 'DOWN')}
                            className="p-1 hover:text-[#ff5c5c] transition-colors"
                            title="Downvote"
                        >
                            <ArrowBigDown className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-[#9aa0a6] font-bold">
                        Community Sentiment
                    </div>
                </div>
            </div>

            {/* Interaction Controls */}
            <div className="flex gap-2 items-center flex-wrap">
                {discussion && !isAnnouncement && [
                    { label: "Endorse", type: "Endorsement" },
                    { label: "Challenge", type: "Challenge" },
                    { label: "Clarify", type: "Clarification" }
                ].map((action) => (
                    <Button
                        key={action.label}
                        variant="ghost"
                        onClick={() => handleInteraction(action.type)}
                        className={`text-[10px] uppercase tracking-widest font-bold border h-9 px-4 transition-all ${responseType === action.type ? 'border-[#4f8cff] text-[#4f8cff] bg-[#4f8cff]/5' : 'text-[#9aa0a6] border-[#2a2f3a] hover:border-[#4f8cff]/40 hover:text-[#e6e6e6]'}`}
                    >
                        {action.label}
                    </Button>
                ))}
                <Button
                    variant="ghost"
                    onClick={() => {
                        // Import useNudge hook if not already present or use context
                        alert("You are now following this sub-board. You will be notified of any new posts or updates.");
                    }}
                    className="text-[10px] uppercase tracking-widest font-bold text-[#4f8cff] border border-[#4f8cff]/30 h-9 px-4 hover:bg-[#4f8cff]/10"
                >
                    Follow Sub-board
                </Button>

                {discussionId && (
                    <div className="ml-auto">
                        <ReportButton
                            contentType="DISCUSSION"
                            objectId={discussionId}
                        />
                    </div>
                )}
            </div>

            {/* Response Section */}
            <div className="space-y-4">
                <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-[#9aa0a6] pt-4">Community Replies</h3>

                {discussion.responses.map((response: any) => (
                    <article
                        key={response.id}
                        className={`border ${response.isOfficial ? 'border-[#f0b429]/40 bg-[#f0b429]/5' : 'border-[#2a2f3a] bg-[#161a20]/50'} p-4 md:p-6 flex gap-4 md:gap-6 group relative rounded-lg`}
                    >
                        <div className={`shrink-0 w-1 ${response.isOfficial ? 'bg-[#f0b429]' : 'bg-[#4f8cff]/20'}`} />
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] md:text-[10px] uppercase tracking-widest font-bold ${response.isOfficial ? 'text-[#f0b429]' : 'text-[#4f8cff]'}`}>
                                        {response.type}
                                    </span>
                                    {response.isOfficial && <AlertCircle className="w-3 h-3 text-[#f0b429]" />}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        {response.author_avatar ? (
                                            <img src={response.author_avatar} alt={response.author_username || response.author} className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-[#2a2f3a] shadow-sm" />
                                        ) : (
                                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#2a2f3a] flex items-center justify-center border border-[#2a2f3a] shadow-sm">
                                                <span className="text-[10px] font-black">{(response.author_username || response.author)[0].toUpperCase()}</span>
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <Link to={`/member/profile/${response.author}`} className="text-[#e6e6e6] font-bold hover:text-[#4f8cff] hover:underline transition-colors text-[10px] md:text-[11px] truncate max-w-[100px] md:max-w-none">
                                                {response.author_username || response.author}
                                            </Link>
                                            <span className="text-[8px] opacity-60">{response.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div className={`${response.isOfficial ? 'text-[#f0b429]/90' : 'text-[#e6e6e6]'} text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words`}>
                                {renderContentWithMentions(response.content)}
                            </div>

                            {response.image && (
                                <div className="mt-4 relative max-w-[300px] overflow-hidden rounded-md border border-[#2a2f3a] bg-black/20 group-hover:border-[#4f8cff]/30 transition-colors">
                                    <img src={response.image} alt="Response attachment" className="w-full h-auto object-contain cursor-zoom-in" onClick={() => window.open(response.image, '_blank')} />
                                </div>
                            )}

                            {/* Response Votes */}
                            <div className="mt-4 flex items-center gap-2">
                                <button 
                                    onClick={() => handleVote('RESPONSE', response.id, 'UP')}
                                    className="flex items-center gap-1 text-[10px] font-bold text-[#9aa0a6] hover:text-[#4f8cff] transition-colors"
                                >
                                    <ArrowBigUp className="w-4 h-4" />
                                    {response.upvotes}
                                </button>
                                <button 
                                    onClick={() => handleVote('RESPONSE', response.id, 'DOWN')}
                                    className="flex items-center gap-1 text-[10px] font-bold text-[#9aa0a6] hover:text-[#ff5c5c] transition-colors"
                                >
                                    <ArrowBigDown className="w-4 h-4" />
                                    {response.downvotes}
                                </button>
                            </div>

                            {discussion && !isAnnouncement && (
                                <div className="mt-4 flex flex-wrap gap-3 md:gap-4 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button className={`text-[8px] md:text-[9px] uppercase tracking-widest font-black ${response.isOfficial ? 'text-[#f0b429]' : 'text-[#4f8cff]'} hover:text-[#e6e6e6] transition-colors`} onClick={() => {
                                        setReplyTo({ username: response.author_username || response.author });
                                        handleInteraction("Clarification");
                                    }}>
                                        Reply
                                    </button>
                                    <button
                                        className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-[#9aa0a6] hover:text-[#e6e6e6] transition-colors"
                                        onClick={() => {
                                            setReplyTo({ username: response.author_username || response.author });
                                            setResponseContent("[Challenging assertion]: ");
                                            handleInteraction("Challenge");
                                        }}
                                    >
                                        Challenge
                                    </button>
                                    <button
                                        className="text-[8px] md:text-[9px] uppercase tracking-widest font-black text-[#9aa0a6] hover:text-[#e6e6e6] transition-colors"
                                        onClick={() => {
                                            setReplyTo({ username: response.author_username || response.author });
                                            setResponseContent("[Endorsing contribution]: ");
                                            handleInteraction("Endorsement");
                                        }}
                                    >
                                        Agree
                                    </button>
                                    <div className="ml-auto">
                                        <ReportButton
                                            contentType="RESPONSE"
                                            objectId={response.id}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                ))}
            </div>

            {/* Add Response Form */}
            {discussion && !isAnnouncement && (
                <div id="commit-form" className={`border ${isFacilitatorMode ? 'border-[#f0b429]/30' : 'border-[#2a2f3a]'} bg-[#0f1115] p-6 md:p-8 mt-12 bg-gradient-to-b from-[#161a20] to-[#0f1115]`}>
                <h3 className="text-xs md:text-sm uppercase tracking-[0.2em] font-black text-[#e6e6e6] mb-6">
                    {isFacilitatorMode ? "Exercise System Authority" : "Commit Response"}
                </h3>

                <form onSubmit={handleSubmitResponse} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-[#9aa0a6]">Contribution Level</label>
                            <select
                                className={`w-full bg-[#161a20] border ${isFacilitatorMode ? 'border-[#f0b429]/20' : 'border-[#2a2f3a]'} rounded-sm p-3 text-xs md:text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]/50`}
                                value={responseType}
                                onChange={(e) => setResponseType(e.target.value)}
                            >
                                {isFacilitatorMode ? (
                                    <>
                                        <option value="Facilitator Intervention">Facilitator Intervention</option>
                                        <option value="Official Ruling">Official Ruling</option>
                                        <option value="System Notice">System Notice</option>
                                        <option value="Clarification">Clarification</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Clarification">Clarification</option>
                                        <option value="Challenge">Challenge</option>
                                        <option value="Endorsement">Endorsement</option>
                                        <option value="Supporting Evidence">Supporting Evidence</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 relative">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-[#9aa0a6]">Directive Content</label>
                            {replyTo && (
                                <div className="flex items-center gap-2 bg-[#4f8cff]/10 border border-[#4f8cff]/20 px-2 py-1 rounded-sm">
                                    <span className="text-[8px] md:text-[9px] uppercase font-black text-[#4f8cff]">Replying to @{replyTo.username}</span>
                                    <button 
                                        type="button"
                                        onClick={() => setReplyTo(null)}
                                        className="text-[#4f8cff] hover:text-white transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <textarea
                                className={`w-full bg-[#161a20] border ${isFacilitatorMode ? 'border-[#f0b429]/20' : 'border-[#2a2f3a]'} rounded-sm p-4 pr-12 text-xs md:text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]/50 min-h-[120px]`}
                                placeholder={isFacilitatorMode ? "Enter official ruling or intervention details..." : "Provide your contribution to the charter..."}
                                value={responseContent}
                                onChange={(e) => setResponseContent(e.target.value)}
                                required={!imageFile}
                            />
                            <div className="absolute right-3 bottom-3">
                                <label className="cursor-pointer p-2 rounded-full bg-[#2a2f3a] hover:bg-[#4f8cff]/20 text-[#9aa0a6] hover:text-[#4f8cff] transition-all flex items-center justify-center border border-[#2a2f3a] hover:border-[#4f8cff]/30">
                                    <Plus className="w-4 h-4" />
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                        </div>

                        {imagePreview && (
                            <div className="relative mt-2 w-24 h-24 border border-[#4f8cff]/30 rounded-sm overflow-hidden group">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className={`${isFacilitatorMode ? 'bg-[#f0b429] hover:bg-[#f0b429]/90' : 'bg-[#4f8cff] hover:bg-[#4f8cff]/90'} text-black font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] h-10 md:h-12 w-full max-w-none md:max-w-[240px] rounded-none shadow-lg shadow-black/20`}
                        disabled={isSubmitting || (!responseContent.trim() && !imageFile)}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            isFacilitatorMode ? "Submit System Directive" : "Commit to Ledger"
                        )}
                    </Button>
                </form>
            </div>
            )}
        </div>
    );
}
