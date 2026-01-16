import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { type LucideIcon } from "lucide-react";

interface SidebarItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

interface SidebarProps {
    items: SidebarItem[];
}

export function Sidebar({ items }: SidebarProps) {
    const location = useLocation();

    return (
        <aside className="w-64 border-r border-border bg-surface h-screen flex flex-col">
            <div className="p-6 border-b border-border">
                <h1 className="text-xl font-bold text-primary">Civitas</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-accent/10 text-accent"
                                    : "text-primary/70 hover:bg-surface/50 hover:text-primary"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
