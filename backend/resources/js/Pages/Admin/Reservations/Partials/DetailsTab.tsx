import React from "react";
import {
    User,
    Tag,
    Hash,
    Mail,
    Phone,
    Calendar,
    Users,
    Clock,
    Building2,
    BedDouble,
    Briefcase,
    Percent,
    Sparkles,
} from "lucide-react";
import { Reservation } from "../Show";
import { Section, InfoRow } from "./TabComponents";

interface DetailsTabProps {
    reservation: Reservation;
    nights: number;
    formatDate: (date: string) => string;
    formatPrice: (amount: number) => string;
}

export default function DetailsTab({
    reservation,
    nights,
    formatDate,
    formatPrice,
}: DetailsTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Section
                    title="Informations du contact"
                    icon={User}
                    accentColor="amber"
                >
                    {/* Client Type Badge */}
                    <div className="mb-4">
                        {reservation.client_type === 'groupe' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Users className="w-3.5 h-3.5" />
                                Groupe Direct
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <Briefcase className="w-3.5 h-3.5" />
                                Agence de Voyage
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoRow
                            icon={User}
                            label="Nom du contact"
                            value={reservation.nom_contact}
                        />
                        {reservation.client_type === 'agence' && (
                            <InfoRow
                                icon={Tag}
                                label="Agence"
                                value={reservation.nom_agence || undefined}
                            />
                        )}
                        {reservation.client_type === 'agence' && (
                            <InfoRow
                                icon={Hash}
                                label="Code agence"
                                value={reservation.code_agence || undefined}
                                mono
                            />
                        )}
                        <InfoRow
                            icon={Mail}
                            label="E-mail"
                            value={reservation.email}
                        />
                        <InfoRow
                            icon={Phone}
                            label="Téléphone"
                            value={reservation.telephone}
                        />
                    </div>
                </Section>

                <Section
                    title="Détails du séjour (Muti-périodes)"
                    icon={Calendar}
                    accentColor="indigo"
                >
                    <div className="space-y-8">
                        <InfoRow
                            icon={Building2}
                            label="Hôtel"
                            value={
                                reservation.hotel
                                    ? `${reservation.hotel.name} — ${reservation.hotel.ville}`
                                    : undefined
                            }
                        />

                        {reservation.groups && reservation.groups.length > 0 ? (
                            reservation.groups.map((group, idx) => (
                                <div key={group.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                                    <div className="absolute top-0 right-0 p-3">
                                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded-lg uppercase tracking-widest leading-none">
                                            GROUPE {idx + 1}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                        <InfoRow
                                            icon={Calendar}
                                            label="Arrivée"
                                            value={formatDate(group.date_arrivee)}
                                            small
                                        />
                                        <InfoRow
                                            icon={Calendar}
                                            label="Départ"
                                            value={formatDate(group.date_depart)}
                                            small
                                        />
                                        <div className="flex gap-4">
                                            <InfoRow
                                                icon={Users}
                                                label="Personnes"
                                                value={`${group.nb_personnes} pax`}
                                                small
                                            />
                                            <InfoRow
                                                icon={Clock}
                                                label="Nuits"
                                                value={`${nightsBetween(group.date_arrivee, group.date_depart)} n.`}
                                                small
                                            />
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="text-left border-b border-slate-200">
                                                    <th className="pb-2 font-bold text-slate-400 uppercase tracking-tighter">Hébergement</th>
                                                    <th className="pb-2 font-bold text-slate-400 uppercase tracking-tighter text-center">Équipage / Chambre</th>
                                                    <th className="pb-2 font-bold text-slate-400 uppercase tracking-tighter text-center">Qté</th>
                                                    <th className="pb-2 font-bold text-slate-400 uppercase tracking-tighter text-right">P.U / Nuit</th>
                                                    <th className="pb-2 font-bold text-slate-400 uppercase tracking-tighter text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {group.items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="py-2.5">
                                                            <div className="font-bold text-slate-700">{item.type?.nom || item.type?.name || `Type #${item.id_type}`}</div>
                                                            {item.capacity && (
                                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-tight">
                                                                    Config: {item.capacity.label}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span title="Adultes" className="flex items-center gap-0.5 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md font-bold text-slate-600">Ad. {item.nb_adultes}</span>
                                                                <span title="Enfants" className="flex items-center gap-0.5 text-[10px] bg-sky-50 px-1.5 py-0.5 rounded-md font-bold text-sky-600">Enf. {item.nb_enfants}</span>
                                                            </div>
                                                            {item.capacity && (
                                                                <div className="mt-1 flex items-center justify-center">
                                                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                        <div 
                                                                            className={`h-full rounded-full transition-all ${
                                                                                (item.nb_adultes + item.nb_enfants) > item.capacity.capacite_totale 
                                                                                ? "bg-rose-500 w-full" 
                                                                                : "bg-slate-300"
                                                                            }`}
                                                                            style={{ width: `${Math.min(100, ((item.nb_adultes + item.nb_enfants) / item.capacity.capacite_totale) * 100)}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className={`ml-1.5 text-[9px] font-black ${ (item.nb_adultes + item.nb_enfants) > item.capacity.capacite_totale ? "text-rose-500" : "text-slate-400"}`}>
                                                                        {item.nb_adultes + item.nb_enfants}/{item.capacity.capacite_totale}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 text-center"><span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-black text-slate-600">x{item.quantite}</span></td>
                                                        <td className="py-2.5 text-right text-slate-500">{formatPrice(Number(item.prix_unitaire))}</td>
                                                        <td className="py-2.5 text-right font-black text-slate-900">
                                                           {formatPrice(Number(item.quantite) * Number(item.prix_unitaire) * nightsBetween(group.date_arrivee, group.date_depart))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* --- Per-group Pricing Footer with Discount --- */}
                                    {(group.original_price > 0 || group.discount_amount > 0) && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                                            {group.discount_amount > 0 ? (
                                                <>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-400 font-medium">Sous-total période</span>
                                                        <span className="font-bold text-slate-500">{formatPrice(group.original_price)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                                            <Sparkles className="w-3 h-3" />
                                                            Remise{group.discount?.name ? ` — ${group.discount.name}` : ''}
                                                        </span>
                                                        <span className="font-black text-emerald-600">-{formatPrice(group.discount_amount)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm pt-1">
                                                        <span className="font-black text-slate-800">Total période</span>
                                                        <span className="font-black text-indigo-600 text-base">{formatPrice(group.original_price - group.discount_amount)}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-black text-slate-800">Total période</span>
                                                    <span className="font-black text-indigo-600 text-base">{formatPrice(group.original_price)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                Aucune information de groupe trouvée.
                            </div>
                        )}
                    </div>
                </Section>
            </div>

            <div className="flex flex-col gap-6">
                <Section title="Notes & Résumé" icon={Tag} accentColor="violet">
                    {(() => {
                        const totalOriginal = (reservation.groups || []).reduce((s, g) => s + (g.original_price || 0), 0);
                        const totalDiscount = (reservation.groups || []).reduce((s, g) => s + (g.discount_amount || 0), 0);
                        return (
                            <div className="space-y-3 mb-6">
                                {totalDiscount > 0 && (
                                    <>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Sous-total Brut</p>
                                            <p className="text-lg font-bold text-slate-500 line-through">{formatPrice(totalOriginal)}</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> Total Remises Appliquées
                                            </p>
                                            <p className="text-lg font-black text-emerald-600">-{formatPrice(totalDiscount)}</p>
                                        </div>
                                    </>
                                )}
                                <div className="p-4 bg-violet-600 rounded-2xl shadow-lg shadow-violet-600/20">
                                    <p className="text-[10px] text-violet-200 font-bold uppercase tracking-widest mb-1">
                                        Montant Total {totalDiscount > 0 ? 'Net' : 'Estimé'}
                                    </p>
                                    <p className="text-2xl font-black text-white">
                                        {formatPrice(reservation.prix_total)}
                                    </p>
                                </div>
                            </div>
                        );
                    })()}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Remarques spéciales {reservation.client_type === 'agence' ? "de l'agence" : "du groupe"}
                        </label>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 italic leading-relaxed min-h-[120px]">
                            {reservation.remarques_speciales ||
                                "Aucune remarque particulière."}
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}

function nightsBetween(d1: string, d2: string) {
    const diff = new Date(d2).getTime() - new Date(d1).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}
