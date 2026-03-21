import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { type LucideIcon, LogOut, UserCircle } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import civitasLogo from "../../assets/civitaslogo.png";

interface SidebarItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

interface SidebarProps {
    items: SidebarItem[];
    onClose?: () => void;
}

export function Sidebar({ items, onClose }: SidebarProps) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const dashboardLink = user?.role === 'FACILITATOR' || user?.role === 'CO_FACILITATOR' ? "/facilitator/home" : "/member/home";

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
            const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <aside className="w-64 border-r border-border bg-surface h-screen flex flex-col">
            <div className="p-6 border-b border-border hidden md:block">
                <Link to={dashboardLink} className="flex items-center gap-2">
                    <img src={civitasLogo} alt="Civitas Logo" className="h-8 w-auto rounded-full" />
                    <span className="text-xl font-bold text-primary hidden">Civitas</span>
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {items.map((item) => {
                    const isActive = location.pathname.startsWith(item.href);
                    const isFacilitatorItem = location.pathname.includes('/facilitator');
                    const activeColorClass = isFacilitatorItem ? "text-accent-warning border-accent-warning bg-accent-warning/10" : "bg-accent/10 text-accent border-accent";
                    const iconActiveColorClass = isFacilitatorItem ? "text-accent-warning" : "text-accent";
                    const isNotifications = item.label === "Notifications";

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => onClose?.()}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-r-md text-sm font-medium transition-all group border-l-2 relative",
                                isActive
                                    ? activeColorClass
                                    : "text-primary/70 border-transparent hover:bg-surface/50 hover:text-primary hover:border-border"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? iconActiveColorClass : "text-primary/40 group-hover:text-primary"
                            )} />
                            <span className="flex-1">{item.label}</span>
                            {isNotifications && unreadCount > 0 && (
                                <span className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-in zoom-in duration-300">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border space-y-4">
                {user && (
                    <div className="flex items-center gap-3 px-3 py-2">
                        {user.avatar ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/20">
                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <UserCircle className="w-8 h-8 text-accent" />
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-primary truncate w-32">{user.username}</span>
                            <span className="text-[10px] uppercase tracking-widest font-black text-accent/70">{user.role}</span>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to exit the Civitas network?")) {
                            logout();
                        }
                    }}
                    className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
