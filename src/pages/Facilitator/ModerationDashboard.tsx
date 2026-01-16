import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Shield, AlertTriangle } from "lucide-react";

// Mock data - communities the facilitator manages
const managedCommunities = [
    {
        id: 1,
        name: "Civic Tech Alliance",
        pendingFlags: 2,
        totalMembers: 1234
    },
    {
        id: 2,
        name: "Urban Planning Study",
        pendingFlags: 0,
        totalMembers: 342
    }
];

export function ModerationDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Shield className="w-8 h-8 text-accent" />
                    Moderation Dashboard
                </h1>
                <p className="text-primary/60">Monitor and moderate content across your communities</p>
            </div>

            <div className="grid gap-6">
                {managedCommunities.map((community) => (
                    <Card key={community.id}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{community.name}</span>
                                {community.pendingFlags > 0 && (
                                    <span className="flex items-center gap-2 text-sm font-normal text-accent-warning">
                                        <AlertTriangle className="w-4 h-4" />
                                        {community.pendingFlags} pending flags
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-primary/60">
                                    {community.totalMembers} members
                                </div>
                                <Link to={`/facilitator/community/${community.id}/moderation`}>
                                    <Button variant={community.pendingFlags > 0 ? "default" : "outline"}>
                                        {community.pendingFlags > 0 ? "Review Flags" : "View Moderation"}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {managedCommunities.every(c => c.pendingFlags === 0) && (
                <div className="text-center py-12 text-primary/40">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>All communities are in good standing</p>
                    <p className="text-sm">No pending moderation actions</p>
                </div>
            )}
        </div>
    );
}
