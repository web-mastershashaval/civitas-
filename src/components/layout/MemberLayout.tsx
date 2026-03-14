import { Layout } from "../layout/Layout";
import { Home, Compass, Bell, User, History } from "lucide-react";
import { Outlet } from "react-router-dom";

const memberSidebarItems = [
    { icon: Home, label: "Home", href: "/member/home" },
    { icon: Compass, label: "Communities", href: "/member/communities" },
    { icon: Bell, label: "Notifications", href: "/member/notifications" },
    { icon: History, label: "Transparency Record", href: "/member/moderation-history" },
    { icon: User, label: "Profile", href: "/member/profile" },
];

export function MemberLayout() {
    return (
        <Layout sidebarItems={memberSidebarItems}>
            <Outlet />
        </Layout>
    );
}
