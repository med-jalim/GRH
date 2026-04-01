import React from "react";
import {
    Banknote,
    ImageIcon,
    ExternalLink,
    Link2,
    Mail,
    Upload,
    ShieldCheck,
} from "lucide-react";
import { Reservation } from "../Show";
import { Section } from "./TabComponents";

const PAYMENT_STATUT_CONFIG = {
    non_paye: {
        label: "Non payé",
        badge: "bg-slate-100 text-slate-500 border-slate-200",
    },
    en_attente_verification: {
        label: "Vérif. en attente",
        badge: "bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100/50",
    },
    paye: {
        label: "Payé ✓",
        badge: "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100/50",
    },
} as const;

interface PaymentsTabProps {
    reservation: Reservation;
    formatPrice: (amount: number) => string;
    sendLinkForm: any;
    addPaymentForm: any;
    handleSendLink: (e: React.FormEvent) => void;
    handleAddPayment: (e: React.FormEvent) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    previewUrl: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function PaymentsTab({
    reservation,
    formatPrice,
    sendLinkForm,
    addPaymentForm,
    handleSendLink,
    handleAddPayment,
    handleFileChange,
    previewUrl,
    fileInputRef,
}: PaymentsTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Section
                    title="Tableau de Bord des Paiements"
                    icon={Banknote}
                    accentColor="emerald"
                >
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statut Actuel:</span>
                            {(() => {
                                const p = PAYMENT_STATUT_CONFIG[reservation.statut_paiement] ?? PAYMENT_STATUT_CONFIG.non_paye;
                                return (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest pointer-events-none ${p.badge}`}>
                                        {p.label}
                                    </span>
                                );
                            })()}
                        </div>
                   </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Total Réservation
                            </p>
                            <p className="text-lg font-bold text-slate-900">
                                {formatPrice(reservation.prix_total)}
                            </p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                                Déjà Payé
                            </p>
                            <p className="text-lg font-bold text-emerald-700">
                                {formatPrice(reservation.montant_paye ?? 0)}
                            </p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
                                Reste à Payer
                            </p>
                            <p className="text-lg font-bold text-amber-700">
                                {formatPrice(reservation.montant_restant)}
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500">
                                Progression du règlement
                            </span>
                            <span className="text-xs font-black text-emerald-600">
                                {reservation.pourcentage_paiement}%
                            </span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                style={{
                                    width: `${reservation.pourcentage_paiement}%`,
                                }}
                            />
                        </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                        Galerie des Reçus (
                        {reservation.preuve_paiement?.length || 0})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {reservation.preuve_paiement &&
                        reservation.preuve_paiement.length > 0 ? (
                            reservation.preuve_paiement.map((path, idx) => (
                                <div
                                    key={idx}
                                    className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-emerald-500 transition-all"
                                >
                                    <img
                                        src={`/storage/${path}`}
                                        className="w-full h-full object-cover"
                                        alt={`Reçu #${idx + 1}`}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <a
                                            href={`/storage/${path}`}
                                            target="_blank"
                                            className="p-2 bg-white rounded-lg shadow-xl text-slate-900 transform scale-90 group-hover:scale-100 transition-transform"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-400 font-medium">
                                    Aucun reçu enregistré pour le moment.
                                </p>
                            </div>
                        )}
                    </div>
                </Section>
            </div>

            <div className="flex flex-col gap-6">
                <Section
                    title="Lien de Paiement"
                    icon={Link2}
                    accentColor="indigo"
                >
                    <form
                        onSubmit={handleSendLink}
                        className="flex flex-col gap-4"
                    >
                        <div className="relative">
                            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="url"
                                value={sendLinkForm.data.lien_paiement}
                                onChange={(e) =>
                                    sendLinkForm.setData(
                                        "lien_paiement",
                                        e.target.value,
                                    )
                                }
                                placeholder="https://..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-400/40 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={
                                sendLinkForm.processing ||
                                !sendLinkForm.data.lien_paiement
                            }
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                        >
                            <Mail className="w-4 h-4" />
                            {reservation.lien_paiement
                                ? "Renvoyer le lien"
                                : "Envoyer le lien (Email)"}
                        </button>
                    </form>
                </Section>

                <Section
                    title="Nouveau Paiement"
                    icon={Banknote}
                    accentColor="emerald"
                >
                    <form
                        onSubmit={handleAddPayment}
                        className="flex flex-col gap-4"
                    >
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                                Montant partiel (MAD)
                            </label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    step="0.01"
                                    max={reservation.montant_restant}
                                    value={addPaymentForm.data.montant}
                                    onChange={(e) =>
                                        addPaymentForm.setData(
                                            "montant",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-400/40 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                                Preuve de paiement
                            </label>
                            <div
                                className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/30 overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        className="max-h-32 mx-auto rounded-lg shadow-sm"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="w-6 h-6 text-slate-300 mb-2" />
                                        <p className="text-[11px] text-slate-400">
                                            Glisser ou cliquer pour uploader
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                addPaymentForm.processing ||
                                !addPaymentForm.data.montant ||
                                !addPaymentForm.data.preuve_paiement
                            }
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-100"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Valider le paiement
                        </button>
                    </form>
                </Section>
            </div>
        </div>
    );
}
