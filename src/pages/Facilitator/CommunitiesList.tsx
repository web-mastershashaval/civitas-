import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Plus, Users, Activity, TrendingUp } from "lucide-react";

// Mock data
const communities = [
    {
        id: 1,
        name: "Civic Tech Alliance",
        members: 1234,
        activeDiscussions: 56,
        access: "Open",
        strictness: "Medium"
    },
    {
        id: 2,
        name: "Urban Planning Study",
        members: 342,
        activeDiscussions: 23,
        access: "Application",
        strictness: "High"
    }
];

export function CommunitiesList() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Your Communities</h1>
                    <p className="text-primary/60">Manage all communities you facilitate</p>
                </div>
                <Link to="/facilitator/create-community">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Community
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {communities.map((community) => (
                    <Card key={community.id} className="hover:bg-surface/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                {community.name}
                                <span className="text-xs font-normal px-2 py-1 bg-accent/10 text-accent rounded">
                                    {community.access}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary/60" />
                                    <span>{community.members}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary/60" />
                                    <span>{community.activeDiscussions}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-primary/60" />
                                    <span>{community.strictness}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/facilitator/community/${community.id}/manage`} className="flex-1">
                                    <Button className="w-full">Manage</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
