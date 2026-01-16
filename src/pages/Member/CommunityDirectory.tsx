import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, Filter, Lock, Unlock, FileText } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data
const communities = [
    {
        id: 1,
        name: "Civic Tech Alliance",
        purpose: "Building tools for public good.",
        access: "Open",
        strictness: "Medium",
        topic: "Technology",
    },
    {
        id: 2,
        name: "Urban Planning Study",
        purpose: "Researching sustainable cities.",
        access: "Application Based",
        strictness: "High",
        topic: "Research",
    },
    {
        id: 3,
        name: "Local Governance Watch",
        purpose: "Monitoring city council decisions.",
        access: "Invite Only",
        strictness: "Strict",
        topic: "Politics",
    },
    {
        id: 4,
        name: "Digital Rights Group",
        purpose: "Advocating for internet freedom.",
        access: "Open",
        strictness: "Low",
        topic: "Advocacy",
    },
];

export function CommunityDirectory() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Community Directory</h1>
                    <p className="text-primary/60">Find a community that aligns with your values.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-primary/50" />
                        <Input
                            placeholder="Search communities..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCommunities.map((community) => (
                    <Card key={community.id} className="flex flex-col hover:border-accent/40 transition-colors">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">{community.name}</CardTitle>
                                {community.access === "Open" && <Unlock className="w-4 h-4 text-[#4f8cff]/60" />}
                                {community.access === "Application Based" && <FileText className="w-4 h-4 text-yellow-500/60" />}
                                {community.access === "Invite Only" && <Lock className="w-4 h-4 text-red-500/60" />}
                            </div>
                            <CardDescription>{community.topic}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-primary/80 mb-6 min-h-[40px]">{community.purpose}</p>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-primary/60 font-medium">Access:</span>
                                    <span className={`px-2 py-0.5 rounded border ${community.access === "Open"
                                            ? "border-[#4f8cff]/30 text-[#4f8cff]"
                                            : community.access === "Application Based"
                                                ? "border-yellow-500/30 text-yellow-500"
                                                : "border-red-500/30 text-red-500"
                                        } font-bold uppercase tracking-tighter`}>
                                        {community.access}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-primary/60 font-medium">Strictness:</span>
                                    <span className={`px-2 py-0.5 rounded border ${community.strictness === "High" || community.strictness === "Strict"
                                            ? "border-red-500/30 text-red-400"
                                            : community.strictness === "Medium"
                                                ? "border-yellow-500/30 text-yellow-400"
                                                : "border-green-500/30 text-green-400"
                                        } font-bold uppercase tracking-tighter`}>
                                        {community.strictness}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4">
                            <Link to={`/member/community/${community.id}`} className="w-full">
                                <Button className="w-full bg-[#161a20] hover:bg-[#1c2229] border border-[#2a2f3a]" variant="outline">
                                    View Profile
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
