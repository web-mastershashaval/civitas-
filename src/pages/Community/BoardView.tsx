import { useParams, Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useBoard } from "../../hooks/useBoard";
import { Loader2, AlertCircle, Layers, ChevronRight, Shield, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useCommunityContext } from "../../components/layout/CommunityLayout";

export function BoardView() {
    const { id, boardId } = useParams();
    const location = useLocation();
    const isFacilitatorMode = location.pathname.includes('/facilitator');
    const { board, loading, error } = useBoard(boardId);
    const context = useCommunityContext();
    const setBreadcrumbs = context?.setBreadcrumbs;


    useEffect(() => {
        if (board && setBreadcrumbs) {
            setBreadcrumbs([
                { label: board.name, href: isFacilitatorMode ? `/facilitator/community/${id}/board/${boardId}` : `/member/community/${id}/board/${boardId}` }
            ]);
        }
    }, [board, id, boardId, isFacilitatorMode, setBreadcrumbs]);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Loading Board Details...</p>
            </div>
        );
    }

    if (error || !board) {
        return (
            <div className="p-12 border border-red-500/20 bg-red-500/5 text-red-500 max-w-2xl mx-auto mt-20 text-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Board Error</p>
                <p className="text-sm italic opacity-80 mb-8">{error || "This board is not available."}</p>
                <Link to={isFacilitatorMode ? `/facilitator/community/${id}/manage` : `/member/community/${id}`}>
                    <Button variant="ghost" className="border border-red-500/30 text-[10px] uppercase font-black px-8">
                        {isFacilitatorMode ? "Return to Management" : "Return Home"}
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            {isFacilitatorMode && (
                <div className="bg-[#f0b429]/10 border border-[#f0b429]/20 p-4 flex items-center gap-3 text-[#f0b429]">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">Managing Board</span>
                </div>
            )}

            {/* Header */}
            {/* Header */}
            <div className={`relative overflow-hidden border shadow-xl group ${isFacilitatorMode ? 'bg-[#1a1e26] border-[#f0b429]/20' : 'bg-[#161a20] border-[#2a2f3a]'}`}>
                {/* Background Banner */}
                <div className="absolute inset-0 z-0">
                    {board.community_banner ? (
                        <>
                            <img src={board.community_banner} alt="Community Banner" className="w-full h-full object-cover opacity-20" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#161a20] to-transparent" />
                        </>
                    ) : (
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Layers className="w-64 h-64 text-[#9aa0a6]" />
                        </div>
                    )}
                </div>

                <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
                    {(board.image || board.community_image) && (
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0f1115] border-2 border-[#2a2f3a] rounded-full overflow-hidden shrink-0 shadow-lg">
                            <img src={board.image || board.community_image} alt={board.name} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-3 mb-2">
                            <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-[#9aa0a6] bg-black/40 px-2 py-1 rounded-full">
                                {board.community_name}
                            </span>
                            <span className={`text-[9px] md:text-[10px] uppercase font-black tracking-[0.4em] ${isFacilitatorMode ? 'text-[#f0b429]' : 'text-[#4f8cff]'}`}>
                                {isFacilitatorMode ? 'Active Board' : 'Standard Board'}
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black tracking-tight text-[#e6e6e6] mb-3">{board.name}</h2>
                        <p className="text-[#9aa0a6] text-xs md:text-sm italic max-w-2xl leading-relaxed">
                            Discussions and updates for {board.name.toLowerCase()}.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] px-2">Sub-boards</h3>

                {(!board.subBoards || board.subBoards.length === 0) && (
                    <div className="p-20 border border-dashed border-[#2a2f3a] text-center bg-[#161a20]/20">
                        <p className="text-[10px] text-[#9aa0a6] uppercase font-black tracking-widest italic">No sub-boards in this board.</p>
                    </div>
                )}

                {board.subBoards?.map((subBoard: any) => (
                    <Link
                        key={subBoard.id}
                        to={isFacilitatorMode
                            ? `/facilitator/community/${id}/board/${boardId}/sub/${subBoard.id}`
                            : `/member/community/${id}/board/${boardId}/sub/${subBoard.id}`
                        }
                        className="block group"
                    >
                        <article className={`flex items-center justify-between p-5 md:p-8 border transition-all shadow-lg hover:shadow-[#4f8cff]/5 ${isFacilitatorMode ? 'bg-[#1a1e26] border-[#f0b429]/10 hover:border-[#f0b429]/40' : 'bg-[#161a20] border-[#2a2f3a] hover:border-[#4f8cff]/50'}`}>
                            <div className="space-y-1 md:space-y-2 flex-1 min-w-0 pr-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <h4 className={`text-lg md:text-xl font-bold transition-colors tracking-tight truncate ${isFacilitatorMode ? 'text-[#e6e6e6] group-hover:text-[#f0b429]' : 'text-[#e6e6e6] group-hover:text-[#4f8cff]'}`}>{subBoard.name}</h4>
                                    <span className={`text-[8px] md:text-[9px] uppercase font-black px-2 py-0.5 border tracking-widest w-fit ${isFacilitatorMode ? 'bg-[#f0b429]/5 text-[#f0b429] border-[#f0b429]/10' : 'bg-[#4f8cff]/5 text-[#4f8cff] border-[#4f8cff]/10'}`}>
                                        {subBoard.topic || "ACTIVE"}
                                    </span>
                                </div>
                                <p className="text-xs md:text-sm text-[#9aa0a6] max-w-xl line-clamp-1 italic">{subBoard.description}</p>
                            </div>
                            <Button variant="ghost" className={`h-10 w-10 md:h-12 md:w-12 p-0 border bg-[#0f1115] shrink-0 ${isFacilitatorMode ? 'border-[#f0b429]/10 group-hover:border-[#f0b429]/40' : 'border-[#2a2f3a] group-hover:border-[#4f8cff]/40'}`}>
                                <ChevronRight className={`w-5 h-5 md:w-6 md:h-6 text-[#9aa0a6] ${isFacilitatorMode ? 'group-hover:text-[#f0b429]' : 'group-hover:text-[#4f8cff]'}`} />
                            </Button>
                        </article>
                    </Link>
                ))}
            </div>

            <div className="pt-8 text-[10px] uppercase font-black tracking-widest text-[#9aa0a6] opacity-50 flex items-center gap-2">
                {isFacilitatorMode ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                Moderator mode active. All board interactions are logged.
            </div>
        </div>
    );
}
