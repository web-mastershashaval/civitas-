import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export function CreateCommunity() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        purpose: "",
        access: "Open",
        strictness: "Medium",
        boards: ["General", "Announcements"],
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = () => {
        console.log("Creating community", formData);
        // Simulate creation
        navigate("/facilitator/home");
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:bg-transparent hover:text-accent">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
                <div className="text-sm text-primary/60">Step {step} of 3</div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && "Community Basics"}
                        {step === 2 && "Governance & Access"}
                        {step === 3 && "Initial Structure"}
                    </CardTitle>
                    <CardDescription>
                        {step === 1 && "Define the identity of your community."}
                        {step === 2 && "Set the rules of engagement."}
                        {step === 3 && "Set up the first discussion boards."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Community Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Sustainable Cities"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Purpose</label>
                                <textarea
                                    className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    rows={4}
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                    placeholder="What is this community for?"
                                />
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Access Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Open", "Application", "Invite"].map((type) => (
                                        <div
                                            key={type}
                                            className={`cursor-pointer rounded-md border p-4 text-center transition-all ${formData.access === type
                                                    ? "border-accent bg-accent/10 text-accent"
                                                    : "border-border hover:bg-surface"
                                                }`}
                                            onClick={() => setFormData({ ...formData, access: type })}
                                        >
                                            {type}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Governance Strictness</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Low", "Medium", "High"].map((level) => (
                                        <div
                                            key={level}
                                            className={`cursor-pointer rounded-md border p-4 text-center transition-all ${formData.strictness === level
                                                    ? "border-accent bg-accent/10 text-accent"
                                                    : "border-border hover:bg-surface"
                                                }`}
                                            onClick={() => setFormData({ ...formData, strictness: level })}
                                        >
                                            {level}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Default Boards</label>
                                <p className="text-sm text-primary/60">We've added some defaults. You can edit them later.</p>
                                <div className="space-y-2">
                                    {formData.boards.map((board, i) => (
                                        <div key={i} className="p-3 bg-surface rounded-md border border-border flex items-center gap-2">
                                            <Check className="w-4 h-4 text-accent" />
                                            <span>{board}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step > 1 ? (
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <Button onClick={handleNext}>
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit}>
                            Create Community
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
