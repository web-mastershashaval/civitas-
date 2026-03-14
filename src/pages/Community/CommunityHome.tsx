import { useParams, Navigate, Link, useLocation } from "react-router-dom";
import { useCommunity } from "../../hooks/useCommunity";
import { Loader2, AlertCircle, Shield } from "lucide-react";
import { Button } from "../../components/ui/Button";

export function CommunityHome() {
    const { id } = useParams();
    const { community, loading, error } = useCommunity(id);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Loading Community...</p>
            </div>
        );
    }

    if (error || !community) {
        return (
            <div className="p-12 border border-red-500/20 bg-red-500/5 text-red-500 max-w-2xl mx-auto mt-20 text-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-4 opacity-50" />
                <p className="text-xs font-black uppercase tracking-[0.3em] mb-2">Community Load Error</p>
                <p className="text-sm italic opacity-80 mb-8">{error || "The requested community could not be found."}</p>
                <Link to="/member/home">
                    <Button variant="ghost" className="border border-red-500/30 text-[10px] uppercase font-black px-8">
                        Return Home
                    </Button>
                </Link>
            </div>
        );
    }

    if (!community.boards || community.boards.length === 0) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-center opacity-60 grayscale">
                <Shield className="w-12 h-12 mb-6 text-[#9aa0a6] opacity-30" />
                <h2 className="text-xl font-bold mb-2">Community Not Ready</h2>
                <p className="text-sm italic">This community has no boards created yet.</p>
            </div>
        );
    }

    // Automatically redirect to the first board to match the "Threads" focused design
    const firstBoardId = community.boards[0].id;
    const location = useLocation();
    const isFacilitatorMode = location.pathname.includes('/facilitator');
    const basePath = isFacilitatorMode ? `/facilitator/community/${id}` : `/member/community/${id}`;

    return <Navigate to={`${basePath}/board/${firstBoardId}`} replace />;
}
