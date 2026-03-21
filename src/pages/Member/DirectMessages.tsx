import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Send, User as UserIcon, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { directMessageService } from "../../services/api";
import { useToast } from "../../components/ui/Toast";

interface DirectMessage {
    id: string;
    sender: string;
    sender_username: string;
    sender_avatar: string | null;
    receiver: string;
    receiver_username: string;
    receiver_avatar: string | null;
    content: string;
    is_read: boolean;
    created_at: string;
}

interface Conversation {
    otherUserId: string;
    otherUsername: string;
    otherAvatar: string | null;
    lastMessage: DirectMessage;
    unreadCount: number;
}

export function DirectMessages() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await directMessageService.getConversations();
            const data: DirectMessage[] = res.data;
            setMessages(data);
            
            // Group into conversations
            if (user) {
                const convsMap = new Map<string, Conversation>();
                data.forEach(msg => {
                    const isSender = msg.sender === user.id;
                    const otherUserId = isSender ? msg.receiver : msg.sender;
                    const otherUsername = isSender ? msg.receiver_username : msg.sender_username;
                    const otherAvatar = isSender ? msg.receiver_avatar : msg.sender_avatar;
                    
                    const existing = convsMap.get(otherUserId);
                    const unreadInc = (!isSender && !msg.is_read) ? 1 : 0;
                    
                    if (!existing || new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
                        convsMap.set(otherUserId, {
                            otherUserId,
                            otherUsername,
                            otherAvatar,
                            lastMessage: msg,
                            unreadCount: (existing?.unreadCount || 0) + unreadInc
                        });
                    } else if (existing) {
                        existing.unreadCount += unreadInc;
                    }
                });
                
                const sortedConvs = Array.from(convsMap.values()).sort((a, b) => 
                    new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
                );
                setConversations(sortedConvs);
            }
        } catch (err: any) {
            console.error("Failed to load messages:", err);
            showToast("Failed to load direct messages", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Polling every 15s could be added here
    }, [user]);

    useEffect(() => {
        if (activeConversationId) {
            scrollToBottom();
            // Mark read
            const conv = conversations.find(c => c.otherUserId === activeConversationId);
            if (conv && conv.unreadCount > 0) {
                directMessageService.markAsRead(activeConversationId).then(() => {
                    fetchMessages();
                });
            }
        }
    }, [activeConversationId, messages]);

    const handleSendMessage = async (e: any) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId) return;

        const optimisticMsg: DirectMessage = {
            id: Date.now().toString(),
            sender: user?.id || '',
            sender_username: user?.username || '',
            sender_avatar: null,
            receiver: activeConversationId,
            receiver_username: '',
            receiver_avatar: null,
            content: newMessage,
            is_read: false,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage("");

        try {
            await directMessageService.sendMessage(activeConversationId, optimisticMsg.content);
            fetchMessages();
        } catch (err) {
            showToast("Failed to send message", "error");
            fetchMessages(); // Revert optimistic update
        }
    };

    const activeMessages = messages.filter(m => 
        (m.sender === activeConversationId && m.receiver === user?.id) ||
        (m.receiver === activeConversationId && m.sender === user?.id)
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Decrypting Channels...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl w-full h-[85vh] flex gap-6 animate-in fade-in duration-500">
            {/* Conversations Sidebar */}
            <div className="w-1/3 flex flex-col border border-[#2a2f3a] bg-[#161a20] overflow-hidden">
                <div className="p-5 border-b border-[#2a2f3a] bg-black/40">
                    <h2 className="text-xl font-black uppercase tracking-tighter text-[#e6e6e6] flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-[#4f8cff]" />
                        Direct Messages
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-[#9aa0a6]">
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-50">No Channels Found</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <div 
                                key={conv.otherUserId}
                                onClick={() => setActiveConversationId(conv.otherUserId)}
                                className={`p-4 border-b border-[#2a2f3a] cursor-pointer transition-all hover:bg-[#2a2f3a]/50 flex items-center gap-4 ${activeConversationId === conv.otherUserId ? 'bg-[#2a2f3a]/80 border-l-2 border-l-[#4f8cff]' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-black/40 border border-[#2a2f3a] flex items-center justify-center overflow-hidden shrink-0">
                                    {conv.otherAvatar ? (
                                        <img src={conv.otherAvatar} alt={conv.otherUsername} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-[#9aa0a6]" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-bold text-[#e6e6e6] truncate">{conv.otherUsername}</span>
                                        {conv.unreadCount > 0 && (
                                            <span className="w-2 h-2 bg-[#4f8cff] shrink-0 mt-1 animate-pulse shadow-[0_0_8px_rgba(79,140,255,0.6)] rounded-none rotate-45"></span>
                                        )}
                                    </div>
                                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-[#4f8cff] font-bold' : 'text-[#9aa0a6]'}`}>
                                        {conv.lastMessage.sender === user?.id ? 'You: ' : ''}{conv.lastMessage.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Active Thread */}
            <div className="w-2/3 flex flex-col border border-[#2a2f3a] bg-[#161a20] relative">
                {activeConversationId ? (
                    <>
                        <div className="p-5 border-b border-[#2a2f3a] bg-black/40 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-black/40 border border-[#2a2f3a] flex items-center justify-center overflow-hidden shrink-0">
                                <UserIcon className="w-5 h-5 text-[#9aa0a6]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#e6e6e6]">
                                    {conversations.find(c => c.otherUserId === activeConversationId)?.otherUsername}
                                </h3>
                                <p className="text-[10px] uppercase font-black tracking-widest text-[#4f8cff] opacity-70">Encrypted Channel</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeMessages.map((msg, idx) => {
                                const isMe = msg.sender === user?.id;
                                return (
                                    <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[75%] px-5 py-3 ${isMe ? 'bg-[#4f8cff]/10 border border-[#4f8cff]/30 text-[#e6e6e6]' : 'bg-black/40 border border-[#2a2f3a] text-[#9aa0a6]'}`}>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                                        </div>
                                        <span className="text-[9px] uppercase font-black tracking-widest text-[#9aa0a6] opacity-50 mt-2">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-5 border-t border-[#2a2f3a] bg-black/20">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Transmit secure message..."
                                    className="bg-black/60 border-[#2a2f3a] text-[#e6e6e6] focus-visible:ring-[#4f8cff]/50"
                                />
                                <Button type="submit" disabled={!newMessage.trim()} className="shrink-0 bg-[#4f8cff]/10 text-[#4f8cff] hover:bg-[#4f8cff]/20 border border-[#4f8cff]/30">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#9aa0a6] p-8 border-dashed border-[#2a2f3a] border m-8 bg-black/20">
                        <MessageSquare className="w-16 h-16 mb-6 opacity-10" />
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] opacity-50">No Channel Selected</p>
                    </div>
                )}
            </div>
        </div>
    );
}
