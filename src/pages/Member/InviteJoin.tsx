import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Loader2, CheckCircle, XCircle, Link as LinkIcon, UserPlus, Shield } from "lucide-react";
import { inviteService } from "../../services/api";
import { useToast } from "../../components/ui/Toast";

export function InviteJoin() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"checking" | "onboarding" | "joining" | "success" | "error">("checking");
    const [message, setMessage] = useState("");
    const [community, setCommunity] = useState<any>(null);
    
    // Form state
    const [age, setAge] = useState("");
    const [intent, setIntent] = useState("SOCIAL");
    const { showToast } = useToast();

    useEffect(() => {
        if (!code) {
            setStatus("error");
            setMessage("No invite code provided.");
            return;
        }

        inviteService.checkInvite(code)
            .then((res: any) => {
                setCommunity(res.data);
                setStatus("onboarding");
            })
            .catch((err: any) => {
                setStatus("error");
                setMessage(err.response?.data?.detail || "Invalid or expired invite code.");
            });
    }, [code]);

    const handleJoin = async () => {
        if (!age) {
            showToast("Age is required to join.", "warning");
            return;
        }
        
        setStatus("joining");
        try {
            const res = await inviteService.joinViaInvite(code!, parseInt(age), intent);
            setStatus("success");
            setMessage(`Welcome to ${res.data.community_name}!`);
        } catch (err: any) {
            setStatus("error");
            setMessage(err.response?.data?.detail || "Failed to join community.");
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-8 animate-in fade-in duration-700">
            <Card className="max-w-md w-full bg-[#161a20] border-[#2a2f3a] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#4f8cff]" />
                
                <CardHeader className="border-b border-[#2a2f3a] text-center pt-10">
                    <div className="w-16 h-16 mx-auto mb-6 bg-[#4f8cff]/10 border border-[#4f8cff]/20 rounded-none rotate-45 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                        <LinkIcon className="w-8 h-8 text-[#4f8cff] -rotate-45" />
                    </div>
                    <CardTitle className="text-3xl font-black text-[#e6e6e6] tracking-tighter">
                        {status === "success" ? "Access Granted" : "Secure Invite"}
                    </CardTitle>
                    <CardDescription className="text-[10px] uppercase font-black tracking-[0.3em] text-[#9aa0a6] mt-2">
                        {community?.community_name || "Community Portal"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-10 space-y-8">
                    {status === "checking" && (
                        <div className="flex flex-col items-center gap-6 py-10">
                            <Loader2 className="w-12 h-12 animate-spin text-[#4f8cff]" />
                            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-[#9aa0a6] animate-pulse">
                                Validating Credentials...
                            </p>
                        </div>
                    )}

                    {status === "onboarding" && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6] flex items-center gap-2">
                                    <UserPlus className="w-3 h-3 text-[#4f8cff]" /> Your Onboarding Profile
                                </label>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase font-bold text-[#9aa0a6]/70">Age</label>
                                        <Input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="21"
                                            className="bg-black/20 border-[#2a2f3a] h-12 rounded-none focus:border-[#4f8cff]/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase font-bold text-[#9aa0a6]/70">Sector/Intent</label>
                                        <select 
                                            className="flex h-12 w-full border border-[#2a2f3a] bg-black/20 px-3 py-2 text-[10px] uppercase font-black tracking-widest text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]/50"
                                            value={intent}
                                            onChange={(e) => setIntent(e.target.value)}
                                        >
                                            <option value="SOCIAL">Social</option>
                                            <option value="EDUCATIVE">Educative</option>
                                            <option value="MEDICAL">Medical</option>
                                            <option value="TECH">Technical</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-[#4f8cff]/5 border border-[#4f8cff]/20 flex items-start gap-4">
                                <Shield className="w-5 h-5 text-[#4f8cff] shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-[#e6e6e6] uppercase tracking-widest">Governance Orientation</p>
                                    <p className="text-[9px] text-[#9aa0a6] leading-relaxed italic">
                                        By joining, you agree to abide by the platform's constitutional rules and the specific policies of {community?.community_name}.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleJoin}
                                className="w-full bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black uppercase tracking-[0.2em] text-[11px] h-14 rounded-none shadow-xl shadow-[#4f8cff]/10"
                            >
                                Confirm and Join
                            </Button>
                        </div>
                    )}

                    {status === "joining" && (
                        <div className="flex flex-col items-center gap-6 py-10">
                            <Loader2 className="w-12 h-12 animate-spin text-[#4f8cff]" />
                            <p className="text-[10px] uppercase font-black tracking-[0.4em] text-[#9aa0a6]">
                                Finalizing Membership...
                            </p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="flex flex-col items-center gap-6 py-4 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 flex items-center justify-center rotate-45">
                                <CheckCircle className="w-10 h-10 text-green-500 -rotate-45" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-xl font-black text-[#e6e6e6] tracking-tight">{message}</p>
                                <p className="text-[10px] text-[#9aa0a6] uppercase font-medium tracking-widest underline decoration-[#4f8cff]/30 underline-offset-4">Identity Verified & Membership Active</p>
                            </div>
                            <Button
                                onClick={() => navigate(`/member/home`)}
                                className="w-full bg-[#e6e6e6] hover:bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] h-14 rounded-none mt-4 transition-all"
                            >
                                Enter Dashboard
                            </Button>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="flex flex-col items-center gap-6 py-4 animate-in slide-in-from-top-4 duration-500">
                            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 flex items-center justify-center rotate-45">
                                <XCircle className="w-10 h-10 text-red-500 -rotate-45" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-lg font-black text-red-400 tracking-tight">Access Denied</p>
                                <p className="text-[10px] text-red-500/60 uppercase font-black tracking-widest">{message}</p>
                            </div>
                            <Button
                                onClick={() => navigate("/member/home")}
                                variant="outline"
                                className="w-full border-[#2a2f3a] text-[#9aa0a6] hover:text-[#e6e6e6] hover:bg-[#2a2f3a]/20 font-black uppercase tracking-[0.2em] text-[11px] h-14 rounded-none mt-4"
                            >
                                Return to Safety
                            </Button>
                        </div>
                    )}
                </CardContent>
                
                <CardFooter className="bg-black/20 border-t border-[#2a2f3a]/50 flex justify-center py-4">
                    <p className="text-[8px] uppercase tracking-[0.4em] font-black text-[#4f8cff]/40">Civitas Secure Protocol v2.0</p>
                </CardFooter>
            </Card>
        </div>
    );
}
