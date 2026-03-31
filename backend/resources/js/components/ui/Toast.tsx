import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms, default 4000
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

// ── Context ────────────────────────────────────────────────────────────────

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Config ─────────────────────────────────────────────────────────────────

const TOAST_CONFIG: Record<
  ToastType,
  { icon: React.ElementType; bg: string; border: string; text: string; progress: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "bg-white",
    border: "border-emerald-200",
    text: "text-slate-800",
    iconColor: "text-emerald-500",
    progress: "bg-emerald-400",
  },
  error: {
    icon: XCircle,
    bg: "bg-white",
    border: "border-red-200",
    text: "text-slate-800",
    iconColor: "text-red-500",
    progress: "bg-red-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-white",
    border: "border-amber-200",
    text: "text-slate-800",
    iconColor: "text-amber-500",
    progress: "bg-amber-400",
  },
  info: {
    icon: Info,
    bg: "bg-white",
    border: "border-blue-200",
    text: "text-slate-800",
    iconColor: "text-blue-500",
    progress: "bg-blue-400",
  },
};

// ── Single Toast ───────────────────────────────────────────────────────────

function SingleToast({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const cfg = TOAST_CONFIG[item.type];
  const Icon = cfg.icon;
  const duration = item.duration ?? 4000;

  const [visible, setVisible] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);
  const startTime = useRef(Date.now());
  const rafRef = useRef<number | null>(null);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar + auto-dismiss
  useEffect(() => {
    function tick() {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgressWidth(remaining);
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        dismiss();
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [duration]);

  function dismiss() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setVisible(false);
    // Wait for exit animation before removing from DOM
    setTimeout(() => onRemove(item.id), 300);
  }

  return (
    <div
      className={`
        flex items-start gap-3 w-full max-w-sm
        ${cfg.bg} ${cfg.text} rounded-2xl border ${cfg.border}
        shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)] overflow-hidden
        transition-all duration-300 ease-out
        ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}
      `}
    >
      <div className="flex items-start gap-3 px-4 pt-4 pb-3 flex-1 min-w-0">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
        </div>

        {/* Message */}
        <p className="text-sm font-medium leading-relaxed flex-1 min-w-0 break-words">
          {item.message}
        </p>

        {/* Close */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
        <div
          className={`h-full ${cfg.progress} transition-none`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </div>
  );
}

// ── Provider + Container ───────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
    },
    []
  );

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ctx: ToastContextValue = {
    toast: add,
    success: (msg, dur) => add(msg, "success", dur),
    error: (msg, dur) => add(msg, "error", dur),
    warning: (msg, dur) => add(msg, "warning", dur),
    info: (msg, dur) => add(msg, "info", dur),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Portal-like fixed container */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto relative w-full max-w-sm">
            <SingleToast item={item} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
