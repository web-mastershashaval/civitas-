import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { type LucideIcon } from "lucide-react";

interface LayoutProps {
    children: ReactNode;
    sidebarItems: {
        icon: LucideIcon;
        label: string;
        href: string;
    }[];
}

export function Layout({ children, sidebarItems }: LayoutProps) {
    return (
        <div className="flex min-h-screen bg-background text-primary font-sans">
            <Sidebar items={sidebarItems} />
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-8 max-w-5xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
