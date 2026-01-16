import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

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
    const [step, setStep] = useState(1);
    const [ruleData, setRuleData] = useState({
        category: "",
        trigger: "",
        reportCount: 3,
        timeWindow: "24 hours",
        memberAge: "any",
        consequence: "",
        muteDuration: "48 hours"
    });

    const handleNext = () => {
        if (step < 5) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        console.log("Rule created:", ruleData);
        navigate("/facilitator/rules");
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate("/facilitator/rules")} className="pl-0">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
                <div className="text-sm text-primary/60">Step {step} of 5</div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "What do you want to control?"}
                        {step === 2 && "When does this happen?"}
                        {step === 3 && "Set conditions"}
                        {step === 4 && "Choose consequence"}
                        {step === 5 && "Review your rule"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Choose the type of behavior you want to manage"}
                        {step === 2 && "Define when this rule should trigger"}
                        {step === 3 && "Fine-tune when this rule applies"}
                        {step === 4 && "What should happen when this rule triggers?"}
                        {step === 5 && "Make sure everything looks correct"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Step 1: Choose Category */}
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-3">
                            {problemCategories.map((category) => (
                                <div
                                    key={category}
                                    onClick={() => setRuleData({ ...ruleData, category })}
                                    className={`p-4 rounded-md border-2 cursor-pointer transition-all ${ruleData.category === category
                                            ? "border-accent bg-accent/10"
                                            : "border-border hover:bg-surface"
                                        }`}
                                >
                                    <div className="font-semibold">{category}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Choose Trigger */}
                    {step === 2 && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium">When this happens...</label>
                            {triggers[ruleData.category as keyof typeof triggers]?.map((trigger) => (
                                <div
                                    key={trigger}
                                    onClick={() => setRuleData({ ...ruleData, trigger })}
                                    className={`p-4 rounded-md border cursor-pointer transition-all ${ruleData.trigger === trigger
                                            ? "border-accent bg-accent/10"
                                            : "border-border hover:bg-surface"
                                        }`}
                                >
                                    {trigger}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 3: Set Conditions */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Number of reports</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={ruleData.reportCount}
                                    onChange={(e) => setRuleData({ ...ruleData, reportCount: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="text-sm text-primary/60">{ruleData.reportCount} reports</div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Time window</label>
                                <select
                                    className="w-full p-2 rounded-md border border-border bg-background"
                                    value={ruleData.timeWindow}
                                    onChange={(e) => setRuleData({ ...ruleData, timeWindow: e.target.value })}
                                >
                                    <option>10 minutes</option>
                                    <option>1 hour</option>
                                    <option>24 hours</option>
                                    <option>7 days</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Member age</label>
                                <div className="flex gap-2">
                                    {["any", "new", "established"].map((age) => (
                                        <div
                                            key={age}
                                            onClick={() => setRuleData({ ...ruleData, memberAge: age })}
                                            className={`flex-1 p-3 rounded-md border cursor-pointer text-center transition-all ${ruleData.memberAge === age
                                                    ? "border-accent bg-accent/10"
                                                    : "border-border hover:bg-surface"
                                                }`}
                                        >
                                            {age.charAt(0).toUpperCase() + age.slice(1)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Choose Consequence */}
                    {step === 4 && (
                        <div className="space-y-3">
                            {consequences.map((consequence) => (
                                <div
                                    key={consequence}
                                    onClick={() => setRuleData({ ...ruleData, consequence })}
                                    className={`p-4 rounded-md border cursor-pointer transition-all ${ruleData.consequence === consequence
                                            ? "border-accent bg-accent/10"
                                            : "border-border hover:bg-surface"
                                        }`}
                                >
                                    {consequence}
                                </div>
                            ))}

                            {ruleData.consequence === "Temporarily mute (choose duration)" && (
                                <div className="mt-4 space-y-2">
                                    <label className="text-sm font-medium">Mute duration</label>
                                    <select
                                        className="w-full p-2 rounded-md border border-border bg-background"
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
                        <div className="p-6 bg-accent/5 border border-accent/20 rounded-md space-y-4">
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-accent mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-accent mb-2">Your rule in plain language:</h4>
                                    <p className="text-lg leading-relaxed">
                                        If <span className="font-semibold">{ruleData.reportCount} {ruleData.memberAge !== "any" ? ruleData.memberAge : ""} members</span> report{" "}
                                        <span className="font-semibold">"{ruleData.trigger.toLowerCase()}"</span> within{" "}
                                        <span className="font-semibold">{ruleData.timeWindow}</span>, the system will{" "}
                                        <span className="font-semibold">{ruleData.consequence.toLowerCase()}</span>
                                        {ruleData.consequence === "Temporarily mute (choose duration)" && ` for ${ruleData.muteDuration}`}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {step < 5 ? (
                        <Button onClick={handleNext} disabled={
                            (step === 1 && !ruleData.category) ||
                            (step === 2 && !ruleData.trigger) ||
                            (step === 4 && !ruleData.consequence)
                        }>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit}>
                            <Check className="w-4 h-4 mr-2" />
                            Create Rule
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
