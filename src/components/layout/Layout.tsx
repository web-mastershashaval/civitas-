import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { type LucideIcon, Menu, X, LogOut, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import civitasLogo from "../../assets/civitaslogo.png";

interface LayoutProps {
    children: ReactNode;
    sidebarItems: {
        icon: LucideIcon;
        label: string;
        href: string;
    }[];
}

export function Layout({ children, sidebarItems }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const dashboardLink = user?.role === 'FACILITATOR' || user?.role === 'CO_FACILITATOR' ? "/facilitator/home" : "/member/home";

    return (
        <div className="flex h-screen bg-background text-primary font-sans overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`
                fixed md:relative z-50 md:z-0 h-full transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <Sidebar items={sidebarItems} onClose={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between px-6 h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-4">
                        <Link to={dashboardLink} className="flex items-center">
                            <img src={civitasLogo} alt="Civitas Logo" className="h-8 w-auto rounded-full" />
                        </Link>
                        {user && (
                            <div className="flex items-center gap-2 pr-2 border-r border-border/50">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full border border-accent/20" />
                                ) : (
                                    <UserCircle className="w-6 h-6 text-accent" />
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                if (window.confirm("Sign out of Civitas?")) logout();
                            }}
                            className="p-2 text-red-500/70 hover:text-red-500 transition-colors"
                            aria-label="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-primary/70 hover:text-primary transition-colors"
                        >
                            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto no-scrollbar max-w-[1200px] w-full mx-auto p-6 md:p-8 flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
