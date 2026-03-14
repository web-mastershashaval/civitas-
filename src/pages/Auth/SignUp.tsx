import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { ArrowLeft } from "lucide-react";

export function SignUp() {
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role") || "member";
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Pass data to confirmation step via location state
        navigate("/auth/role-confirmation?role=" + role, {
            state: { username, email, password, role }
        });
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
                    <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
                    <CardDescription className="text-[#9aa0a6] text-[10px] uppercase font-black tracking-widest mt-2">
                        Signing up as a <span className="text-[#4f8cff]">{role}</span>
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium leading-none">
                                Auth ID (Username)
                            </label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="e.g. jdoe_member"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full">
                            Continue
                        </Button>
                        <div className="text-sm text-center text-primary/60">
                            Already have an account?{" "}
                            <Link to="/auth/signin" className="text-accent hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
