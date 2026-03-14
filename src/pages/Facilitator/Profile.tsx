import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { User as UserIcon, Shield, Loader2, Camera, Save, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { userService } from "../../services/api";

export function FacilitatorProfile() {
    const { user: currentUser, checkAuth, isLoading: authLoading } = useAuth();
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
        if (currentUser) {
            setFormData({
                username: currentUser.username || "",
                email: currentUser.email || "",
                bio: currentUser.bio || "",
                phone: currentUser.phone || "",
                facebook_profile: currentUser.facebook_profile || ""
            });
        }
    }, [currentUser]);

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
            setMessage({ type: 'success', text: 'Facilitator profile updated successfully' });
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#4f8cff]" /></div>;
    if (!currentUser) return <div className="p-8 text-red-500 font-bold">Access denied.</div>;

    return (
        <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-[#e6e6e6]">Facilitator Profile</h1>
                <p className="text-[#9aa0a6] mt-2">Manage your administrative credentials and biography</p>
            </div>

            <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-2xl">
                <CardHeader className="border-b border-[#2a2f3a]/50">
                    <CardTitle className="text-[#e6e6e6] flex items-center gap-2">
                        <Shield className="w-5 h-5 text-[#4f8cff]" />
                        Administrative Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-[#0f1115] flex items-center justify-center overflow-hidden border-2 border-[#2a2f3a] group-hover:border-[#4f8cff]/50 transition-all">
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-14 h-14 text-[#9aa0a6]" />
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full border-2 border-dashed border-[#4f8cff]"
                            >
                                <Camera className="w-8 h-8 text-white" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const uploadData = new FormData();
                                        uploadData.append('avatar', file);
                                        setIsLoading(true);
                                        try {
                                            await userService.updateProfile(uploadData);
                                            await checkAuth();
                                            setMessage({ type: 'success', text: 'Avatar updated' });
                                        } catch (err: any) {
                                            setMessage({ type: 'error', text: 'Avatar upload failed' });
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }
                                }}
                            />
                        </div>

                        <div className="flex-1 w-full space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#9aa0a6]">System Username</label>
                                    <Input
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="bg-[#0f1115] border-[#2a2f3a] text-[#e6e6e6] focus:border-[#4f8cff]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#9aa0a6]">Official Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa0a6]" />
                                        <Input
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="bg-[#0f1115] border-[#2a2f3a] text-[#e6e6e6] pl-10 focus:border-[#4f8cff]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#9aa0a6]">Phone Contact</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="bg-[#0f1115] border-[#2a2f3a] text-[#e6e6e6] placeholder:text-[#2a2f3a]"
                                        placeholder="+000 0000 000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-[#9aa0a6]">Facebook Link</label>
                                    <Input
                                        value={formData.facebook_profile}
                                        onChange={(e) => setFormData({ ...formData, facebook_profile: e.target.value })}
                                        className="bg-[#0f1115] border-[#2a2f3a] text-[#e6e6e6] placeholder:text-[#2a2f3a]"
                                        placeholder="facebook.com/username"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-[#9aa0a6]">Professional Biography</label>
                        <textarea
                            className="flex w-full rounded-none border border-[#2a2f3a] bg-[#0f1115] px-4 py-3 text-sm text-[#e6e6e6] placeholder:text-[#2a2f3a] focus:outline-none focus:border-[#4f8cff] min-h-[120px]"
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Detail your experience in community facilitation..."
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none">
                <CardHeader className="border-b border-[#2a2f3a]/50">
                    <CardTitle className="flex items-center gap-2 text-[#e6e6e6]">
                        <Shield className="w-5 h-5 text-[#f0b429]" />
                        Facilitator Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-3xl font-black text-[#f0b429] tracking-tighter">02</div>
                            <div className="text-[10px] uppercase font-bold text-[#9aa0a6] tracking-widest">Communities</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-[#e6e6e6] tracking-tighter">1,242</div>
                            <div className="text-[10px] uppercase font-bold text-[#9aa0a6] tracking-widest">Verified Members</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-[#4f8cff] tracking-tighter">84</div>
                            <div className="text-[10px] uppercase font-bold text-[#9aa0a6] tracking-widest">Protocol Rulings</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {message && (
                <div className={`p-4 rounded-none border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'} text-[10px] font-black uppercase tracking-widest text-center`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-end gap-4 pb-12">
                <Button variant="outline" className="border-[#2a2f3a] text-[#9aa0a6] rounded-none uppercase text-[10px] font-black tracking-widest hover:bg-[#2a2f3a]/20" onClick={() => window.location.reload()}>
                    Discard Changes
                </Button>
                <Button
                    disabled={isLoading}
                    onClick={handleSave}
                    className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white rounded-none uppercase text-[10px] font-black tracking-widest px-8"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Protocol Changes
                </Button>
            </div>
        </div>
    );
}
