import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Plus, Edit, ToggleLeft, ToggleRight } from "lucide-react";

// Mock data
const rules = [
    {
        id: 1,
        name: "No Harassment",
        category: "Harassment & abuse",
        trigger: "Message is reported 3 times",
        consequence: "Remove content and warn user",
        active: true
    },
    {
        id: 2,
        name: "Spam Prevention",
        category: "Spam & promotions",
        trigger: "Link shared by new member",
        consequence: "Require review",
        active: true
    },
    {
        id: 3,
        name: "Off-Topic Posts",
        category: "Content quality",
        trigger: "Post flagged as off-topic",
        consequence: "Temporarily mute for 24 hours",
        active: false
    }
];

export function RulesList() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Community Behavior Settings</h1>
                    <p className="text-primary/60">Configure how your community handles different situations</p>
                </div>
                <Link to="/facilitator/rules/create">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Rule
                    </Button>
                </Link>
            </div>

            <div className="space-y-4">
                {rules.map((rule) => (
                    <Card key={rule.id} className={rule.active ? "" : "opacity-60"}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                                    <p className="text-sm text-primary/60 mt-1">{rule.category}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {rule.active ? (
                                        <ToggleRight className="w-6 h-6 text-accent cursor-pointer" />
                                    ) : (
                                        <ToggleLeft className="w-6 h-6 text-primary/40 cursor-pointer" />
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-surface rounded-md border border-border">
                                <p className="text-sm">
                                    <span className="font-semibold text-primary/80">When:</span> {rule.trigger}
                                    <br />
                                    <span className="font-semibold text-primary/80">Then:</span> {rule.consequence}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Link to={`/facilitator/rules/${rule.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-3 h-3 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
