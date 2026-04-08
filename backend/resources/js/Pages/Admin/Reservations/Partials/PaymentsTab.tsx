import React from "react";
import {
    Banknote,
    ImageIcon,
    ExternalLink,
    Link2,
    Mail,
    Upload,
    ShieldCheck,
    Calendar,
    Clock,
    FileText,
    User,
    ArrowUpRight,
    History,
    Check,
    XCircle,
} from "lucide-react";
import { Reservation } from "../Show";
import { Section } from "./TabComponents";
import { cn } from "@/lib/utils";


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
    handleVerifyPayment: (paymentId: number) => void;
    handleRejectPayment: (paymentId: number, notesAdmin: string) => void;
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
    handleVerifyPayment,
    handleRejectPayment,
}: PaymentsTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <Section
                    title="Tableau de Bord des Paiements"
                    icon={Banknote}
                    accentColor="emerald"
                >

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

                    <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <History className="w-4 h-4 text-emerald-500" />
                        Historique des règlements
                    </h3>

                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
                        {reservation.payments &&
                        reservation.payments.length > 0 ? (
                            reservation.payments.map((payment, idx) => (
                                <div
                                    key={payment.id}
                                    className="relative flex items-start gap-6 group"
                                >
                                    {/* Timeline dot */}
                                    <div className="absolute left-5 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-500 ring-4 ring-emerald-50 shadow-sm z-10" />

                                    <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group-hover:border-emerald-200 transition-all hover:shadow-md animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                                    <Banknote className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">
                                                        {formatPrice(
                                                            payment.amount,
                                                        )}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(
                                                            payment.payment_date,
                                                        ).toLocaleDateString(
                                                            "fr-FR",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                        <Clock className="w-3 h-3 ml-1" />
                                                        {new Date(
                                                            payment.payment_date,
                                                        ).toLocaleTimeString(
                                                            "fr-FR",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {payment.proof_path && (
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`/storage/${payment.proof_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold border border-slate-100 hover:border-emerald-200 transition-all"
                                                    >
                                                        <ImageIcon className="w-3.5 h-3.5" />
                                                        Voir reçu
                                                        <ArrowUpRight className="w-3 h-3" />
                                                    </a>

                                                    {payment.status ===
                                                        "pending" && (
                                                        <div className="flex items-center gap-1 ml-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleVerifyPayment(
                                                                        payment.id,
                                                                    )
                                                                }
                                                                className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-sm shadow-emerald-200 transition-all"
                                                                title="Approuver"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const notes =
                                                                        prompt(
                                                                            "Raison du rejet :",
                                                                        );
                                                                    if (notes)
                                                                        handleRejectPayment(
                                                                            payment.id,
                                                                            notes,
                                                                        );
                                                                }}
                                                                className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 shadow-sm shadow-rose-200 transition-all"
                                                                title="Rejeter"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 px-1.5 bg-slate-50 rounded text-slate-400">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                    Par:{" "}
                                                    {payment.provenance ===
                                                    "admin"
                                                        ? "Administrateur"
                                                        : "Client"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 justify-end">
                                                <div
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                        payment.status ===
                                                        "verified"
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            : payment.status ===
                                                                "rejected"
                                                              ? "bg-rose-50 text-rose-600 border-rose-100"
                                                              : "bg-blue-50 text-blue-600 border-blue-100"
                                                    }`}
                                                >
                                                    {payment.status ===
                                                    "verified"
                                                        ? "Validé"
                                                        : payment.status ===
                                                            "rejected"
                                                          ? "Refusé"
                                                          : "En attente"}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    Enregistré le:{" "}
                                                    {new Date(
                                                        payment.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {payment.notes && (
                                            <div className="mt-3 p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                                                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                                                    <FileText className="w-3 h-3 inline mr-1 opacity-50" />
                                                    {payment.notes}
                                                </p>
                                            </div>
                                        )}

                                        {payment.status === "rejected" &&
                                            payment.notes_admin && (
                                                <div className="mt-2 p-2 bg-rose-50 rounded-lg border border-rose-100">
                                                    <p className="text-[10px] text-rose-600 font-bold leading-relaxed">
                                                        <XCircle className="w-3 h-3 inline mr-1 opacity-70" />
                                                        Motif du rejet:{" "}
                                                        {payment.notes_admin}
                                                    </p>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 ml-5">
                                <History className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-400 font-medium">
                                    Aucun historique de paiement disponible.
                                </p>
                            </div>
                        )}
                    </div>
                </Section>
            </div>

            <div className="flex flex-col gap-6">
                {reservation.statut !== "annule" &&
                    reservation.statut !== "confirme" && (
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
                    )}

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
                                Montant du règlement (MAD)
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
                                Date & Heure du règlement
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="datetime-local"
                                    value={addPaymentForm.data.payment_date}
                                    onChange={(e) =>
                                        addPaymentForm.setData(
                                            "payment_date",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-400/40 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                                Preuve de paiement
                            </label>
                            <div
                                className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/30 overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {previewUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={previewUrl}
                                            className="max-h-24 mx-auto rounded-lg shadow-sm"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity">
                                            <Upload className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-2">
                                        <Upload className="w-5 h-5 text-slate-300 mb-1" />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                            Uploader le justificatif
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                                Notes Additionnelles
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea
                                    value={addPaymentForm.data.notes}
                                    onChange={(e) =>
                                        addPaymentForm.setData(
                                            "notes",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Référence de transaction, banque..."
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-400/40 outline-none min-h-[80px]"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                addPaymentForm.processing ||
                                !addPaymentForm.data.montant ||
                                !addPaymentForm.data.preuve_paiement ||
                                !addPaymentForm.data.payment_date
                            }
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-100"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Valider le règlement
                        </button>
                    </form>
                </Section>
            </div>
        </div>
    );
}
