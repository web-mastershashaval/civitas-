import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ArrowRight, Users, MessageSquare } from "lucide-react";

// Mock data - communities the member belongs to
const myCommunities = [
    {
        id: 1,
        name: "Civic Tech Alliance",
        role: "Member",
        description: "Building tools for public good",
        unreadDiscussions: 3,
        memberCount: 1234,
        accessType: "Open"
    },
    {
        id: 2,
        name: "Urban Planning Study",
        role: "Member",
        description: "Researching sustainable cities",
        unreadDiscussions: 0,
        memberCount: 342,
        accessType: "Application Based"
    }
];

export function MemberHome() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Communities</h1>
                <p className="text-primary/60 mt-2">Your communities</p>
            </div>

            {/* My Communities */}
            <div className="grid gap-6 md:grid-cols-2">
                {myCommunities.map((community) => (
                    <Card key={community.id} className="hover:border-accent/50 transition-colors">
                        <CardHeader>
                            <CardTitle>{community.name}</CardTitle>
                            <CardDescription>{community.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-primary/60 border-b border-border/50 pb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>{community.memberCount} members</span>
                                </div>
                                {community.unreadDiscussions > 0 && (
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-accent" />
                                        <span className="text-accent">{community.unreadDiscussions} new</span>
                                    </div>
                                )}
                                <div className="ml-auto px-2 py-0.5 bg-surface border border-border rounded text-[10px] font-bold uppercase tracking-wider">
                                    {community.accessType}
                                </div>
                            </div>
                            <Link to={`/member/community/${community.id}/home`} className="block pt-4">
                                <Button className="w-full">
                                    Enter Community
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Browse More */}
            <div className="pt-6 border-t border-border">
                <h2 className="text-xl font-semibold mb-4">Discover More Communities</h2>
                <Link to="/member/communities">
                    <Button variant="outline">
                        Browse Community Directory
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </Link>
            </div>

            {/* Quick Start Guide */}
            <Card className="bg-accent/5 border-accent/20">
                <CardHeader>
                    <CardTitle className="text-lg">How to Navigate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-primary/80">
                    <p>1. <strong>Enter a community</strong> to see its boards</p>
                    <p>2. <strong>Select a board</strong> to see scoped sub-boards</p>
                    <p>3. <strong>Choose a sub-board</strong> to view discussions or contribute</p>
                    <p>4. <strong>Click "Contribute"</strong> to create a structured discussion</p>
                </CardContent>
            </Card>
        </div>
    );
}
