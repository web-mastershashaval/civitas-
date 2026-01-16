import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useState } from "react";

// Mock data
const subBoardData = {
    1: {
        name: "Zoning Reform Proposals",
        boardName: "Housing & Zoning",
        description: "Policy ideas & structured proposals for zoning law reform and urban development.",
        discussions: [
            {
                id: 1,
                title: "Impact of zoning laws on housing density",
                author: "John",
                type: "Proposal",
                boardName: "General Policy"
            },
            {
                id: 2,
                title: "Public transport funding models",
                author: "Alice",
                type: "Proposal",
                boardName: "General Policy"
            }
        ]
    }
};

export function SubBoardView() {
    const { id, subBoardId } = useParams();
    const subBoard = subBoardData[Number(subBoardId) as keyof typeof subBoardData] || subBoardData[1];
    const [rulesOpen, setRulesOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold">{subBoard.name}</h2>
                    <p className="text-sm text-[#9aa0a6] mt-1">{subBoard.description}</p>
                </div>
                <Link to="create">
                    <Button className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white h-10 px-6 font-bold text-sm tracking-tight">
                        Start Thread
                    </Button>
                </Link>
            </div>

            {/* Collapsible Rules */}
            <details
                className="my-5 p-4 bg-[#161a20] rounded-sm border border-[#2a2f3a]"
                open={rulesOpen}
                onToggle={(e) => setRulesOpen((e.target as HTMLDetailsElement).open)}
            >
                <summary className="cursor-pointer font-bold text-xs uppercase tracking-widest text-[#9aa0a6]">
                    Governing Rules
                </summary>
                <ul className="mt-4 ml-4 space-y-2 text-sm text-[#9aa0a6] list-disc">
                    <li>Proposals must include implementation considerations</li>
                    <li>Evidence-based arguments required</li>
                    <li>One proposal per discussion</li>
                </ul>
            </details>

            {/* Discussions */}
            <section className="space-y-4">
                {subBoard.discussions.map((discussion) => (
                    <Link key={discussion.id} to={`/member/community/${id}/discussion/${discussion.id}`}>
                        <article className="border border-[#2a2f3a] bg-[#161a20] p-5 hover:border-[#4f8cff]/40 transition-all cursor-pointer">
                            <h3 className="text-lg font-bold mb-1">{discussion.title}</h3>
                            <p className="text-xs text-[#9aa0a6] uppercase tracking-wider font-medium">
                                Started by {discussion.author} • Board: {discussion.boardName}
                            </p>
                        </article>
                    </Link>
                ))}
            </section>
        </div>
    );
}
