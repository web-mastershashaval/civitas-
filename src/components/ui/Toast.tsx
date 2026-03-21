import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setExiting(true);
            setTimeout(() => onDismiss(toast.id), 300);
        }, toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    const icons = {
        success: <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />,
        error: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />,
        info: <Info className="w-4 h-4 text-[#4f8cff] shrink-0" />,
        warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
    };

    const borders = {
        success: "border-green-500/30",
        error: "border-red-500/30",
        info: "border-[#4f8cff]/30",
        warning: "border-amber-500/30",
    };

    return (
        <div
            className={`flex items-center gap-3 px-5 py-3.5 bg-[#161a20] border ${borders[toast.type]} shadow-2xl shadow-black/40 backdrop-blur-md min-w-[320px] max-w-[480px] transition-all duration-300 ${exiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8 fade-in"}`}
        >
            {icons[toast.type]}
            <p className="text-[11px] font-bold text-[#e6e6e6] uppercase tracking-wider flex-1 leading-relaxed">
                {toast.message}
            </p>
            <button
                onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
                className="text-[#9aa0a6] hover:text-[#e6e6e6] transition-colors shrink-0"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info", duration: number = 4000) => {
        const id = Date.now().toString() + Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-auto">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}
