import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { CheckSquare } from "lucide-react";
import { communityService } from "../../services/api";
import { useToast } from "../../components/ui/Toast";

// Mock data
const communityQuestions = {
    2: [
        "Why are you interested in urban planning?",
        "Do you have any professional or academic experience in this field?",
        "Link to a relevant portfolio or profile (optional)."
    ]
};

export function CommunityApplication() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const questions = communityQuestions[Number(id) as keyof typeof communityQuestions] || ["Why do you want to join?"];

    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [agreed, setAgreed] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await communityService.joinCommunity(id!);
            showToast("Application submitted! Facilitators will review your request shortly.", "success");
            navigate("/member/home");
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Unknown error";
            showToast("Failed to submit application: " + msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Apply to Join</CardTitle>
                    <CardDescription>
                        Please answer the following questions to help us understand your interest.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        {questions.map((q, index) => (
                            <div key={index} className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {q}
                                </label>
                                <Input
                                    required
                                    value={answers[index] || ""}
                                    onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })}
                                />
                            </div>
                        ))}

                        <div className="bg-surface/50 p-4 rounded-md border border-border">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer h-5 w-5 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none checked:bg-accent checked:border-accent"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        required
                                    />
                                    <CheckSquare className="absolute h-3.5 w-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1 left-1" />
                                </div>
                                <div className="space-y-1 leading-none">
                                    <p className="font-medium">
                                        I agree to the community rules.
                                    </p>
                                    <p className="text-sm text-primary/60">
                                        I understand that my application will be reviewed by facilitators.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!agreed} isLoading={submitting}>
                            Submit Application
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
