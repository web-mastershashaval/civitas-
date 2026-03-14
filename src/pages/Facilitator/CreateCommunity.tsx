import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, ArrowRight, Check, Loader2, Camera, Globe } from "lucide-react";
import { useRef } from "react";
import api from "../../services/api";

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
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>("");
    const [bannerPreview, setBannerPreview] = useState<string>("");

    const iconInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.purpose);
            data.append('access_type', formData.access.toUpperCase());
            data.append('governance_type', formData.strictness.toUpperCase());
            if (iconFile) data.append('image', iconFile);
            if (bannerFile) data.append('banner', bannerFile);

            await api.post("/communities/", data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate("/facilitator/home");
        } catch (err) {
            console.error("Failed to create community", err);
            setIsLoading(false);
            alert("Failed to create community.");
        }
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

                            <div className="pt-4 border-t border-border space-y-6">
                                <label className="text-sm font-bold uppercase tracking-widest text-[#4f8cff] block">Visual Identity</label>

                                <div className="grid grid-cols-2 gap-8">
                                    {/* Icon */}
                                    <div className="space-y-4 text-center">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6] block">Community Icon</label>
                                        <div className="relative mx-auto w-24 h-24 bg-[#161a20] border-2 border-[#2a2f3a] flex items-center justify-center overflow-hidden group">
                                            {iconPreview ? (
                                                <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Globe className="w-10 h-10 text-[#2a2f3a]" />
                                            )}
                                            <button
                                                onClick={() => iconInputRef.current?.click()}
                                                type="button"
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Camera className="w-6 h-6 text-white" />
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={iconInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setIconFile(file);
                                                    setIconPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </div>

                                    {/* Banner */}
                                    <div className="space-y-4 text-center">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-[#9aa0a6] block">Wide Banner</label>
                                        <div className="relative w-full h-24 bg-[#161a20] border-2 border-[#2a2f3a] flex items-center justify-center overflow-hidden group">
                                            {bannerPreview ? (
                                                <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-[10px] font-black uppercase text-[#2a2f3a]">Optional Banner</div>
                                            )}
                                            <button
                                                onClick={() => bannerInputRef.current?.click()}
                                                type="button"
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Camera className="w-6 h-6 text-white" />
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            ref={bannerInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setBannerFile(file);
                                                    setBannerPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
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
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Community"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
