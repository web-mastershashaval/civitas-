import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { UserPlus, Flag, CheckCircle, AlertTriangle } from "lucide-react";

// Mock data
const notifications = [
    {
        id: 1,
        type: "application",
        icon: UserPlus,
        color: "text-blue-400",
        message: "3 new applications to Urban Planning Study",
        time: "10 minutes ago",
        unread: true
    },
    {
        id: 2,
        type: "flag",
        icon: Flag,
        color: "text-accent-warning",
        message: "Content flagged in Civic Tech Alliance",
        time: "1 hour ago",
        unread: true
    },
    {
        id: 3,
        type: "violation",
        icon: AlertTriangle,
        color: "text-red-400",
        message: "Rule violation: Spam detected",
        time: "2 hours ago",
        unread: false
    },
    {
        id: 4,
        type: "success",
        icon: CheckCircle,
        color: "text-green-400",
        message: "Community milestone: 1000 members!",
        time: "1 day ago",
        unread: false
    }
];

export function Notifications() {
    return (
        <div className="max-w-3xl space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-primary/60">Stay updated on community activity</p>
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
        </div>
    );
}
