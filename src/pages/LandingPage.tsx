import { Button } from "../components/ui/Button";
import { Link } from "react-router-dom";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0f1115] text-[#e6e6e6] font-sans">
            {/* NAVBAR */}
            <header className="flex justify-between items-center px-8 py-5 border-b border-[#2a2f3a]">
                <div className="font-bold tracking-[2px]">CIVITAS</div>
                <nav className="flex gap-6 text-[#9aa0a6] text-sm">
                    <a href="#principles" className="hover:text-[#e6e6e6] transition-colors">Principles</a>
                    <a href="#how" className="hover:text-[#e6e6e6] transition-colors">How It Works</a>
                    <a href="#roles" className="hover:text-[#e6e6e6] transition-colors">Roles</a>
                    <Link to="/auth/signin" className="hover:text-[#e6e6e6] transition-colors">Enter</Link>
                </nav>
            </header>

            {/* HERO */}
            <section className="py-20 px-8 max-w-[900px] mx-auto text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                        Governed communities,
                        <br />
                        <span className="text-[#9aa0a6]">not social feeds.</span>
                    </h1>
                    <p className="text-[#9aa0a6] text-lg md:text-xl max-w-2xl mx-auto">
                        Civitas is a platform for serious, rule-governed communities.
                        No algorithms, no virality, just purpose and accountability.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/auth/signup?role=facilitator">
                        <Button className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white h-12 px-8">
                            Create a Community
                        </Button>
                    </Link>
                    <Link to="/auth/signup?role=member">
                        <Button variant="outline" className="border-[#2a2f3a] text-[#e6e6e6] hover:bg-[#161a20] h-12 px-8">
                            Join as a Member
                        </Button>
                    </Link>
                </div>
            </section>

            {/* PRINCIPLES */}
            <section id="principles" class="py-16 px-8 max-w-[1000px] mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-center">Core Principles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Rules Are Law", text: "No bending, no exceptions, no hidden moderation." },
                        { title: "Governance Is Built-In", text: "Rules, enforcement, and appeals are part of the software." },
                        { title: "Communities Are Sovereign", text: "Each community defines its own charter and structure." },
                        { title: "No Algorithmic Manipulation", text: "No engagement farming. No feed manipulation." }
                    ].map((item, i) => (
                        <div key={i} className="p-6 border border-[#2a2f3a] rounded-lg bg-transparent">
                            <h3 className="font-bold mb-2">{item.title}</h3>
                            <p className="text-[#9aa0a6] text-sm leading-relaxed">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="bg-[#161a20] py-16 px-8">
                <div className="max-w-[700px] mx-auto">
                    <h2 className="text-3xl font-bold mb-10 text-center">How Civitas Works</h2>
                    <ol className="space-y-8">
                        {[
                            { title: "Facilitator Creates a Charter", text: "Rules, roles, enforcement logic, and membership type are defined upfront." },
                            { title: "Members Apply or Join", text: "Members must explicitly accept the community charter." },
                            { title: "Participation Is Structured", text: "Boards, discussions, and actions are rule-bound." },
                            { title: "Violations Are Enforced", text: "Warnings, restrictions, or removal — transparently logged." }
                        ].map((step, i) => (
                            <li key={i} className="flex gap-4">
                                <span className="font-bold text-[#4f8cff]">{i + 1}.</span>
                                <div>
                                    <strong className="block text-lg mb-1">{step.title}</strong>
                                    <p className="text-[#9aa0a6]">{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ROLES */}
            <section id="roles" className="py-16 px-8 max-w-[1000px] mx-auto">
                <h2 className="text-3xl font-bold mb-10 text-center">Roles in Civitas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: "Facilitator", text: "Defines rules, assigns roles, oversees governance." },
                        { title: "Co-Facilitator", text: "Delegated authority for moderation and enforcement." },
                        { title: "Member", text: "Participates within the boundaries of the charter." }
                    ].map((role, i) => (
                        <div key={i} className="p-6 border border-[#2a2f3a] rounded-lg">
                            <h3 className="font-bold mb-2 text-lg">{role.title}</h3>
                            <p className="text-[#9aa0a6] text-sm leading-relaxed">{role.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* JOIN */}
            <section id="join" className="bg-[#161a20] py-20 px-8 text-center border-t border-[#2a2f3a]">
                <div className="max-w-[600px] mx-auto space-y-8">
                    <h2 className="text-3xl font-bold mb-4">Before You Enter</h2>
                    <p className="text-[#9aa0a6] text-lg">
                        Civitas is not social media.
                        <br />
                        You will be expected to read rules, follow them, and accept consequences.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Link to="/auth/signup?role=member">
                            <Button className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white h-12 px-8">
                                Proceed to Onboarding
                            </Button>
                        </Link>
                        <Button variant="outline" className="border-[#2a2f3a] text-[#e6e6e6] hover:bg-[#161a20] h-12 px-8">
                            Read Platform Charter
                        </Button>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-10 text-center border-t border-[#2a2f3a] text-[#9aa0a6] text-sm">
                <p>© 2026 Civitas. Governance by design.</p>
            </footer>
        </div>
    );
}
