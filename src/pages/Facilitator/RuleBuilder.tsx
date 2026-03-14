import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { ArrowLeft, ArrowRight, Check, Loader2, Building2 } from "lucide-react";
import { useCommunities } from "../../hooks/useCommunities"; // Use existing hook
import api from "../../services/api";

// Step 1: Problem categories
const problemCategories = [
    "Harassment & abuse",
    "Spam & promotions",
    "Off-topic posts",
    "Payments & monetization",
    "Member behavior",
    "Content quality"
];

// Step 2: Triggers
const triggers = {
    "Harassment & abuse": ["A message is reported", "A member is blocked", "Offensive language detected"],
    "Spam & promotions": ["A link is shared", "Repeated messages", "External promotion"],
    "Off-topic posts": ["Post flagged as off-topic", "Wrong board/category"],
    "Payments & monetization": ["Payment requested", "Selling products"],
    "Member behavior": ["New member posts", "Member violates rule again"],
    "Content quality": ["Low-quality content", "Duplicate post"]
};

// Step 4: Consequences
const consequences = [
    "Warn user",
    "Temporarily mute (choose duration)",
    "Remove content",
    "Require review",
    "Trigger vote",
    "Escalate to moderator"
];

export function RuleBuilder() {
    const navigate = useNavigate();
    const { id: _editId } = useParams(); // For edit mode if needed (prefixed with _ to ignore lint)
    const { communities, loading: loadingCommunities } = useCommunities(true); // Fetch managed communities

    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Rule Data State
    const [ruleData, setRuleData] = useState({
        communityId: "",
        category: "",
        trigger: "",
        reportCount: 3,
        timeWindow: "24 hours",
        memberAge: "any",
        consequence: "",
        muteDuration: "48 hours"
    });

    // Auto-select community if only one
    useEffect(() => {
        if (communities.length === 1 && !ruleData.communityId) {
            setRuleData(prev => ({ ...prev, communityId: communities[0].id }));
        }
    }, [communities]);

    const handleNext = () => {
        if (step < 5) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!ruleData.communityId) {
            alert("Please select a community for this rule.");
            return;
        }

        setSubmitting(true);
        try {
            // Map frontend consequence to backend enforcement
            const enforcementType = ruleData.consequence.includes("mute") ? "MUTE" :
                ruleData.consequence.includes("Remove") ? "BLOCK" : "WARN";

            // Map category to backend action
            const actionMap: Record<string, string> = {
                "Harassment & abuse": "RESPOND",
                "Spam & promotions": "CREATE_DISCUSSION",
                "Off-topic posts": "CREATE_DISCUSSION",
                "Content quality": "CREATE_DISCUSSION",
                "Member behavior": "RESPOND",
                "Payments & monetization": "CREATE_DISCUSSION"
            };

            const payload = {
                code: `RULE-${Date.now() % 100000}-${Math.floor(Math.random() * 1000)}`,
                description: `${ruleData.category}: ${ruleData.trigger}`,
                scope_type: 'COMMUNITY',
                scope_id: ruleData.communityId,
                action: actionMap[ruleData.category] || 'CREATE_DISCUSSION',
                role: 'MEMBER',
                conditions: {
                    trigger: ruleData.trigger,
                    max_reports: ruleData.reportCount,
                    window: ruleData.timeWindow,
                    member_age: ruleData.memberAge
                },
                enforcement: {
                    type: enforcementType,
                    message: `Action blocked due to ${ruleData.category} rules.`,
                    duration: enforcementType === "MUTE" ? ruleData.muteDuration : null
                },
                active: true
            };

            await api.post('/rules/', payload);
            navigate("/facilitator/rules");
        } catch (error: any) {
            console.error("Failed to create rule:", error);
            alert("Failed to create rule. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // If loading communities
    if (loadingCommunities) {
        return (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-[#9aa0a6]">
                <Loader2 className="w-8 h-8 animate-spin text-[#4f8cff]" />
                <p className="text-[10px] uppercase font-black tracking-widest italic">Loading Community Context...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/facilitator/rules")} className="pl-0 text-[#9aa0a6] hover:text-[#e6e6e6]">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel Rule Creation
                </Button>
                <div className="text-xs uppercase font-black tracking-widest text-[#4f8cff]">Step {step} of 5</div>
            </div>

            <Card className="bg-[#161a20] border-[#2a2f3a] rounded-none shadow-2xl">
                <CardHeader className="border-b border-[#2a2f3a]/50 pb-6">
                    <CardTitle className="text-xl font-black text-[#e6e6e6] tracking-tight">
                        {step === 1 && "Start Rule Creation"}
                        {step === 2 && "Define Trigger"}
                        {step === 3 && "Set Conditions"}
                        {step === 4 && "Choose Action"}
                        {step === 5 && "Review & Create"}
                    </CardTitle>
                    <CardDescription className="text-[#9aa0a6] text-xs uppercase tracking-widest font-medium mt-2">
                        {step === 1 && "Select the target community and rule category"}
                        {step === 2 && "Choose the event that triggers this rule"}
                        {step === 3 && "Set thresholds for enforcement"}
                        {step === 4 && "Determine what happens when the rule is triggered"}
                        {step === 5 && "Review summary and activate rule"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-8 space-y-8 min-h-[300px]">
                    {/* Step 1: Choose Community & Category */}
                    {step === 1 && (
                        <div className="space-y-8">
                            {/* Community Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6] flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> Target Community
                                </label>
                                {communities.length === 0 ? (
                                    <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-xs">
                                        No managed communities found. Please create a community first.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {communities.map((c) => (
                                            <div
                                                key={c.id}
                                                onClick={() => setRuleData({ ...ruleData, communityId: c.id })}
                                                className={`p-4 border cursor-pointer transition-all flex items-center gap-3 ${ruleData.communityId === c.id
                                                    ? "border-[#4f8cff] bg-[#4f8cff]/10 text-[#e6e6e6]"
                                                    : "border-[#2a2f3a] bg-[#0f1115] text-[#9aa0a6] hover:border-[#4f8cff]/30"
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${ruleData.communityId === c.id ? "bg-[#4f8cff]" : "bg-[#2a2f3a]"}`} />
                                                <span className="font-bold text-sm">{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Issue Category</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {problemCategories.map((category) => (
                                        <div
                                            key={category}
                                            onClick={() => setRuleData({ ...ruleData, category })}
                                            className={`p-4 border cursor-pointer transition-all ${ruleData.category === category
                                                ? "border-[#4f8cff] bg-[#4f8cff]/10 text-[#e6e6e6]"
                                                : "border-[#2a2f3a] bg-[#0f1115] text-[#9aa0a6] hover:border-[#4f8cff]/30"
                                                }`}
                                        >
                                            <div className="font-bold text-sm">{category}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Choose Trigger */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Trigger Event</label>
                            {triggers[ruleData.category as keyof typeof triggers]?.map((trigger) => (
                                <div
                                    key={trigger}
                                    onClick={() => setRuleData({ ...ruleData, trigger })}
                                    className={`p-5 border cursor-pointer transition-all ${ruleData.trigger === trigger
                                        ? "border-[#4f8cff] bg-[#4f8cff]/10 text-[#e6e6e6]"
                                        : "border-[#2a2f3a] bg-[#0f1115] text-[#9aa0a6] hover:border-[#4f8cff]/30"
                                        }`}
                                >
                                    <span className="font-medium">{trigger}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Set Conditions */}
                    {step === 3 && (
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6] flex justify-between">
                                    <span>Report Threshold</span>
                                    <span className="text-[#4f8cff]">{ruleData.reportCount} Reports</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={ruleData.reportCount}
                                    onChange={(e) => setRuleData({ ...ruleData, reportCount: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-[#2a2f3a] rounded-lg appearance-none cursor-pointer accent-[#4f8cff]"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Time Window</label>
                                <select
                                    className="w-full p-4 bg-[#0f1115] border border-[#2a2f3a] text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]"
                                    value={ruleData.timeWindow}
                                    onChange={(e) => setRuleData({ ...ruleData, timeWindow: e.target.value })}
                                >
                                    <option>10 minutes</option>
                                    <option>1 hour</option>
                                    <option>24 hours</option>
                                    <option>7 days</option>
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Member Maturity</label>
                                <div className="flex gap-2">
                                    {["any", "new", "established"].map((age) => (
                                        <div
                                            key={age}
                                            onClick={() => setRuleData({ ...ruleData, memberAge: age })}
                                            className={`flex-1 p-3 border cursor-pointer text-center transition-all text-sm font-bold uppercase tracking-wide ${ruleData.memberAge === age
                                                ? "border-[#4f8cff] bg-[#4f8cff]/10 text-[#e6e6e6]"
                                                : "border-[#2a2f3a] bg-[#0f1115] text-[#9aa0a6] hover:border-[#4f8cff]/30"
                                                }`}
                                        >
                                            {age}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Choose Consequence */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {consequences.map((consequence) => (
                                    <div
                                        key={consequence}
                                        onClick={() => setRuleData({ ...ruleData, consequence })}
                                        className={`p-4 border cursor-pointer transition-all ${ruleData.consequence === consequence
                                            ? "border-orange-500 bg-orange-500/10 text-orange-500"
                                            : "border-[#2a2f3a] bg-[#0f1115] text-[#9aa0a6] hover:border-orange-500/30"
                                            }`}
                                    >
                                        <div className="font-bold text-sm">{consequence}</div>
                                    </div>
                                ))}
                            </div>

                            {ruleData.consequence === "Temporarily mute (choose duration)" && (
                                <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#9aa0a6]">Mute Duration</label>
                                    <select
                                        className="w-full p-4 bg-[#0f1115] border border-[#2a2f3a] text-sm text-[#e6e6e6] focus:outline-none focus:border-[#4f8cff]"
                                        value={ruleData.muteDuration}
                                        onChange={(e) => setRuleData({ ...ruleData, muteDuration: e.target.value })}
                                    >
                                        <option>1 hour</option>
                                        <option>24 hours</option>
                                        <option>48 hours</option>
                                        <option>7 days</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 5: Review */}
                    {step === 5 && (
                        <div className="p-8 bg-[#1a1e26] border border-[#2a2f3a] space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#4f8cff]/10 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-5 h-5 text-[#4f8cff]" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <h4 className="font-black text-[#e6e6e6] uppercase tracking-wide text-sm">Rule Summary</h4>
                                    <p className="text-lg leading-relaxed text-[#9aa0a6] font-light">
                                        If <span className="text-[#e6e6e6] font-bold border-b border-[#4f8cff]/50">{ruleData.reportCount} {ruleData.memberAge !== "any" ? ruleData.memberAge : "active"} members</span> report{" "}
                                        a <span className="text-[#e6e6e6] font-bold border-b border-[#4f8cff]/50">"{ruleData.trigger}"</span> event within{" "}
                                        <span className="text-[#e6e6e6] font-bold border-b border-[#4f8cff]/50">{ruleData.timeWindow}</span>, the system will automatically{" "}
                                        <span className="text-orange-500 font-bold border-b border-orange-500/50">{ruleData.consequence.toUpperCase()}</span>
                                        {ruleData.consequence === "Temporarily mute (choose duration)" && ` for ${ruleData.muteDuration}`}.
                                    </p>
                                    <div className="pt-4 border-t border-[#2a2f3a] flex gap-8">
                                        <div>
                                            <p className="text-[9px] uppercase font-black text-[#9aa0a6] tracking-widest">Target Community</p>
                                            <p className="text-sm font-bold text-[#e6e6e6] mt-1">{communities.find(c => c.id === ruleData.communityId)?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase font-black text-[#9aa0a6] tracking-widest">Category</p>
                                            <p className="text-sm font-bold text-[#e6e6e6] mt-1">{ruleData.category}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between border-t border-[#2a2f3a]/50 p-6 bg-[#161a20]">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || submitting}
                        className="text-[#9aa0a6] hover:text-[#e6e6e6] uppercase text-[10px] tracking-widest font-bold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {step < 5 ? (
                        <Button
                            onClick={handleNext}
                            className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-none"
                            disabled={
                                (step === 1 && (!ruleData.category || !ruleData.communityId)) ||
                                (step === 2 && !ruleData.trigger) ||
                                (step === 4 && !ruleData.consequence)
                            }
                        >
                            Next Step
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-[#4f8cff] hover:bg-[#4f8cff]/90 text-white font-black uppercase tracking-widest text-[10px] h-10 px-8 rounded-none shadow-lg shadow-[#4f8cff]/20"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Rule...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Create Rule
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
