import * as React from "react";
import { Select } from "@base-ui/react/select";
import {
    CheckCircle,
    Clock,
    XCircle,
    ChevronDown,
    Loader2,
    CreditCard,
    Search,
    ShieldCheck,
    PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Status config ──────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
    {
        value: "en_attente",
        label: "En attente",
        Icon: Clock,
        badge: "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100/80",
        item: "text-amber-700",
        dot: "bg-amber-400",
    },
    {
        value: "en_verification",
        label: "En vérification",
        Icon: Search,
        badge: "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100/80",
        item: "text-blue-700",
        dot: "bg-blue-400",
    },
    {
        value: "valide",
        label: "Validé",
        Icon: ShieldCheck,
        badge: "text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100/80",
        item: "text-indigo-700",
        dot: "bg-indigo-400",
    },
    {
        value: "en_attente_paiement",
        label: "Attente paiement",
        Icon: CreditCard,
        badge: "text-violet-700 bg-violet-50 border-violet-200 hover:bg-violet-100/80",
        item: "text-violet-700",
        dot: "bg-violet-400",
    },
    {
        value: "paye_partiellement",
        label: "Payé Partiellement",
        Icon: PieChart,
        badge: "text-cyan-700 bg-cyan-50 border-cyan-200 hover:bg-cyan-100/80",
        item: "text-cyan-700",
        dot: "bg-cyan-400",
    },
    {
        value: "confirme",
        label: "Confirmé",
        Icon: CheckCircle,
        badge: "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100/80",
        item: "text-emerald-700",
        dot: "bg-emerald-400",
    },
    {
        value: "annule",
        label: "Annulé",
        Icon: XCircle,
        badge: "text-red-700 bg-red-50 border-red-200 hover:bg-red-100/80",
        item: "text-red-700",
        dot: "bg-red-400",
    },
] as const;

// ── Components ─────────────────────────────────────────────────────────────

interface StatusSelectProps {
    value: string;
    onChange: (value: string) => void;
    loading?: boolean;
    size?: "sm" | "lg";
}

export function StatusSelect({
    value,
    onChange,
    loading = false,
    size = "sm",
}: StatusSelectProps) {
    const current =
        STATUS_OPTIONS.find((o) => o.value === value) ?? STATUS_OPTIONS[0];
    const Icon = current.Icon;

    return (
        <Select.Root 
            value={value} 
            onValueChange={(val) => val && onChange(val)} 
            disabled={loading}
        >
            <Select.Trigger
                className={cn(
                    // badge style
                    "inline-flex items-center gap-1.5 rounded-full border",
                    size === "sm"
                        ? "px-2.5 py-1 text-xs"
                        : "px-4 py-1.5 text-sm",
                    "font-semibold transition-all duration-150",
                    // interaction
                    "cursor-pointer select-none focus:outline-none",
                    // dynamic colors
                    current.badge,
                    loading && "opacity-70 cursor-wait",
                )}
            >
                {loading ? (
                    <Loader2
                        className={cn(
                            "animate-spin",
                            size === "sm" ? "w-3 h-3" : "w-4 h-4",
                        )}
                    />
                ) : (
                    <Icon
                        className={cn(size === "sm" ? "w-3 h-3" : "w-4 h-4")}
                    />
                )}
                {/* Shows the current status label */}
                {current.label}
                <ChevronDown
                    className={cn(
                        "opacity-50 transition-transform duration-200",
                        "group-data-[open]:rotate-180",
                        size === "sm" ? "w-3 h-3" : "w-4 h-4",
                    )}
                />
            </Select.Trigger>

            <Select.Portal>
                <Select.Positioner className="z-[100] pt-1">
                    <Select.Popup className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-1.5 min-w-[180px] animate-in fade-in zoom-in-95 duration-100">
                        {STATUS_OPTIONS.map((opt) => (
                            <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer outline-none transition-colors",
                                    "hover:bg-slate-50 focus:bg-slate-50",
                                    "group",
                                    opt.item,
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        opt.dot,
                                    )}
                                />
                                <Select.ItemText>{opt.label}</Select.ItemText>
                                <opt.Icon
                                    className={cn(
                                        "w-3.5 h-3.5 ml-auto opacity-0 group-data-[selected]:opacity-100 transition-opacity",
                                    )}
                                />
                            </Select.Item>
                        ))}
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    );
}
