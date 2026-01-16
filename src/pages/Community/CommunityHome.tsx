import { useParams, Navigate } from "react-router-dom";

// Mock data - same as in Layout for now
const communityData = {
    1: { name: "Civic Tech Alliance", firstBoardId: 1 },
    2: { name: "Urban Planning Study", firstBoardId: 3 }
};

export function CommunityHome() {
    const { id } = useParams();
    const community = communityData[Number(id) as keyof typeof communityData];

    if (!community) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-[#9aa0a6]">
                <h1 className="text-2xl font-bold mb-2">Community Not Found</h1>
                <p>The community identifier provided is invalid.</p>
            </div>
        );
    }

    // Automatically redirect to the first board to match the "Threads" focused design
    return <Navigate to={`/member/community/${id}/board/${community.firstBoardId}`} replace />;
}
