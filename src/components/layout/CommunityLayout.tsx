import { useParams, Link, useLocation, Outlet } from "react-router-dom";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

// Mock data for navigation - in a real app this would be fetched based on :id
const communityNavData = {
    1: {
        name: "Civic Tech Alliance",
        boards: [
            { id: 1, name: "Housing & Zoning", href: "/member/community/1/board/1" },
            { id: 2, name: "General Discussion", href: "/member/community/1/board/2" },
            { id: 3, name: "Infrastructure", href: "#" },
            { id: 4, name: "Transportation", href: "#" }
        ]
    },
    2: {
        name: "Urban Planning Study",
        boards: [
            { id: 3, name: "Research", href: "/member/community/2/board/1" },
            { id: 4, name: "Case Studies", href: "/member/community/2/board/2" }
        ]
    }
};

export function CommunityLayout() {
    const { id } = useParams();
    const location = useLocation();
    const community = communityNavData[Number(id) as keyof typeof communityNavData];

    if (!community) return <Outlet />;

    return (
        <div className="min-h-screen bg-[#0f1115] text-[#e6e6e6] font-sans flex flex-col">
            {/* TOPBAR */}
            <header className="h-16 border-b border-[#2a2f3a] bg-[#0f1115] flex items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-xl font-black tracking-tighter hover:text-[#4f8cff] transition-colors">
                        CIVITAS
                    </Link>
                    <div className="h-4 w-px bg-[#2a2f3a]" />
                    <span className="text-sm font-medium text-[#9aa0a6]">{community.name}</span>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="text-xs uppercase tracking-widest font-bold text-[#9aa0a6] hover:text-[#e6e6e6] border border-[#2a2f3a] h-8 px-3">
                        Rules
                    </Button>
                    <Link to="/member/home">
                        <Button variant="ghost" className="text-xs uppercase tracking-widest font-bold text-[#ff5c5c] hover:bg-[#ff5c5c]/10 border border-[#ff5c5c]/20 h-8 px-3">
                            Leave
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 max-w-[1200px] w-full mx-auto p-8 flex flex-col">
                {/* COMMUNITY NOTICE */}
                <section className="bg-[#4f8cff]/5 border border-[#2a2f3a] p-4 mb-8 rounded-sm">
                    <p className="text-sm text-[#9aa0a6] leading-relaxed">
                        This community is governed by a charter.
                        Actions are recorded on the public ledger.
                        Violations are enforced and logged.
                    </p>
                </section>

                <div className="flex gap-12 flex-1">
                    {/* SIDEBAR: BOARDS */}
                    <aside className="w-64 shrink-0 space-y-6">
                        <div>
                            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-[#9aa0a6] mb-4">Boards</h2>
                            <nav className="flex flex-col gap-1">
                                {community.boards.map((board) => {
                                    const isActive = location.pathname.includes(`/board/${board.id}`);
                                    return (
                                        <Link
                                            key={board.id}
                                            to={board.href}
                                            className={cn(
                                                "px-0 py-2 text-sm transition-all border-l-2 pl-4",
                                                isActive
                                                    ? "text-[#e6e6e6] font-bold border-[#4f8cff]"
                                                    : "text-[#9aa0a6] border-transparent hover:text-[#e6e6e6] hover:border-[#2a2f3a]"
                                            )}
                                        >
                                            {board.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <Button variant="ghost" className="w-full text-[10px] uppercase tracking-widest font-bold text-[#9aa0a6] border border-[#2a2f3a] h-8 justify-start px-3">
                            Request New Board
                        </Button>
                    </aside>

                    {/* CONTENT AREA */}
                    <section className="flex-1 min-w-0">
                        <Outlet />
                    </section>
                </div>
            </main>
        </div>
    );
}
