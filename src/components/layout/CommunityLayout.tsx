import { useParams, Link, useLocation, Outlet, useOutletContext } from "react-router-dom";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import { useCommunity } from "../../hooks/useCommunity";
import { Loader2, Shield, ChevronRight, Home, LayoutGrid, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface BreadcrumbItem {
    label: string;
    href: string;
}

export interface CommunityContextType {
    setBreadcrumbs: (crumbs: BreadcrumbItem[]) => void;
}

export function useCommunityContext() {
    return useOutletContext<CommunityContextType>();
}

export function CommunityLayout() {
    const { id } = useParams();
    const location = useLocation();
    const { user, logout } = useAuth();
    const isFacilitatorMode = location.pathname.includes('/facilitator');
    const { community, loading } = useCommunity(id);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await api.get('/notifications/unread_count/');
                setUnreadCount(res.data.count);
            } catch (err: any) {
                console.error("Failed to fetch unread count", err);
            }
        };

        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        // Reset breadcrumbs on route change to prevent stale paths
        setBreadcrumbs([]);
    }, [location.pathname]);

    if (loading) {
        return (
            <div className="flex h-screen bg-[#0f1115] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-[0.4em] italic">Resolving Authority Context...</p>
            </div>
        );
    }

    if (!community) return <Outlet />;

    const dashboardLink = user?.role === 'FACILITATOR' || user?.role === 'CO_FACILITATOR' ? "/facilitator/home" : "/member/home";

    return (
        <div className="flex h-screen bg-[#0f1115] text-[#e6e6e6] font-sans flex-col overflow-hidden relative">
            {/* TOPBAR */}
            <header className="h-16 shrink-0 border-b border-[#2a2f3a] bg-[#0f1115]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-50 sticky top-0">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-[#9aa0a6] hover:text-[#e6e6e6] md:hidden flex items-center gap-2"
                        aria-label="Toggle Sectors Menu"
                    >
                        <LayoutGrid className="w-5 h-5 text-[#4f8cff]" />
                        <span className="text-[9px] font-black uppercase tracking-widest hidden xs:block">Boards</span>
                    </button>
                    <Link to={dashboardLink} className="text-lg md:text-xl font-black tracking-tighter hover:text-[#4f8cff] transition-colors hidden sm:block">
                        CIVITAS
                    </Link>
                    <div className="h-4 w-px bg-[#2a2f3a] hidden sm:block" />
                    <nav className="flex items-center gap-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#9aa0a6] overflow-hidden whitespace-nowrap">
                        <Link to="/member/home" className="hover:text-[#e6e6e6] transition-colors flex items-center shrink-0">
                            <Home className="w-3.5 h-3.5 md:mr-1" />
                            <span className="hidden md:inline">Core</span>
                        </Link>
                        <ChevronRight className="w-3 h-3 opacity-30" />
                        <Link to={`/member/community/${id}`} className="hover:text-[#e6e6e6] transition-colors truncate max-w-[80px] md:max-w-none">
                            {community.name}
                        </Link>
                        {breadcrumbs.length > 0 && <ChevronRight className="w-3 h-3 opacity-30" />}
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={idx} className={`items-center gap-1 ${idx === breadcrumbs.length - 1 ? 'flex' : 'hidden md:flex'}`}>
                                {idx > 0 && <ChevronRight className="w-3 h-3 opacity-30" />}
                                <Link to={crumb.href} className={cn(
                                    "transition-colors truncate max-w-[100px] md:max-w-none",
                                    idx === breadcrumbs.length - 1 ? "text-[#4f8cff]" : "hover:text-[#e6e6e6]"
                                )}>
                                    {crumb.label}
                                </Link>
                            </div>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <Link to="/member/notifications" className="relative p-2 text-[#9aa0a6] hover:text-[#4f8cff] transition-colors group">
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white animate-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                    <Button variant="ghost" className="hidden sm:flex text-[9px] md:text-xs uppercase tracking-widest font-bold text-[#9aa0a6] hover:text-[#e6e6e6] border border-[#2a2f3a] h-8 px-2 md:px-3">
                        Rules
                    </Button>
                    <div
                        className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1 bg-[#1a1e26] border border-[#2a2f3a] cursor-pointer hover:border-[#4f8cff]/40 transition-colors group"
                        onClick={() => {
                            if (window.confirm("Sign out of Civitas?")) {
                                logout();
                            }
                        }}
                    >
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-[#4f8cff]/20" />
                        ) : (
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#4f8cff]/10 flex items-center justify-center border border-[#4f8cff]/20">
                                <span className="text-[9px] md:text-[10px] font-black text-[#4f8cff] group-hover:text-[#e6e6e6]">{user?.username?.[0].toUpperCase()}</span>
                            </div>
                        )}
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#e6e6e6] hidden lg:block group-hover:text-[#4f8cff]">{user?.username}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar max-w-[1200px] w-full mx-auto p-4 md:p-8 flex flex-col">
                {/* COMMUNITY NOTICE */}
                <section className="bg-[#4f8cff]/5 border border-[#2a2f3a] p-4 md:p-5 mb-6 md:mb-10 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Shield className="w-8 md:w-12 h-8 md:h-12" />
                    </div>
                    <p className="text-[9px] md:text-xs font-bold text-[#9aa0a6] leading-relaxed uppercase tracking-widest">
                        Protocol Notice: This node is governed by a decentralized charter.
                        <span className="hidden sm:inline"> Every action is documented and bound to the member records.</span>
                    </p>
                </section>

                <div className="flex gap-4 md:gap-12 min-h-0 flex-1 relative">
                    {/* Mobile Sidebar Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* SIDEBAR: BOARDS */}
                    <aside className={cn(
                        "fixed md:sticky top-0 md:top-4 h-full md:h-fit self-start shrink-0 w-64 space-y-8 pb-8 z-50 md:z-0 transition-transform duration-300 bg-[#0f1115] md:bg-transparent p-6 md:p-0 border-r border-[#2a2f3a] md:border-none",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    )}>
                        <div className="md:hidden flex justify-between items-center mb-8 pb-4 border-b border-[#2a2f3a]">
                            <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#4f8cff]">Boards</h2>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-[#9aa0a6]">
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                        </div>

                        <div>
                            <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-[#9aa0a6] mb-6 hidden md:block">Boards</h2>
                            <nav className="flex flex-col gap-2">
                                {community.boards?.map((board: any) => {
                                    const isActive = location.pathname.includes(`/board/${board.id}`);
                                    const basePath = isFacilitatorMode ? `/facilitator/community/${id}` : `/member/community/${id}`;
                                    const activeColor = isFacilitatorMode ? "[#f0b429]" : "[#4f8cff]";

                                    return (
                                        <Link
                                            key={board.id}
                                            to={`${basePath}/board/${board.id}`}
                                            onClick={() => setIsSidebarOpen(false)}
                                            className={cn(
                                                "px-0 py-2.5 text-sm transition-all border-l-2 pl-5 font-bold capitalize tracking-tight",
                                                isActive
                                                    ? `text-${activeColor} border-${activeColor} bg-${activeColor}/5`
                                                    : "text-[#9aa0a6] border-transparent hover:text-[#e6e6e6] hover:border-[#2a2f3a]"
                                            )}
                                        >
                                            {board.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <Button variant="ghost" className="w-full text-[9px] uppercase tracking-widest font-black text-[#9aa0a6] border border-[#2a2f3a] h-10 justify-start px-4 hover:border-[#4f8cff]/50 hover:bg-[#4f8cff]/5">
                            Request New Board
                        </Button>
                    </aside>

                    {/* CONTENT AREA */}
                    <section className="flex-1 min-w-0">
                        <Outlet context={{ setBreadcrumbs }} />
                    </section>
                </div>
            </main>
        </div>
    );
}
