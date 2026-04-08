import { useMemo, useEffect } from "react";
import type { Hotel } from "@/types/booking";

interface Props {
    groups: any[];
    hotel: Hotel | null;
    onTotalChange: (total: number, nights: number) => void;
}

function formatPrice(n: number) {
    return new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        maximumFractionDigits: 0,
    }).format(n);
}

export function PriceSummary({ groups, hotel, onTotalChange }: Props) {
    const { groupBreakdowns, totalPrice, overallNights } = useMemo(() => {
        if (!hotel || !groups || groups.length === 0) {
            return { groupBreakdowns: [], totalPrice: 0, overallNights: 0 };
        }

        let minArrival = "";
        let maxDeparture = "";
        let total = 0;
        const breakdowns: any[] = [];

        for (const group of groups) {
            if (
                !group.date_arrivee ||
                !group.date_depart ||
                !group.items?.length
            )
                continue;

            const checkIn = new Date(group.date_arrivee + "T12:00:00");
            const checkOut = new Date(group.date_depart + "T12:00:00");
            const nights = Math.max(
                1,
                Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000),
            );

            if (!minArrival || group.date_arrivee < minArrival)
                minArrival = group.date_arrivee;
            if (!maxDeparture || group.date_depart > maxDeparture)
                maxDeparture = group.date_depart;

            const lines: any[] = [];
            let groupTotal = 0;
            for (const item of group.items) {
                const itemTypeId = Number(item.id_type);
                const qty = Number(item.quantite) || 1;

                // Find tarif by type id and date range – use Number() to avoid string/number mismatch
                const tarif = (hotel.tarifs || []).find(
                    (t) => {
                        const start = new Date(t.date_debut.substring(0, 10) + "T00:00:00");
                        const end = new Date(t.date_fin.substring(0, 10) + "T23:59:59");
                        return Number(t.id_type) === itemTypeId && start <= checkIn && end >= checkIn;
                    }
                );

                const chambre = (hotel.chambres || []).find(
                    (c) => Number(c.id_type) === itemTypeId,
                );
                const prix = tarif ? Number(tarif.prix) : 0;
                const lineTotal = prix * nights * qty;

                groupTotal += lineTotal;

                lines.push({
                    nom: chambre?.type?.nom ?? `Type ${itemTypeId}`,
                    qty,
                    prix,
                    nights,
                    lineTotal,
                    found: !!tarif,
                    occupants: {
                        a: Number(item.nb_adultes) || 0,
                        e: Number(item.nb_enfants) || 0,
                        b: Number(item.nb_bebes) || 0,
                    }
                });
            }

            total += groupTotal;
            breakdowns.push({ group, nights, lines, groupTotal });
        }

        let overallNights = 0;
        if (minArrival && maxDeparture) {
            const a = new Date(minArrival + "T12:00:00");
            const b = new Date(maxDeparture + "T12:00:00");
            overallNights = Math.max(
                1,
                Math.round((b.getTime() - a.getTime()) / 86400000),
            );
        }
        return {
            groupBreakdowns: breakdowns,
            totalPrice: total,
            overallNights,
        };
    }, [groups, hotel]);

    // Notify parent whenever the total changes
    useEffect(() => {
        if (typeof onTotalChange === "function") {
            onTotalChange(totalPrice, overallNights);
        }
    }, [totalPrice, overallNights, onTotalChange]);

    if (!hotel || groupBreakdowns.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700/50 pb-3">
                <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                </svg>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Récapitulatif financier
                </h3>
            </div>

            <div className="space-y-6 mb-6">
                {groupBreakdowns.map((bd, gIdx) => (
                    <div key={bd.group.uid || gIdx} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Période {gIdx + 1} — {bd.nights} nuit
                                {bd.nights > 1 ? "s" : ""}
                            </span>
                            <span className="text-[10px] text-slate-500">
                                {bd.group.date_arrivee} → {bd.group.date_depart}
                            </span>
                        </div>

                        <div className="space-y-1.5 pl-2 border-l-2 border-slate-700">
                            {bd.lines.map((line: any, lIdx: number) => (
                                <div
                                    key={lIdx}
                                    className="flex justify-between items-center gap-3"
                                >
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-200">
                                            {line.nom}
                                            <span className="text-[10px] text-slate-500 ml-1 block mt-0.5">
                                                ×{line.qty} ch. × {line.nights}{" "}
                                                nuits
                                                <span className="ml-2 text-amber-500">
                                                    (Ad. {line.occupants.a} Enf. {line.occupants.e} Sen. {line.occupants.s} Béb. {line.occupants.b} / ch.)
                                                </span>
                                            </span>
                                        </p>
                                        {!line.found && (
                                            <p className="text-[10px] text-red-400">
                                                ⚠ Aucun tarif trouvé pour cette
                                                date
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-slate-300 shrink-0">
                                        {formatPrice(line.lineTotal)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t-2 border-slate-700 pt-4 flex justify-between items-center">
                <div>
                    <p className="text-xs text-amber-500 font-bold uppercase tracking-tight">
                        Total Général
                    </p>
                    <p className="text-[10px] text-slate-500">
                        Toutes taxes comprises
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-amber-400 drop-shadow-sm">
                        {formatPrice(totalPrice)}
                    </p>
                </div>
            </div>
        </div>
    );
}
