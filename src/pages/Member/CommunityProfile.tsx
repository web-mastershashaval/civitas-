import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Shield, Users, FileText, Lock, BookOpen, Info, UserCircle } from "lucide-react";

// Mock data (expanded)
const communityData = {
    1: {
        name: "Civic Tech Alliance",
        purpose: "Building tools for public good.",
        description: "A community for developers, designers, and policy makers working on civic technology. We focus on open source projects that benefit local governments and communities.",
        access: "Open",
        strictness: "Medium",
        facilitators: [
            { name: "Alice", bio: "Software engineer with 10 years in civic tech" },
            { name: "Bob", bio: "Policy analyst and community organizer" }
        ],
        boards: ["Projects", "Ideas", "Events"],
        rules: [
            { name: "No self-promotion", description: "Keep discussions focused on community projects" },
            { name: "Open source only", description: "All shared projects must be open source" },
            { name: "Be respectful", description: "Treat all members with respect and professionalism" }
        ],
    },
    2: {
        name: "Urban Planning Study",
        purpose: "Researching sustainable cities.",
        description: "An academic and professional group dedicated to urban planning research. We discuss zoning, transportation, and sustainability.",
        access: "Application",
        strictness: "High",
        facilitators: [
            { name: "Dr. Smith", bio: "Professor of Urban Planning" },
            { name: "Jane", bio: "City planner with 15 years experience" }
        ],
        boards: ["Research", "Policy", "Case Studies"],
        rules: [
            { name: "Cite sources", description: "All claims must be backed by credible sources" },
            { name: "No speculation", description: "Stick to evidence-based discussion" },
            { name: "Professional conduct", description: "Maintain academic and professional standards" }
        ],
    },
};

export function CommunityProfile() {
    const { id } = useParams();
    const community = communityData[Number(id) as keyof typeof communityData];
    const [activeTab, setActiveTab] = useState<"about" | "rules" | "facilitators">("about");

    if (!community) {
        return <div>Community not found</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold">{community.name}</h1>
                    <p className="text-xl text-primary/80 max-w-2xl">{community.purpose}</p>
                    <div className="flex items-center gap-4 text-sm text-primary/60">
                        <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            <span>{community.strictness} Governance</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{community.facilitators.length} Facilitators</span>
                        </div>
                    </div>
                </div>

                <Card className="w-full md:w-80 border-accent/20">
                    <CardHeader>
                        <CardTitle>Join Community</CardTitle>
                        <CardDescription>Access Type: {community.access}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {community.access === "Open" ? (
                            <Button className="w-full" size="lg">Join Now</Button>
                        ) : community.access === "Application" ? (
                            <Link to={`/member/community/${id}/apply`}>
                                <Button className="w-full" size="lg">Apply to Join</Button>
                            </Link>
                        ) : (
                            <Button className="w-full" variant="secondary" disabled>
                                <Lock className="w-4 h-4 mr-2" /> Invite Only
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-border">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab("about")}
                        className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === "about"
                                ? "border-accent text-accent"
                                : "border-transparent text-primary/60 hover:text-primary"
                            }`}
                    >
                        <Info className="w-4 h-4" />
                        About
                    </button>
                    <button
                        onClick={() => setActiveTab("rules")}
                        className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === "rules"
                                ? "border-accent text-accent"
                                : "border-transparent text-primary/60 hover:text-primary"
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        Community Rules
                    </button>
                    <button
                        onClick={() => setActiveTab("facilitators")}
                        className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === "facilitators"
                                ? "border-accent text-accent"
                                : "border-transparent text-primary/60 hover:text-primary"
                            }`}
                    >
                        <UserCircle className="w-4 h-4" />
                        Facilitators
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === "about" && (
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>About This Community</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-primary/80 leading-relaxed">{community.description}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Boards Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {community.boards.map((board, i) => (
                                    <div key={i} className="p-3 bg-surface rounded-md border border-border flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-primary/50" />
                                        <span>{board}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "rules" && (
                <div className="max-w-3xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Community Behavior Settings</CardTitle>
                            <CardDescription>
                                These rules help maintain a healthy and productive community
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {community.rules.map((rule, i) => (
                                <div key={i} className="p-4 bg-surface rounded-md border border-border">
                                    <h4 className="font-semibold text-lg mb-2">{rule.name}</h4>
                                    <p className="text-primary/70">{rule.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "facilitators" && (
                <div className="grid md:grid-cols-2 gap-6">
                    {community.facilitators.map((facilitator, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
                                        <UserCircle className="w-10 h-10 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{facilitator.name}</h3>
                                        <p className="text-sm text-primary/60 mt-1">{facilitator.bio}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
