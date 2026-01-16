import { Layout } from "../layout/Layout";
import { Home, Compass, Shield, Users, Bell, User, BookOpen } from "lucide-react";
import { Outlet } from "react-router-dom";

const facilitatorSidebarItems = [
    { icon: Home, label: "Overview", href: "/facilitator/home" },
    { icon: Compass, label: "Communities", href: "/facilitator/communities" },
    { icon: Bell, label: "Notifications", href: "/facilitator/notifications" },
    { icon: Shield, label: "Moderation", href: "/facilitator/moderation" },
    { icon: Users, label: "Members", href: "/facilitator/members" },
    { icon: BookOpen, label: "Rules", href: "/facilitator/rules" },
    { icon: User, label: "Profile", href: "/facilitator/profile" },
];

export function FacilitatorLayout() {
    return (
        <Layout sidebarItems={facilitatorSidebarItems}>
            <Outlet />
        </Layout>
    );
}
