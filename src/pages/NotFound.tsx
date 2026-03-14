import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ShieldAlert } from "lucide-react";

export function NotFound() {
    return (
        <div className="min-h-screen bg-[#0f1115] text-[#e6e6e6] flex flex-col items-center justify-center p-8 font-sans">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-6 bg-[#ff5c5c]/10 rounded-full border border-[#ff5c5c]/20 text-[#ff5c5c]">
                        <ShieldAlert className="w-16 h-16" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-black tracking-tighter">404</h1>
                    <h2 className="text-2xl font-bold">Unauthorized Territory</h2>
                    <p className="text-[#9aa0a6]">
                        The page you are looking for does not exist or has been removed from the platform charter.
                    </p>
                </div>

                <div className="pt-4">
                    <Link to="/">
                        <Button className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white h-12 px-8 w-full sm:w-auto">
                            Return to Landing Page
                        </Button>
                    </Link>
                </div>
            </div>

            <footer className="absolute bottom-8 text-[#9aa0a6] text-xs uppercase tracking-widest">
                Civitas v1.0
            </footer>
        </div>
    );
}
