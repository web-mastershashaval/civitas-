import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { CheckCircle2, ShieldAlert } from "lucide-react";

export function RoleConfirmation() {
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role") || "member";
    const navigate = useNavigate();

    const isFacilitator = role === "facilitator";

    const handleConfirm = () => {
        navigate("/auth/governance-orientation?role=" + role);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-lg border-accent/20">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        {isFacilitator ? (
                            <ShieldAlert className="w-8 h-8 text-accent" />
                        ) : (
                            <CheckCircle2 className="w-8 h-8 text-accent" />
                        )}
                        <CardTitle className="text-2xl">Confirm your Role</CardTitle>
                    </div>
                    <CardDescription className="text-lg">
                        You are joining as a <span className="font-bold text-primary capitalize">{role}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-surface/50 p-4 rounded-md border border-border">
                        <h4 className="font-semibold mb-2 text-primary">Responsibilities:</h4>
                        <ul className="list-disc list-inside space-y-2 text-primary/80">
                            {isFacilitator ? (
                                <>
                                    <li>Define community purpose and rules.</li>
                                    <li>Appoint moderators and manage governance.</li>
                                    <li>Accountable for community health.</li>
                                    <li>Cannot act invisibly or override system limits.</li>
                                </>
                            ) : (
                                <>
                                    <li>Participate in discussions.</li>
                                    <li>Follow community rules.</li>
                                    <li>Build reputation through contributions.</li>
                                    <li>Vote on governance issues (if enabled).</li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-md text-sm text-accent-foreground">
                        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>
                            Roles are not equal. This is explicit.
                            {isFacilitator
                                ? " You hold power, but you are bound by the rules you set."
                                : " You have rights, but you must respect the community's governance."}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                    <Button onClick={handleConfirm} size="lg" className="flex-1">
                        Confirm & Continue
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
