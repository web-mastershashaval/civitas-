import { createContext, useContext, useState, useCallback } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

interface PromptOptions {
    title: string;
    message: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    defaultValue?: string;
}

interface PromptContextType {
    prompt: (options: PromptOptions) => Promise<string | null>;
}

const PromptContext = createContext<PromptContextType | null>(null);

export function usePrompt() {
    const ctx = useContext(PromptContext);
    if (!ctx) throw new Error("usePrompt must be used within PromptProvider");
    return ctx;
}

export function PromptProvider({ children }: { children: React.ReactNode }) {
    const [options, setOptions] = useState<PromptOptions | null>(null);
    const [value, setValue] = useState("");
    const [resolver, setResolver] = useState<((value: string | null) => void) | null>(null);

    const prompt = useCallback((opts: PromptOptions) => {
        return new Promise<string | null>((resolve) => {
            setOptions(opts);
            setValue(opts.defaultValue || "");
            setResolver(() => resolve);
        });
    }, []);

    const handleClose = (result: string | null) => {
        resolver?.(result);
        setOptions(null);
        setResolver(null);
        setValue("");
    };

    return (
        <PromptContext.Provider value={{ prompt }}>
            {children}
            {options && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#161a20] border border-[#2a2f3a] w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4f8cff] via-[#4f8cff]/50 to-[#4f8cff]" />

                        <button
                            onClick={() => handleClose(null)}
                            className="absolute top-4 right-4 text-[#9aa0a6] hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-3">
                                <HelpCircle className="w-5 h-5 text-[#4f8cff]" />
                                <h2 className="text-base font-black tracking-tight text-[#e6e6e6]">{options.title}</h2>
                            </div>
                            <p className="text-sm text-[#9aa0a6] leading-relaxed mb-6">
                                {options.message}
                            </p>

                            <div className="space-y-6">
                                <Input
                                    autoFocus
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={options.placeholder}
                                    className="bg-[#0f1115] border-[#2a2f3a] focus:border-[#4f8cff]"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && value.trim()) handleClose(value);
                                        if (e.key === 'Escape') handleClose(null);
                                    }}
                                />

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => handleClose(null)}
                                        variant="ghost"
                                        className="flex-1 h-10 border border-[#2a2f3a] text-[10px] uppercase font-black tracking-widest rounded-none hover:bg-[#2a2f3a]/50"
                                    >
                                        {options.cancelLabel || "Cancel"}
                                    </Button>
                                    <Button
                                        onClick={() => handleClose(value)}
                                        disabled={!value.trim()}
                                        className="flex-1 h-10 bg-[#4f8cff] hover:bg-[#3d7aed] text-white text-[10px] uppercase font-black tracking-widest rounded-none shadow-lg shadow-[#4f8cff]/20"
                                    >
                                        {options.confirmLabel || "Confirm"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PromptContext.Provider>
    );
}
