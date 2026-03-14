import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNudge } from "../../components/features/NudgeProvider";

export function SignIn() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();
    const { addNudge } = useNudge();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get('expired') === 'true') {
            setError("Your session has expired. Please sign in again to verify your identity.");
            // Clear URL param without refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear state so message doesn't persist on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const user = await signIn(username, password);
            addNudge(`Identity Verified. Welcome back, ${user.username}.`, "info");

            // Navigate based on role
            if (user.role === 'FACILITATOR' || user.role === 'CO_FACILITATOR') {
                navigate("/facilitator/home");
            } else {
                navigate("/member/home");
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Invalid credentials. Identity could not be verified.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f1115] p-4 text-[#e6e6e6] relative">
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-[#9aa0a6] hover:text-[#4f8cff] transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </Link>

            <Card className="w-full max-w-md bg-[#161a20] border-[#2a2f3a] rounded-none shadow-2xl">
                <CardHeader className="border-b border-[#2a2f3a]/50 mb-6">
                    <CardTitle className="text-2xl font-bold tracking-tight">Sign in to Civitas</CardTitle>
                    <CardDescription className="text-[#9aa0a6] text-[10px] uppercase font-black tracking-widest mt-2">
                        Member Sign In
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 pt-8 pb-4">
                        {successMessage && (
                            <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                {successMessage}
                            </div>
                        )}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-widest italic text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">
                                Username or Email
                            </label>
                            <Input
                                id="username"
                                type="text"
                                className="bg-[#0f1115] border-[#2a2f3a] focus:border-[#4f8cff] transition-all rounded-none"
                                placeholder="Username or Email"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6]">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                className="bg-[#0f1115] border-[#2a2f3a] focus:border-[#4f8cff] transition-all rounded-none"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-6 mt-4">
                        <Button type="submit" className="w-full bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black uppercase tracking-[0.2em] text-xs h-12 rounded-none" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                        </Button>
                        <div className="text-[9px] text-center text-[#9aa0a6] uppercase font-bold tracking-[0.2em]">
                            New User?{" "}
                            <Link to="/auth/signup" className="text-[#4f8cff] hover:underline">
                                Request Access
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
