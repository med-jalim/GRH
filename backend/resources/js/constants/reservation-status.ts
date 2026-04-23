import {
    Clock,
    Search,
    CheckCircle2,
    CreditCard,
    Briefcase,
    XCircle,
    LayoutDashboard,
} from "lucide-react";

export const RESERVATION_STATUS_COLORS: Record<
    string,
    { bg: string; text: string; border: string; dot: string }
> = {
    en_attente: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-400",
    },
    en_verification: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-400",
    },
    valide: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
        dot: "bg-indigo-400",
    },
    en_attente_paiement: {
        bg: "bg-violet-50",
        text: "text-violet-700",
        border: "border-violet-200",
        dot: "bg-violet-400",
    },
    paye_partiellement: {
        bg: "bg-cyan-50",
        text: "text-cyan-700",
        border: "border-cyan-200",
        dot: "bg-cyan-400",
    },
    confirme: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-400",
    },
    annule: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        dot: "bg-red-400",
    },
};

export const RESERVATION_STATUS_CONFIG = [
    {
        value: "all",
        label: "Tous les statuts",
        Icon: LayoutDashboard,
        color: "text-slate-500",
        bg: "bg-slate-50",
        border: "border-slate-200",
    },
    {
        value: "en_attente",
        label: "En attente",
        Icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
    },
    {
        value: "en_verification",
        label: "Verification",
        Icon: Search,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
    },
    {
        value: "valide",
        label: "Valide",
        Icon: CheckCircle2,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
    },
    {
        value: "en_attente_paiement",
        label: "Attente Paiement",
        Icon: CreditCard,
        color: "text-violet-600",
        bg: "bg-violet-50",
        border: "border-violet-200",
    },
    {
        value: "paye_partiellement",
        label: "Partiel",
        Icon: Briefcase,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
    },
    {
        value: "confirme",
        label: "Confirme",
        Icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
    },
    {
        value: "annule",
        label: "Annule",
        Icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
    },
] as const;
