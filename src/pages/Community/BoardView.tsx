import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

// Mock data
const boardData = {
    1: {
        name: "Housing & Zoning",
        description: "Scope: Urban housing policy & land use",
        subBoards: [
            {
                id: 1,
                name: "Zoning Reform Proposals",
                description: "Policy ideas & structured proposals",
                topic: "Housing"
            },
            {
                id: 2,
                name: "Rent Control Research",
                description: "Empirical studies & evidence",
                topic: "Housing"
            },
            {
                id: 3,
                name: "Public Housing Models",
                description: "Case studies & implementation models",
                topic: "Housing"
            }
        ]
    },
    2: {
        name: "General Discussion",
        description: "Community announcements and general topics",
        subBoards: [
            {
                id: 4,
                name: "Announcements",
                description: "Official community updates",
                topic: "General"
            },
            {
                id: 5,
                name: "Introductions",
                description: "Welcome new members",
                topic: "General"
            }
        ]
    }
};

export function BoardView() {
    const { id, boardId } = useParams();
    const board = boardData[Number(boardId) as keyof typeof boardData];

    if (!board) {
        return (
            <div className="py-20 text-center text-[#9aa0a6]">
                <h1 className="text-xl font-bold">Board Not Found</h1>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{board.name}</h2>
                <Link to={`/member/community/${id}/board/${boardId}/sub/${board.subBoards[0].id}/create`}>
                    <Button className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white h-10 px-6 font-bold text-sm tracking-tight">
                        Start Thread
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                {board.subBoards.map((subBoard) => (
                    <Link
                        key={subBoard.id}
                        to={`/member/community/${id}/board/${boardId}/sub/${subBoard.id}`}
                        className="block group"
                    >
                        <article className="border border-[#2a2f3a] bg-[#161a20] p-6 hover:border-[#4f8cff]/40 transition-all cursor-pointer">
                            <h3 className="text-lg font-bold mb-1 group-hover:text-[#4f8cff] transition-colors">
                                {subBoard.name}
                            </h3>
                            <p className="text-sm text-[#9aa0a6]">
                                {subBoard.description} • Topic: {subBoard.topic}
                            </p>
                        </article>
                    </Link>
                ))}
            </div>

            <div className="pt-8 text-xs text-[#9aa0a6]">
                <p>💡 Click a board lane to view specific discussions or contribute to the community charter.</p>
            </div>
        </div>
    );
}
