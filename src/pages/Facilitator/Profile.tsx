import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { User, Shield } from "lucide-react";

export function FacilitatorProfile() {
    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Facilitator Profile</h1>
                <p className="text-primary/60">Manage your profile and credentials</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
                            <User className="w-12 h-12 text-accent" />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Display Name</label>
                                <Input defaultValue="Jane Facilitator" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" defaultValue="jane@example.com" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bio</label>
                        <textarea
                            className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            rows={4}
                            defaultValue="Experienced community facilitator focused on civic engagement and urban planning."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Facilitator Stats
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-bold text-accent">2</div>
                            <div className="text-sm text-primary/60">Communities</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-accent">1,576</div>
                            <div className="text-sm text-primary/60">Total Members</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-accent">342</div>
                            <div className="text-sm text-primary/60">Moderation Actions</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
            </div>
        </div>
    );
}
