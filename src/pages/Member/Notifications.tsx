import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Bell, MessageSquare, Loader2 } from "lucide-react";
import { notificationService } from "../../services/api";

interface Notification {
    id: string;
    title: string;
    message: string;
    link: string;
    is_read: boolean;
    created_at: string;
}

export function MemberNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getNotifications();
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Syncing Alerts...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center border-b border-[#2a2f3a] pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-[#e6e6e6]">Notifications</h1>
                    <p className="text-[#9aa0a6] text-[10px] uppercase tracking-[0.2em] font-black mt-1">Personnel Activity Ledger</p>
                </div>
                <Button variant="ghost" className="text-[10px] uppercase font-black tracking-widest text-[#4f8cff] hover:bg-[#4f8cff]/10 border border-[#4f8cff]/20" onClick={handleMarkAllAsRead}>
                    Clear All Alerts
                </Button>
            </div>

            <div className="space-y-3">
                {notifications.map((notification) => (
                    <Link
                        key={notification.id}
                        to={notification.link || '#'}
                        onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                        className="block group"
                    >
                        <Card
                            className={`border transition-all ${!notification.is_read ? 'bg-[#4f8cff]/5 border-[#4f8cff]/30 shadow-lg shadow-[#4f8cff]/5' : 'bg-[#161a20] border-[#2a2f3a] opacity-60 hover:opacity-100'}`}
                        >
                            <CardContent className="p-5 flex items-start gap-5">
                                <div className={`p-3 rounded-none border ${!notification.is_read ? 'bg-[#4f8cff]/10 border-[#4f8cff]/30 text-[#4f8cff]' : 'bg-black/20 border-[#2a2f3a] text-[#9aa0a6]'}`}>
                                    {notification.title.includes('Reply') ? <MessageSquare className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm font-black uppercase tracking-tight mb-1 ${!notification.is_read ? 'text-[#e6e6e6]' : 'text-[#9aa0a6]'}`}>{notification.title}</h4>
                                    <p className={`text-sm italic ${!notification.is_read ? 'text-[#e6e6e6]' : 'text-[#9aa0a6]'}`}>{notification.message}</p>
                                    <p className="text-[9px] text-[#9aa0a6] uppercase font-black mt-3 flex items-center gap-2 tracking-widest opacity-50">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <div className="w-2 h-2 bg-[#4f8cff] rotate-45 animate-pulse shrink-0 mt-2" />
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {notifications.length === 0 && (
                <div className="text-center py-24 border border-dashed border-[#2a2f3a] bg-[#161a20]/20">
                    <Bell className="w-16 h-16 mx-auto mb-6 text-[#9aa0a6] opacity-10" />
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-[#9aa0a6]">Personnel Activity Ledger Empty</p>
                </div>
            )}
        </div>
    );
}
