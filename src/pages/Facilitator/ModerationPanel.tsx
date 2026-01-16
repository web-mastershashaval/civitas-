import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "../../components/ui/Card";
import { Shield, Check, X, AlertTriangle, ArrowLeft } from "lucide-react";

// Mock data
const flaggedContent = [
    {
        id: 1,
        type: "Discussion",
        title: "Spam post about crypto",
        author: "SpamBot9000",
        reason: "Spam",
        content: "Buy my new coin! It's going to the moon!",
        timestamp: "2 hours ago"
    },
    {
        id: 2,
        type: "Response",
        title: "Re: Urban Planning",
        author: "AngryUser",
        reason: "Harassment",
        content: "You don't know what you're talking about, you idiot.",
        timestamp: "5 hours ago"
    }
];

export function ModerationPanel() {
    const { id } = useParams();

    const handleAction = (action: string, itemId: number) => {
        console.log(`Action: ${action} on item ${itemId}`);
        // Simulate action
    };

    return (
        <div className="space-y-8">
            <div>
                <Link to={`/facilitator/community/${id}/manage`}>
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-accent">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Shield className="w-8 h-8 text-accent-warning" />
                    Moderation Queue
                </h1>
                <p className="text-primary/60">Review flagged content and take action.</p>
            </div>

            <div className="space-y-4">
                {flaggedContent.map((item) => (
                    <Card key={item.id} className="border-accent-warning/30">
                        <CardHeader className="bg-accent-warning/5 border-b border-accent-warning/10 pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-accent-warning" />
                                    <span className="font-semibold text-accent-warning">{item.reason}</span>
                                    <span className="text-primary/40">•</span>
                                    <span className="text-sm text-primary/60">{item.type} by {item.author}</span>
                                </div>
                                <span className="text-xs text-primary/40">{item.timestamp}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <h4 className="font-semibold mb-2">{item.title}</h4>
                            <p className="text-primary/80 bg-surface p-3 rounded-md border border-border">
                                "{item.content}"
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3 bg-surface/30 pt-4">
                            <Button variant="ghost" size="sm" onClick={() => handleAction("Dismiss", item.id)}>
                                Dismiss
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-400 hover:text-red-300 border-red-900/50 hover:bg-red-900/20" onClick={() => handleAction("Remove", item.id)}>
                                <X className="w-4 h-4 mr-2" />
                                Remove Content
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-500 text-white" onClick={() => handleAction("Keep", item.id)}>
                                <Check className="w-4 h-4 mr-2" />
                                Keep (False Flag)
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {flaggedContent.length === 0 && (
                    <div className="text-center py-12 text-primary/40">
                        <Check className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>All clear! No pending flags.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
