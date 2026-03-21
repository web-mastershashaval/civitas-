import { createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
    return ctx;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setOptions(opts);
            setResolver(() => resolve);
        });
    }, []);

    const handleClose = (result: boolean) => {
        resolver?.(result);
        setOptions(null);
        setResolver(null);
    };

    const variantStyles = {
        danger: {
            accent: "red",
            confirmBg: "bg-red-600 hover:bg-red-500 shadow-red-500/20",
            iconColor: "text-red-400",
            topBar: "from-red-500 via-red-400 to-red-500",
        },
        warning: {
            accent: "amber",
            confirmBg: "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20",
            iconColor: "text-amber-400",
            topBar: "from-amber-500 via-amber-400 to-amber-500",
        },
        info: {
            accent: "blue",
            confirmBg: "bg-[#4f8cff] hover:bg-[#3d7aed] shadow-[#4f8cff]/20",
            iconColor: "text-[#4f8cff]",
            topBar: "from-[#4f8cff] via-[#3d7aed] to-[#4f8cff]",
        },
    };

    const style = options ? variantStyles[options.variant || "danger"] : variantStyles.danger;

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {options && (
                <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#161a20] border border-[#2a2f3a] w-full max-w-sm shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${style.topBar}`} />

                        <button
                            onClick={() => handleClose(false)}
                            className="absolute top-4 right-4 text-[#9aa0a6] hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertTriangle className={`w-5 h-5 ${style.iconColor}`} />
                                <h2 className="text-base font-black tracking-tight text-[#e6e6e6]">{options.title}</h2>
                            </div>
                            <p className="text-sm text-[#9aa0a6] leading-relaxed mb-8">
                                {options.message}
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleClose(false)}
                                    variant="ghost"
                                    className="flex-1 h-10 border border-[#2a2f3a] text-[10px] uppercase font-black tracking-widest rounded-none hover:bg-[#2a2f3a]/50"
                                >
                                    {options.cancelLabel || "Cancel"}
                                </Button>
                                <Button
                                    onClick={() => handleClose(true)}
                                    className={`flex-1 h-10 text-white text-[10px] uppercase font-black tracking-widest rounded-none shadow-lg ${style.confirmBg}`}
                                >
                                    {options.confirmLabel || "Confirm"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
