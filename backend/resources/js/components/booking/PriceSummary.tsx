import { useMemo, useEffect } from "react";
import type { Hotel } from "@/types/booking";

interface Props {
    groups: any[];
    hotel: Hotel | null;
    types: any[];
    onTotalChange: (total: number, nights: number) => void;
    discounts: any[];
}

function formatPrice(n: number) {
    return new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        maximumFractionDigits: 0,
    }).format(n);
}

export function PriceSummary({ groups, hotel, types, onTotalChange, discounts }: Props) {
    const { groupBreakdowns, totalPrice, overallNights, totalOriginal, totalDiscount, totalTax } = useMemo(() => {
        if (!hotel || !groups || groups.length === 0) {
            return { groupBreakdowns: [], totalPrice: 0, overallNights: 0, totalOriginal: 0, totalDiscount: 0, totalTax: 0 };
        }

        let total = 0;
        let totalOriginal = 0;
        let totalDiscount = 0;
        let minArrival = "";
        let maxDeparture = "";
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
            let groupOriginalTotal = 0;
            let totalRoomsInGroup = 0;

            for (const item of group.items) {
                const itemTypeId = Number(item.id_type);
                const qty = Number(item.quantite) || 1;
                totalRoomsInGroup += qty;

                // Find tarif by capacity id and date range
                const checkInStr = group.date_arrivee;
                const tarif = (hotel.tarifs || []).find(
                    (t) => {
                        const startStr = t.date_debut.substring(0, 10);
                        const endStr   = t.date_fin.substring(0, 10);
                        const capacityId = Number(item.id_capacity);
                        return Number(t.id_capacity) === capacityId && 
                               checkInStr >= startStr && 
                               checkInStr <= endStr;
                    }
                );

                const prix = tarif ? Number(tarif.prix) : 0;
                const lineTotal = prix * nights * qty;

                groupOriginalTotal += lineTotal;

                // Find type name from 'types' prop
                const typeName = types.find(t => t.id === itemTypeId)?.nom ?? `Type ${itemTypeId}`;

                lines.push({
                    nom: typeName,
                    qty,
                    prix,
                    nights,
                    lineTotal,
                    found: !!tarif,
                    occupants: {
                        a: Number(item.nb_adultes) || 0,
                        e: Number(item.nb_enfants) || 0,
                    },
                    capacityLabel: hotel.type_capacities?.find(tc => tc.id === Number(item.id_capacity))?.label || ""
                });
            }

            // --- Apply BEST Discount for this Group ---
            let bestDiscount = null;
            let bestDiscountAmount = 0;

            for (const discount of (discounts || [])) {
                if (!discount.is_active) continue;

                let applies = false;
                if (discount.condition_type === 'min_nights' && nights >= discount.condition_value) applies = true;
                if (discount.condition_type === 'min_rooms' && totalRoomsInGroup >= discount.condition_value) applies = true;

                if (applies) {
                    let amount = 0;
                    if (discount.type === 'percentage') {
                        amount = (groupOriginalTotal * Number(discount.value)) / 100;
                    } else {
                        amount = Number(discount.value);
                    }

                    if (amount > bestDiscountAmount) {
                        bestDiscountAmount = amount;
                        bestDiscount = discount;
                    }
                }
            }

            const groupFinalTotal = groupOriginalTotal - bestDiscountAmount;
            
            totalOriginal += groupOriginalTotal;
            totalDiscount += bestDiscountAmount;
            total += groupFinalTotal;

            breakdowns.push({ 
                group, 
                nights, 
                lines, 
                groupOriginalTotal, 
                bestDiscount, 
                bestDiscountAmount, 
                groupFinalTotal 
            });
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

        const taxPercentage = Number(hotel.tax_percentage || 0);
        const totalTax = taxPercentage > 0 ? (total * taxPercentage) / 100 : 0;
        const finalGrandTotal = total + totalTax;

        return {
            groupBreakdowns: breakdowns,
            totalPrice: finalGrandTotal,
            totalOriginal,
            totalDiscount,
            totalTax,
            overallNights,
        };
    }, [groups, hotel, discounts]);

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
                                            {line.nom} ({line.capacityLabel})
                                            <span className="text-[10px] text-slate-500 ml-1 block mt-0.5">
                                                ×{line.qty} ch. × {line.nights}{" "}
                                                nuits
                                            </span>
                                        </p>
                                        {!line.found && (
                                            <p className="text-[10px] text-red-400">
                                                ⚠ Aucun tarif trouvé
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-slate-300 shrink-0">
                                        {formatPrice(line.lineTotal)}
                                    </span>
                                </div>
                            ))}

                            {/* Group Discount Badge */}
                            {bd.bestDiscountAmount > 0 && (
                                <div className="flex justify-between items-center bg-emerald-500/10 p-2 rounded-lg mt-2 border border-emerald-500/20">
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                                            </svg>
                                            Offre: {bd.bestDiscount.name}
                                        </p>
                                    </div>
                                    <span className="text-xs font-black text-emerald-400">
                                        -{formatPrice(bd.bestDiscountAmount)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Tax Line */}
            {totalTax > 0 && (
                <div className="mb-4 px-2 py-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex justify-between items-center animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] font-black text-slate-400">%</span>
                        </div>
                        <span className="text-xs font-bold text-slate-300">Taxes ({hotel.tax_percentage}%)</span>
                    </div>
                    <span className="text-xs font-black text-slate-100">+{formatPrice(totalTax)}</span>
                </div>
            )}

            <div className="border-t-2 border-slate-700 pt-4 flex justify-between items-center">
                <div>
                    <p className="text-xs text-amber-500 font-bold uppercase tracking-tight">
                        Total {totalDiscount > 0 || totalTax > 0 ? 'Net' : 'Général'}
                    </p>
                    {totalDiscount > 0 && (
                        <p className="text-[10px] text-slate-400 line-through">
                            {formatPrice(totalOriginal)}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-2xl font-black text-amber-400 drop-shadow-sm">
                        {formatPrice(totalPrice)}
                    </p>
                    {totalDiscount > 0 && (
                        <p className="text-[10px] text-emerald-400 font-bold">
                            Vous économisez {formatPrice(totalDiscount)} !
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
