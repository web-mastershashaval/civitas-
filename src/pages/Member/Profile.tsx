import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { User as UserIcon, Mail, Facebook, Phone, Camera, Loader2, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { userService } from "../../services/api";

export function MemberProfile() {
    const { username: routeUsername } = useParams();
    const { user: currentUser, checkAuth } = useAuth();
    const isOwnProfile = !routeUsername || routeUsername === currentUser?.username;

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        bio: "",
        phone: "",
        facebook_profile: ""
    });

    // Populate form data when currentUser is available
    useEffect(() => {
        if (currentUser && isOwnProfile) {
            setFormData({
                username: currentUser.username || "",
                email: currentUser.email || "",
                bio: currentUser.bio || "",
                phone: currentUser.phone || "",
                facebook_profile: currentUser.facebook_profile || ""
            });
        }
    }, [currentUser, isOwnProfile]);

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const data = new FormData();
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('bio', formData.bio);
            data.append('phone', formData.phone);
            data.append('facebook_profile', formData.facebook_profile);

            await userService.updateProfile(data);
            await checkAuth(); // Refresh context
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    // Derived display values
    const name = isOwnProfile ? (formData.username || currentUser?.username || "Member") : (routeUsername || "Member");
    const avatarUrl = isOwnProfile ? currentUser?.avatar : null;

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
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden border-2 border-accent/10">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-12 h-12 text-accent" />
                                )}
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                >
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const formData = new FormData();
                                        formData.append('avatar', file);
                                        setIsLoading(true);
                                        try {
                                            await userService.updateProfile(formData);
                                            await checkAuth();
                                            setMessage({ type: 'success', text: 'Profile picture updated' });
                                        } catch (err: any) {
                                            setMessage({ type: 'error', text: 'Upload failed' });
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Display Name</label>
                                <Input
                                    value={isOwnProfile ? formData.username : name}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    readOnly={!isOwnProfile}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-[#9aa0a6]" />
                                    <Input
                                        type="email"
                                        value={isOwnProfile ? formData.email : "hidden@example.com"}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                        value={isOwnProfile ? formData.facebook_profile : (currentUser?.facebook_profile || "")}
                                        onChange={(e) => setFormData({ ...formData, facebook_profile: e.target.value })}
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
                                        value={isOwnProfile ? formData.phone : (currentUser?.phone || "")}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                            value={isOwnProfile ? formData.bio : (currentUser?.bio || "")}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            readOnly={!isOwnProfile}
                            placeholder="Tell us about yourself..."
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

            {message && (
                <div className={`p-4 rounded-none border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'} text-xs font-black uppercase tracking-widest text-center`}>
                    {message.text}
                </div>
            )}

            {isOwnProfile && (
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => window.location.reload()}>Cancel</Button>
                    <Button disabled={isLoading} onClick={handleSave}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    );
}
