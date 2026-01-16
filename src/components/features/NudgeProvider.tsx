import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Info, AlertCircle, ShieldAlert, X } from "lucide-react";

type NudgeType = "info" | "warning" | "error";

interface Nudge {
    id: string;
    message: string;
    type: NudgeType;
    persistent?: boolean;
}

interface NudgeContextType {
    addNudge: (message: string, type?: NudgeType, persistent?: boolean) => void;
    removeNudge: (id: string) => void;
}

const NudgeContext = createContext<NudgeContextType | undefined>(undefined);

export function NudgeProvider({ children }: { children: ReactNode }) {
    const [nudges, setNudges] = useState<Nudge[]>([]);

    const addNudge = useCallback((message: string, type: NudgeType = "info", persistent: boolean = false) => {
        const id = Math.random().toString(36).substring(2, 9);
        setNudges(prev => [...prev, { id, message, type, persistent }]);

        if (!persistent) {
            setTimeout(() => {
                removeNudge(id);
            }, 6000);
        }
    }, []);

    const removeNudge = useCallback((id: string) => {
        setNudges(prev => prev.filter(nudge => nudge.id !== id));
    }, []);

    return (
        <NudgeContext.Provider value={{ addNudge, removeNudge }}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full">
                {nudges.map(nudge => (
                    <div
                        key={nudge.id}
                        className={`p-4 rounded-lg border shadow-lg flex items-start gap-3 animate-in slide-in-from-right-5 duration-300 transition-all ${nudge.type === "error"
                            ? "bg-[#ff5c5c]/10 border-[#ff5c5c]/20 text-[#ff5c5c]"
                            : nudge.type === "warning"
                                ? "bg-[#f0b429]/10 border-[#f0b429]/20 text-[#f0b429]"
                                : "bg-[#4f8cff]/10 border-[#4f8cff]/20 text-[#4f8cff]"
                            }`}
                    >
                        <div className="shrink-0 mt-0.5">
                            {nudge.type === "error" && <ShieldAlert className="w-5 h-5" />}
                            {nudge.type === "warning" && <AlertCircle className="w-5 h-5" />}
                            {nudge.type === "info" && <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 text-sm leading-relaxed">
                            {nudge.message}
                        </div>
                        <button
                            onClick={() => removeNudge(nudge.id)}
                            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </NudgeContext.Provider>
    );
}

export function useNudge() {
    const context = useContext(NudgeContext);
    if (!context) {
        throw new Error("useNudge must be used within a NudgeProvider");
    }
    return context;
}
