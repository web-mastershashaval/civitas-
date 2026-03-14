import { useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import api from "../../services/api";

export function GovernanceOrientation() {
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role") || "member";
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [consent1, setConsent1] = useState(false);
    const [consent2, setConsent2] = useState(false);
    // const { signIn } = useAuth(); // No longer needed
    const location = useLocation();

    const isFacilitator = role === "facilitator";

    const handleContinue = async () => {
        if (consent1 && consent2) {
            setIsLoading(true);
            setError(null);
            try {
                const signupData = location.state;
                const token = localStorage.getItem('civitas_token');

                if (token) {
                    // Scenario A: Existing user completing orientation
                    await api.post("/users/complete_orientation/");
                    const role = localStorage.getItem('civitas_role')?.toLowerCase() || 'member';
                    navigate(role === 'facilitator' ? '/facilitator/home' : '/member/home');
                } else if (signupData) {
                    // Scenario B: New user registering (current flow)
                    await api.post("/users/register/", {
                        username: signupData.username,
                        email: signupData.email,
                        password: signupData.password,
                        role: signupData.role.toUpperCase() === 'FACILITATOR' ? 'FACILITATOR' : 'MEMBER'
                    });

                    navigate("/auth/signin", {
                        state: { message: "Access granted. Please verify your identity to enter." }
                    });
                } else {
                    throw new Error("Session invalid. Please login again.");
                }
            } catch (err: any) {
                console.error("Signup failed:", err);

                // Extract error message from DRF response
                let errorMessage = "Registration failed. Identity could not be established.";

                if (err.response?.data) {
                    // DRF field validation errors come as {field: [error1, error2]}
                    const data = err.response.data;
                    if (data.username) {
                        errorMessage = Array.isArray(data.username) ? data.username[0] : data.username;
                    } else if (data.email) {
                        errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
                    } else if (data.detail) {
                        errorMessage = data.detail;
                    } else if (typeof data === 'string') {
                        errorMessage = data;
                    } else {
                        // Get first error from any field
                        const firstField = Object.keys(data)[0];
                        if (firstField) {
                            const fieldError = data[firstField];
                            errorMessage = Array.isArray(fieldError) ? fieldError[0] : fieldError;
                        }
                    }
                } else if (err.message) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDecline = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#0f1115] text-[#e6e6e6] p-8 font-sans">
            <div className="max-w-[800px] mx-auto space-y-8">
                {/* HEADER */}
                <header>
                    <h1 className="text-3xl font-bold mb-2">Charter Agreement</h1>
                    <p className="text-[#9aa0a6]">
                        You are about to enter a governed digital community as a <span className="text-[#4f8cff] font-semibold capitalize">{role}</span>.
                    </p>
                </header>

                {/* WARNING */}
                <section className="border border-[#ff5c5c] bg-[#ff5c5c]/10 p-5 rounded-sm">
                    <strong className="text-[#ff5c5c] block mb-1 font-bold">Important:</strong>
                    <p className="text-sm">
                        Civitas communities are governed spaces.
                        Rules are enforced by the system and facilitators.
                        Violations have consequences.
                    </p>
                </section>

                {/* ERROR DISPLAY */}
                {error && (
                    <section className="border border-[#ff5c5c] bg-[#ff5c5c]/10 p-5 rounded-sm">
                        <strong className="text-[#ff5c5c] block mb-1 font-bold">Registration Error:</strong>
                        <p className="text-sm text-[#ff5c5c]">{error}</p>
                    </section>
                )}

                {/* CHARTER CONTENT */}
                <section>
                    <h2 className="text-xl font-bold mb-4">
                        {isFacilitator ? "Facilitator Charter" : "Community Charter"}
                    </h2>

                    <div className="max-h-[350px] overflow-y-auto no-scrollbar border border-[#2a2f3a] p-8 bg-[#161a20] space-y-6 text-sm leading-relaxed">
                        {isFacilitator ? (
                            <>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">1. Stewardship of Rules</h3>
                                    <p className="text-[#9aa0a6]">
                                        As a Facilitator, your primary duty is the fair and consistent application of the rules you define. You are a steward of the community charter, not its master.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">2. No Invisible Action</h3>
                                    <p className="text-[#9aa0a6]">
                                        All governance actions are logged and transparent. You cannot move, delete, or mute content without a recorded reason bound to a specific rule.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">3. Technical Guardrails</h3>
                                    <p className="text-[#9aa0a6]">
                                        Your authority is limited by the software. You cannot override system-level rate limits or bypass governance cooling-off periods.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">4. Accountability</h3>
                                    <p className="text-[#9aa0a6]">
                                        If rules are changed, all members must be notified and given the choice to re-consent or depart. Retrospective enforcement is prohibited.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">5. Delegation</h3>
                                    <p className="text-[#9aa0a6]">
                                        Co-facilitators act under your authority. You are responsible for their actions and for ensuring they adhere to the same transparency standards.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">1. Authority</h3>
                                    <p className="text-[#9aa0a6]">
                                        This community is governed by a facilitator and designated co-facilitators. Their authority is derived from the charter you are agreeing to.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">2. Rules Are Binding</h3>
                                    <p className="text-[#9aa0a6]">
                                        All members are required to comply with the rules defined herein. Ignorance of the rules is not a defense for violations.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">3. Enforcement</h3>
                                    <p className="text-[#9aa0a6]">
                                        Violations may result in warnings, temporary restrictions, suspension of posting rights, or permanent removal. All actions are transparently logged.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">4. Appeals</h3>
                                    <p className="text-[#9aa0a6]">
                                        If you believe an enforcement action was in error, you may submit an appeal. Facilitator decisions on appeals are final within the community scope.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#e6e6e6] text-base mb-2">5. Conduct</h3>
                                    <p className="text-[#9aa0a6]">
                                        Participation is intentional and structured. Intentional disruption, harassment, or attempts to evade rule logic will trigger immediate enforcement.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* CONSENT */}
                <section className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-[#2a2f3a] bg-transparent text-[#4f8cff] focus:ring-0"
                            checked={consent1}
                            onChange={(e) => setConsent1(e.target.checked)}
                        />
                        <span className="text-[#9aa0a6] text-sm group-hover:text-[#e6e6e6] transition-colors">
                            I have read and understood the {isFacilitator ? "Facilitator Charter" : "Community Charter"} and agree to be governed by it.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 rounded border-[#2a2f3a] bg-transparent text-[#4f8cff] focus:ring-0"
                            checked={consent2}
                            onChange={(e) => setConsent2(e.target.checked)}
                        />
                        <span className="text-[#9aa0a6] text-sm group-hover:text-[#e6e6e6] transition-colors">
                            I understand that violations may result in enforcement actions {isFacilitator && "and accountability logs"}.
                        </span>
                    </label>
                </section>

                {/* ACTIONS */}
                <section className="flex justify-between items-center pt-4 border-t border-[#2a2f3a]">
                    <Button
                        variant="ghost"
                        className="text-[#9aa0a6] hover:text-[#e6e6e6] border border-[#2a2f3a] bg-transparent hover:bg-[#161a20] h-11 px-6"
                        onClick={handleDecline}
                    >
                        Decline & Exit
                    </Button>
                    <Button
                        className={`h-11 px-8 font-semibold transition-all ${consent1 && consent2 ? "bg-[#4f8cff] text-white opacity-100" : "bg-[#4f8cff] text-white opacity-40 cursor-not-allowed"
                            }`}
                        disabled={!consent1 || !consent2 || isLoading}
                        onClick={handleContinue}
                    >
                        {isLoading ? "Establishing Identity..." : "Accept & Continue"}
                    </Button>
                </section>
            </div>
        </div>
    );
}
