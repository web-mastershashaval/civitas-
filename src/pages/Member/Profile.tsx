import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { User, Mail, Facebook, Phone } from "lucide-react";

export function MemberProfile() {
    const { username } = useParams();
    const isOwnProfile = !username;
    const name = username || "John Member";

    return (
        <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-2 duration-500">
            <div>
                <h1 className="text-3xl font-bold">{isOwnProfile ? "My Profile" : `${name}'s Profile`}</h1>
                <p className="text-primary/60">{isOwnProfile ? "Manage your personal information" : "Public profile and community activity"}</p>
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
                                <Input defaultValue={name} readOnly={!isOwnProfile} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-[#9aa0a6]" />
                                    <Input
                                        type="email"
                                        defaultValue={`${name.toLowerCase().replace(" ", ".")}@example.com`}
                                        readOnly={!isOwnProfile}
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Facebook Profile</label>
                                <div className="flex items-center gap-2">
                                    <Facebook className="w-4 h-4 text-[#9aa0a6]" />
                                    <Input
                                        defaultValue={isOwnProfile ? "" : `facebook.com/${name.toLowerCase().replace(" ", "")}`}
                                        readOnly={!isOwnProfile}
                                        placeholder="facebook.com/username"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-[#9aa0a6]" />
                                    <Input
                                        defaultValue={isOwnProfile ? "" : "+254 700 000 000"}
                                        readOnly={!isOwnProfile}
                                        placeholder="+000 000 000 000"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bio</label>
                        <textarea
                            className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            rows={4}
                            defaultValue="Interested in civic technology and community building."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Community Memberships</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="p-3 bg-surface rounded-md border border-border">
                            <div className="font-semibold">Civic Tech Alliance</div>
                            <div className="text-sm text-primary/60">Member since Jan 2024</div>
                        </div>
                        <div className="p-3 bg-surface rounded-md border border-border">
                            <div className="font-semibold">Urban Planning Study</div>
                            <div className="text-sm text-primary/60">Member since Feb 2024</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isOwnProfile && (
                <div className="flex justify-end gap-4">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                </div>
            )}
        </div>
    );
}
