import * as React from "react";
import { Select } from "@base-ui/react/select";
import { CheckCircle, Clock, XCircle, ChevronDown, Loader2, CreditCard, ClipboardCheck, UserCheck, Wallet } from "lucide-react";
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
        value: "confirme",
        label: "Confirmer la réservation",
        Icon: CheckCircle,
        badge: "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100/80",
        item: "text-emerald-700",
        dot: "bg-emerald-400",
    },
    {
        value: "annule",
        label: "Annuler la réservation",
        Icon: XCircle,
        badge: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100/80",
        item: "text-red-600",
        dot: "bg-red-400",
    },
    {
        value: "en_validation",
        label: "Valider la réservation",
        Icon: ClipboardCheck,
        badge: "text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100/80",
        item: "text-yellow-700",
        dot: "bg-yellow-400",
    },
    {
        value: "valide",
        label: "Validée par le client",
        Icon: UserCheck,
        badge: "text-cyan-700 bg-cyan-50 border-cyan-200 hover:bg-cyan-100/80",
        item: "text-cyan-700",
        dot: "bg-cyan-400",
    },
    {
        value: "en_attente_paiement",
        label: "Envoyer lien de paiement",
        Icon: CreditCard,
        badge: "text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100/80",
        item: "text-indigo-700",
        dot: "bg-indigo-400",
    },
    {
        value: "partiellement_paye",
        label: "Paiement partiel effectué",
        Icon: Wallet,
        badge: "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100/80",
        item: "text-blue-700",
        dot: "bg-blue-400",
    },
] as const;

export type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

// ── Component ──────────────────────────────────────────────────────────────

interface StatusSelectProps {
    value: StatusValue;
    onChange: (value: StatusValue) => void;
    disabled?: boolean;
    loading?: boolean;
    allowedValues?: StatusValue[];
}

export function StatusSelect({
    value,
    onChange,
    disabled = false,
    loading = false,
    allowedValues,
}: StatusSelectProps) {
    const current = STATUS_OPTIONS.find((o) => o.value === value) ?? STATUS_OPTIONS[0];
    const Icon = current.Icon;

    const options = allowedValues 
        ? STATUS_OPTIONS.filter(opt => allowedValues.includes(opt.value as StatusValue))
        : STATUS_OPTIONS;

    return (
        <Select.Root
            value={value}
            onValueChange={(v) => onChange(v as StatusValue)}
            disabled={disabled || loading}
        >
            {/* ── Trigger: looks like a badge, acts as a dropdown button ── */}
            <Select.Trigger
                aria-label="Changer le statut"
                className={cn(
                    // badge style
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border",
                    "text-xs font-semibold transition-all duration-150",
                    // interaction
                    "cursor-pointer select-none focus:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-400/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    // active state (open)
                    "data-[popup-open]:shadow-md data-[popup-open]:scale-[1.02]",
                    current.badge,
                )}
            >
                {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                    <Icon className="w-3 h-3" />
                )}

                {/* Affiche toujours le libellé humanisé au lieu de la valeur brute */}
                <span className="truncate">{current.label}</span>

                <ChevronDown
                    className={cn(
                        "w-3 h-3 opacity-50 transition-transform duration-200",
                        "group-data-[popup-open]:rotate-180",
                    )}
                />
            </Select.Trigger>

            {/* ── Dropdown popup ── */}
            <Select.Portal>
                <Select.Positioner sideOffset={8} className="z-[9999]">
                    <Select.Popup
                        className={cn(
                            "min-w-[168px] rounded-xl border border-slate-200",
                            "bg-white/95 backdrop-blur-sm p-1.5",
                            "shadow-xl shadow-slate-200/70",
                            // animations
                            "origin-[var(--transform-origin)] transition-all duration-150 ease-out",
                            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:translate-y-1",
                            "data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:translate-y-1",
                        )}
                    >
                        {/* Popup header label */}
                        <p className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                            Modifier le statut
                        </p>

                        {options.map((opt) => {
                            const OptionIcon = opt.Icon;
                            const isSelected = opt.value === value;
                            return (
                                <Select.Item
                                    key={opt.value}
                                    value={opt.value}
                                    className={cn(
                                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg",
                                        "text-xs font-medium cursor-pointer outline-none",
                                        "transition-colors duration-100",
                                        "data-[highlighted]:bg-slate-50",
                                        isSelected && "bg-slate-50/80",
                                        opt.item,
                                    )}
                                >
                                    {/* Icon badge */}
                                    <span className="w-5 h-5 rounded-md bg-current/10 flex items-center justify-center flex-shrink-0">
                                        <OptionIcon className="w-3 h-3" />
                                    </span>

                                    <Select.ItemText className="flex-1 font-semibold">
                                        {opt.label}
                                    </Select.ItemText>

                                    {/* Checkmark when selected */}
                                    <Select.ItemIndicator>
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </Select.ItemIndicator>
                                </Select.Item>
                            );
                        })}
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    );
}
