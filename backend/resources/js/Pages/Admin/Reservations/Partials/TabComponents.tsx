import React from "react";

export function Section({
    title,
    icon: Icon,
    children,
    accentColor = "amber",
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    accentColor?: "amber" | "emerald" | "indigo" | "violet";
}) {
    const colors = {
        amber: "bg-amber-50 text-amber-600",
        emerald: "bg-emerald-50 text-emerald-600",
        indigo: "bg-indigo-50 text-indigo-600",
        violet: "bg-violet-50 text-violet-600",
    };
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-300">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[accentColor]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    {title}
                </h2>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

export function InfoRow({
    icon: Icon,
    label,
    value,
    mono = false,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
                <p className="text-xs text-slate-400 font-medium">{label}</p>
                <div className={`text-sm font-semibold text-slate-800 mt-0.5 ${mono ? "font-mono" : ""}`}>
                    {value || <span className="text-slate-400 font-normal italic">—</span>}
                </div>
            </div>
        </div>
    );
}
