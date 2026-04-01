import React, { useEffect } from "react";
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
    useEffect(() => {
        console.log(reservation.details);
    }, [reservation]);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Section
                    title="Informations du contact"
                    icon={User}
                    accentColor="amber"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoRow
                            icon={User}
                            label="Nom du contact"
                            value={reservation.nom_contact}
                        />
                        <InfoRow
                            icon={Tag}
                            label="Agence"
                            value={reservation.nom_agence || undefined}
                        />
                        <InfoRow
                            icon={Hash}
                            label="Code agence"
                            value={reservation.code_agence || undefined}
                            mono
                        />
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
                    title="Détails du séjour"
                    icon={Calendar}
                    accentColor="indigo"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <InfoRow
                            icon={Calendar}
                            label="Date d'arrivée"
                            value={formatDate(reservation.date_arrivee)}
                        />
                        <InfoRow
                            icon={Calendar}
                            label="Date de départ"
                            value={formatDate(reservation.date_depart)}
                        />
                        <InfoRow
                            icon={Users}
                            label="Personnes"
                            value={`${reservation.nb_personnes} pers.`}
                        />
                        <InfoRow
                            icon={Clock}
                            label="Durée"
                            value={`${nights} nuits`}
                        />
                        <div className="sm:col-span-2">
                            <InfoRow
                                icon={Building2}
                                label="Hôtel"
                                value={
                                    reservation.hotel
                                        ? `${reservation.hotel.name} — ${reservation.hotel.ville}`
                                        : undefined
                                }
                            />
                        </div>
                    </div>
                    <div className="h-px bg-slate-100 my-6" />
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <BedDouble className="w-4 h-4 text-indigo-500" />
                        Chambres réservées
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-slate-100">
                                    <th className="pb-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="pb-3 text-xs text-slate-400 font-semibold uppercase tracking-wider text-center">
                                        Qté
                                    </th>
                                    <th className="pb-3 text-xs text-slate-400 font-semibold uppercase tracking-wider text-right">
                                        Prix Unit.
                                    </th>
                                    <th className="pb-3 text-xs text-slate-400 font-semibold uppercase tracking-wider text-right">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {Array.isArray(reservation.details) &&
                                reservation.details.length > 0 ? (
                                    reservation.details.map((item) => (
                                        <tr key={item.id} className="group">
                                            <td className="py-3 font-medium text-slate-700">
                                                {item.type?.nom ??
                                                    item.type?.name ??
                                                    `Type #${item.id_type}`}
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                                                    x{item.quantite}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-slate-500 text-xs">
                                                {formatPrice(
                                                    Number(item.prix_unitaire),
                                                )}
                                            </td>
                                            <td className="py-3 text-right font-bold text-slate-900">
                                                {formatPrice(
                                                    Number(item.quantite) *
                                                        Number(
                                                            item.prix_unitaire,
                                                        ),
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="py-10 text-center text-slate-400 italic"
                                        >
                                            Aucun détail trouvé pour cette
                                            réservation.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Section>
            </div>

            <div className="flex flex-col gap-6">
                <Section title="Notes & Résumé" icon={Tag} accentColor="violet">
                    <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 mb-6">
                        <p className="text-xs text-violet-600 font-bold uppercase tracking-wider mb-1">
                            Montant Total
                        </p>
                        <p className="text-2xl font-black text-violet-900">
                            {formatPrice(reservation.prix_total)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Remarques spéciales
                        </label>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 italic line-height-relaxed min-h-[120px]">
                            {reservation.remarques_speciales ||
                                "Aucune remarque particulière."}
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}
