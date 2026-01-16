import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, UserX, Shield, Ban } from "lucide-react";

// Mock data
const members = [
    { id: 1, name: "Alice Johnson", role: "Contributor", joined: "2024-01-15", posts: 45, status: "Active" },
    { id: 2, name: "Bob Smith", role: "Member", joined: "2024-02-20", posts: 12, status: "Active" },
    { id: 3, name: "Charlie Brown", role: "Moderator", joined: "2023-12-01", posts: 234, status: "Active" },
    { id: 4, name: "Diana Prince", role: "Member", joined: "2024-03-10", posts: 8, status: "Muted" },
];

export function MembersManagement() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Members Management</h1>
                <p className="text-primary/60">Manage community members and roles</p>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/40" />
                    <Input
                        placeholder="Search members..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline">Filter</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Community Members ({filteredMembers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {filteredMembers.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 bg-surface rounded-md border border-border hover:bg-surface/70 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                        <span className="font-semibold text-accent">{member.name[0]}</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold">{member.name}</div>
                                        <div className="text-sm text-primary/60">
                                            {member.role} • {member.posts} posts • Joined {member.joined}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${member.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                                        }`}>
                                        {member.status}
                                    </span>
                                    <Button variant="ghost" size="sm">
                                        <Shield className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <UserX className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Ban className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
