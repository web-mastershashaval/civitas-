import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Bell, UserPlus, MessageSquare, CheckCircle } from "lucide-react";

// Mock data
const notifications = [
    {
        id: 1,
        type: "application",
        icon: CheckCircle,
        color: "text-green-400",
        message: "Your application to Urban Planning Study was approved!",
        time: "2 hours ago",
        unread: true
    },
    {
        id: 2,
        type: "mention",
        icon: MessageSquare,
        color: "text-blue-400",
        message: "Alice mentioned you in a discussion",
        time: "5 hours ago",
        unread: true
    },
    {
        id: 3,
        type: "invite",
        icon: UserPlus,
        color: "text-accent",
        message: "You've been invited to join Policy Research Group",
        time: "1 day ago",
        unread: false
    }
];

export function MemberNotifications() {
    return (
        <div className="max-w-3xl space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-primary/60">Stay updated on your community activity</p>
                </div>
                <Button variant="ghost" size="sm">Mark all as read</Button>
            </div>

            <div className="space-y-3">
                {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                        <Card
                            key={notification.id}
                            className={`${notification.unread ? 'bg-accent/5 border-accent/20' : ''} hover:bg-surface/50 transition-colors cursor-pointer`}
                        >
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className={`p-2 rounded-full bg-surface ${notification.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{notification.message}</p>
                                    <p className="text-sm text-primary/60 mt-1">{notification.time}</p>
                                </div>
                                {notification.unread && (
                                    <div className="w-2 h-2 rounded-full bg-accent" />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {notifications.length === 0 && (
                <div className="text-center py-12 text-primary/40">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No notifications yet</p>
                </div>
            )}
        </div>
    );
}
