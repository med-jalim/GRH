import { AdminLayout } from "@/Layouts/AdminLayout";
import { Link, router, useForm } from "@inertiajs/react";
import { ArrowLeft, CreditCard, FileText, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { StatusSelect } from "@/components/ui/status-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// Partials
import DetailsTab from "./Partials/DetailsTab";
import PaymentsTab from "./Partials/PaymentsTab";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Hotel {
    id: number;
    name: string;
    ville: string;
    stars: number;
}

export interface Type {
    id: number;
    name: string;
    nom: string;
}

export interface ItemReservation {
    id: number;
    id_type: number;
    id_group: number | null;
    quantite: number;
    prix_unitaire: number;
    nb_adultes: number;
    nb_enfants: number;
    nb_bebes: number;
    type: Type | null;
}

export interface ReservationGroup {
    id: number;
    date_arrivee: string;
    date_depart: string;
    nb_personnes: number;
    nights: number;
    items: ItemReservation[];
}

export interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    proof_path: string | null;
    provenance: "admin" | "client";
    notes: string | null;
    is_verified: boolean;
    status: "pending" | "verified" | "rejected";
    notes_admin: string | null;
    created_at: string;
}

export interface Reservation {
    id: number;
    code_reference: string;
    nom_agence: string | null;
    code_agence: string | null;
    nom_contact: string;
    email: string;
    telephone: string;
    id_hotel: number;
    date_arrivee: string;
    date_depart: string;
    nb_personnes: number;
    prix_total: number;
    remarques_speciales: string | null;
    statut:
        | "en_attente"
        | "en_verification"
        | "valide"
        | "en_attente_paiement"
        | "paye_partiellement"
        | "confirme"
        | "annule";
    lien_paiement: string | null;
    montant_paye: number | null;
    created_at: string;
    updated_at: string;
    hotel: Hotel | null;
    groups: ReservationGroup[];
    details: ItemReservation[];
    payments: Payment[];
    montant_restant: number;
    pourcentage_paiement: number;
}

interface Props {
    reservation: Reservation;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatPrice(amount: number) {
    return (
        new Intl.NumberFormat("fr-MA", {
            style: "decimal",
            minimumFractionDigits: 0,
        }).format(amount) + " MAD"
    );
}

function nightsBetween(d1: string, d2: string) {
    const diff = new Date(d2).getTime() - new Date(d1).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function ReservationShow({ reservation }: Props) {
    const [activeTab, setActiveTab] = useState<"details" | "payments">(
        "details",
    );
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const nights = nightsBetween(
        reservation.date_arrivee,
        reservation.date_depart,
    );

    const sendLinkForm = useForm({
        lien_paiement: reservation.lien_paiement ?? "",
    });

    const addPaymentForm = useForm<{
        montant: string;
        preuve_paiement: File | null;
        payment_date: string;
        notes: string;
    }>({
        montant: reservation.montant_restant.toString(),
        preuve_paiement: null,
        payment_date: new Date().toISOString().slice(0, 16), // Local datetime-local format
        notes: "",
    });

    // ── Handlers ──

    function handleStatusChange(newStatut: string) {
        if (newStatut === reservation.statut) return;
        setUpdating(true);
        router.patch(
            `/admin/reservations/${reservation.id}/statut`,
            { statut: newStatut },
            {
                preserveState: true,
                onFinish: () => setUpdating(false),
            },
        );
    }

    function handleSendLink(e: React.FormEvent) {
        e.preventDefault();
        sendLinkForm.post(
            `/admin/reservations/${reservation.id}/payment-link`,
            {
                preserveScroll: true,
            },
        );
    }

    function handleAddPayment(e: React.FormEvent) {
        e.preventDefault();
        if (
            !addPaymentForm.data.montant ||
            !addPaymentForm.data.preuve_paiement ||
            !addPaymentForm.data.payment_date
        )
            return;
        addPaymentForm.post(
            `/admin/reservations/${reservation.id}/add-payment`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    addPaymentForm.reset();
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                },
            },
        );
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        addPaymentForm.setData("preuve_paiement", file);
        if (file && file.type.startsWith("image/")) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
    }

    function handleConfirmDelete() {
        setConfirmDelete(false);
        setDeleting(true);
        router.delete(`/admin/reservations/${reservation.id}`);
    }

    function handleVerifyPayment(paymentId: number) {
        router.patch(
            `/admin/payments/${paymentId}/verify`,
            {},
            {
                preserveScroll: true,
            },
        );
    }

    function handleRejectPayment(paymentId: number, notesAdmin: string) {
        if (!notesAdmin) return;
        router.patch(
            `/admin/payments/${paymentId}/reject`,
            {
                notes_admin: notesAdmin,
            },
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <AdminLayout>
            {/* Header / Breadcrumb */}
            <div className="mb-8">
                <Link
                    href="/admin/reservations"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-4 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour aux réservations
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                                Réservation
                            </h1>
                            <span className="font-mono text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-100">
                                {reservation.code_reference}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm">
                            Créée le{" "}
                            {new Date(
                                reservation.created_at,
                            ).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setConfirmDelete(true)}
                            disabled={deleting}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-100 transition-all font-bold"
                            title="Supprimer la réservation"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <StatusSelect
                            value={reservation.statut}
                            loading={updating}
                            onChange={handleStatusChange}
                            size="lg"
                        />
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-2xl mb-8 w-fit border border-slate-200/50">
                <button
                    onClick={() => setActiveTab("details")}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                        activeTab === "details"
                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                >
                    <FileText className="w-4 h-4" />
                    Détails du séjour
                </button>
                <button
                    disabled={
                        reservation.statut === "en_attente" ||
                        reservation.statut === "en_verification" ||
                        reservation.statut === "annule"
                    }
                    onClick={() => setActiveTab("payments")}
                    className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                        activeTab === "payments"
                            ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }
                        ${
                            reservation.statut === "en_attente" ||
                            reservation.statut === "en_verification" ||
                            reservation.statut === "annule"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                >
                    <CreditCard className="w-4 h-4" />
                    Paiements & Suivi
                    {reservation.montant_restant > 0 && (
                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse ml-1" />
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === "details" ? (
                    <DetailsTab
                        reservation={reservation}
                        nights={nights}
                        formatDate={formatDate}
                        formatPrice={formatPrice}
                    />
                ) : (
                    <PaymentsTab
                        reservation={reservation}
                        formatPrice={formatPrice}
                        sendLinkForm={sendLinkForm}
                        addPaymentForm={addPaymentForm}
                        handleSendLink={handleSendLink}
                        handleAddPayment={handleAddPayment}
                        handleFileChange={handleFileChange}
                        previewUrl={previewUrl}
                        fileInputRef={fileInputRef}
                        handleVerifyPayment={handleVerifyPayment}
                        handleRejectPayment={handleRejectPayment}
                    />
                )}
            </div>

            <ConfirmDialog
                isOpen={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleConfirmDelete}
                isLoading={deleting}
                title="Supprimer la réservation"
                description={`Êtes-vous sûr de vouloir supprimer définitivement la réservation ${reservation.code_reference} ? Cette action est irréversible.`}
                confirmLabel="Supprimer définitivement"
                variant="danger"
            />
        </AdminLayout>
    );
}
