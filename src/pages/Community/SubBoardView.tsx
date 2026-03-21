import { useParams, Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useState, useEffect } from "react";
import { useSubBoard } from "../../hooks/useSubBoard";
import { Loader2, AlertCircle, Scale, ShieldCheck, Heart, HeartOff } from "lucide-react";
import { useCommunityContext } from "../../components/layout/CommunityLayout";
import { followService } from "../../services/api";

export function SubBoardView() {
    const { id, boardId, subBoardId } = useParams();
    const location = useLocation();
    const isFacilitatorMode = location.pathname.includes('/facilitator');
    const { subBoard, discussions, loading, error } = useSubBoard(subBoardId);
    const context = useCommunityContext();
    const setBreadcrumbs = context?.setBreadcrumbs;

    const [rulesOpen, setRulesOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followingLoading, setFollowingLoading] = useState(false);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!subBoardId) return;
            try {
                const res = await followService.getFollowStatus('SUB_BOARD', subBoardId);
                setIsFollowing(res.data.following);
            } catch (err) {
                console.error("Failed to fetch follow status", err);
            }
        };
        checkFollowStatus();
    }, [subBoardId]);

    const handleFollowToggle = async () => {
        if (!subBoardId) return;
        setFollowingLoading(true);
        try {
            const res = await followService.toggleFollow('SUB_BOARD', subBoardId);
            setIsFollowing(res.data.following);
        } catch (err) {
            console.error("Failed to toggle follow", err);
        } finally {
            setFollowingLoading(false);
        }
    };

    useEffect(() => {
        if (subBoard && setBreadcrumbs) {
            setBreadcrumbs([
                {
                    label: subBoard.boardName || "Board",
                    href: isFacilitatorMode ? `/facilitator/community/${id}/board/${subBoard.board}` : `/member/community/${id}/board/${subBoard.board}`
                },
                {
                    label: subBoard.name,
                    href: location.pathname
                }
            ]);
        }
    }, [subBoard, id, location.pathname, isFacilitatorMode, setBreadcrumbs]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Loading Sub-board...</p>
            </div>
        );
    }

    if (error || !subBoard) {
        return (
            <div className="p-12 border border-red-500/20 bg-red-500/5 text-red-500 max-w-2xl mx-auto mt-20 text-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Sub-board Error</p>
                <p className="text-sm italic opacity-80 mb-8">{error || "This sub-board is not available."}</p>
                <Link to={isFacilitatorMode ? `/facilitator/community/${id}/manage` : `/member/community/${id}`}>
                    <Button variant="ghost" className="border border-red-500/30 text-[10px] uppercase font-black px-8">
                        {isFacilitatorMode ? "Return to Management" : "Return Home"}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            {isFacilitatorMode && (
                <div className="bg-[#f0b429]/10 border border-[#f0b429]/20 p-4 flex items-center gap-3 text-[#f0b429]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Managing Sub-Board</span>
                </div>
            )}

            {/* Header */}
            <div className={`relative overflow-hidden border shadow-xl group ${isFacilitatorMode ? 'bg-[#1a1e26] border-[#f0b429]/20' : 'bg-[#161a20] border-[#2a2f3a]'}`}>
                {/* Background Banner */}
                <div className="absolute inset-0 z-0">
                    {subBoard.community_banner ? (
                        <>
                            <img src={subBoard.community_banner} alt="Community Banner" className="w-full h-full object-cover opacity-20" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#161a20] to-transparent" />
                        </>
                    ) : (
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Scale className="w-64 h-64 text-[#9aa0a6]" />
                        </div>
                    )}
                </div>

                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
                    {(subBoard.image || subBoard.community_image) && (
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0f1115] border-2 border-[#2a2f3a] rounded-full overflow-hidden shrink-0 shadow-lg">
                            <img src={subBoard.image || subBoard.community_image} alt={subBoard.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
                            <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-[#9aa0a6] bg-black/40 px-2 py-1 rounded-full">
                                {subBoard.community_name}
                            </span>
                            <span className={`text-[9px] md:text-[10px] uppercase font-black tracking-widest ${isFacilitatorMode ? 'text-[#f0b429]' : 'text-[#4f8cff]'}`}>
                                {subBoard.topic || "Governance"}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#e6e6e6] mb-3">{subBoard.name}</h2>
                        <p className="text-[#9aa0a6] text-xs md:text-sm italic max-w-2xl leading-relaxed">
                            {subBoard.description}
                        </p>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 md:gap-3 w-full md:w-auto">
                        <Button
                            variant="outline"
                            onClick={handleFollowToggle}
                            disabled={followingLoading}
                            className={`flex-1 md:flex-none h-10 md:h-12 px-4 md:px-6 font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-none ${isFollowing ? 'border-[#ff5c5c]/30 text-[#ff5c5c] hover:bg-[#ff5c5c]/10' : (isFacilitatorMode ? 'border-[#f0b429]/30 text-[#f0b429] hover:bg-[#f0b429]/10' : 'border-[#4f8cff]/30 text-[#4f8cff] hover:bg-[#4f8cff]/10')}`}
                        >
                            {followingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    {isFollowing ? <HeartOff className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" /> : <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />}
                                    <span className="hidden sm:inline">{isFollowing ? "Unfollow" : "Follow"}</span>
                                    <span className="sm:hidden">{isFollowing ? "Unfollow" : "Follow"}</span>
                                </>
                            )}
                        </Button>
                        <Link to={isFacilitatorMode
                            ? `/facilitator/community/${id}/board/${subBoard.board}/sub/${subBoardId}/create-thread`
                            : `/member/community/${id}/board/${boardId}/sub/${subBoardId}/create`}
                            className="flex-1 md:flex-none"
                        >
                            <Button className={`w-full h-10 md:h-12 px-4 md:px-8 font-black text-[9px] md:text-[10px] uppercase tracking-widest rounded-none shadow-xl ${isFacilitatorMode ? 'bg-[#f0b429] hover:bg-[#f0b429]/90 text-black shadow-[#f0b429]/10' : 'bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white shadow-[#4f8cff]/10'}`}>
                                {isFacilitatorMode ? "Announce" : "Start"}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Collapsible Rules */}
            <details
                className="my-5 p-6 bg-[#161a20] rounded-none border border-[#2a2f3a] shadow-inner"
                open={rulesOpen}
                onToggle={(e) => setRulesOpen((e.target as HTMLDetailsElement).open)}
            >
                <summary className="cursor-pointer font-black text-[10px] uppercase tracking-[0.3em] text-[#9aa0a6] hover:text-[#e6e6e6] transition-colors">
                    Sub-board Rules
                </summary>
                <ul className="mt-6 ml-4 space-y-4 text-xs font-medium text-[#9aa0a6] list-none">
                    <li className="flex items-center gap-3"><div className={`w-1 h-1 ${isFacilitatorMode ? 'bg-[#f0b429]' : 'bg-[#4f8cff]'}`} /> Proposals must include implementation considerations</li>
                    <li className="flex items-center gap-3"><div className={`w-1 h-1 ${isFacilitatorMode ? 'bg-[#f0b429]' : 'bg-[#4f8cff]'}`} /> Evidence-based arguments required</li>
                    <li className="flex items-center gap-3"><div className={`w-1 h-1 ${isFacilitatorMode ? 'bg-[#f0b429]' : 'bg-[#4f8cff]'}`} /> One proposal per discussion</li>
                </ul>
            </details>

            {/* Discussions */}
            <section className="space-y-4 mt-12">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] mb-6">Recent Posts</h3>
                {discussions.length === 0 && (
                    <div className="p-20 border border-dashed border-[#2a2f3a] bg-[#161a20]/20 flex flex-col items-center gap-4 text-center">
                        <p className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest italic opacity-50">No posts found in this sub-board.</p>
                    </div>
                )}
                {discussions.map((discussion) => (
                    <Link key={discussion.id} to={isFacilitatorMode ? `/facilitator/community/${id}/discussion/${discussion.id}` : `/member/community/${id}/discussion/${discussion.id}`}>
                        <article className={`border p-5 md:p-6 transition-all cursor-pointer group shadow-lg ${isFacilitatorMode ? 'bg-[#1a1e26] border-[#f0b429]/10 hover:border-[#f0b429]/40' : 'bg-[#161a20] border-[#2a2f3a] hover:border-[#4f8cff]/40'}`}>
                            <h3 className={`text-lg md:text-xl font-bold mb-3 md:mb-2 transition-colors tracking-tight line-clamp-2 ${isFacilitatorMode ? 'group-hover:text-[#f0b429]' : 'group-hover:text-[#4f8cff]'}`}>{discussion.title}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <span className={`w-fit text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${isFacilitatorMode ? 'bg-[#f0b429]/5 text-[#f0b429] border-[#f0b429]/20' : 'bg-[#4f8cff]/5 text-[#4f8cff] border-[#4f8cff]/20'}`}>
                                    {discussion.type}
                                </span>
                                <div className="flex items-center gap-2 text-[8px] md:text-[9px] text-[#9aa0a6] uppercase tracking-widest font-bold">
                                    {discussion.author_avatar ? (
                                        <img src={discussion.author_avatar} alt={discussion.author_username || discussion.author} className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-[#2a2f3a]" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#2a2f3a] flex items-center justify-center">
                                            <span className="text-[6px] font-black">{discussion.author[0].toUpperCase()}</span>
                                        </div>
                                    )}
                                    <span className="truncate">{discussion.author_username || discussion.author} • {discussion.timestamp || "Active"}</span>
                                </div>
                            </div>
                        </article>
                    </Link>
                ))}
            </section>
        </div>
    );
}
