import { useState, useMemo, useEffect } from "react";
import { Head, useForm, router, Link } from "@inertiajs/react";
import {
    Calendar,
    Users,
    Hotel,
    ChevronRight,
    Edit3,
    CheckCircle2,
    XCircle,
    Info,
    ArrowLeft,
    Save,
    MapPin,
    Phone,
    Mail,
    Star,
    ShieldCheck,
    CreditCard,
    Sparkles,
    AlertCircle,
    Clock,
    Building2,
    Receipt,
    Check,
    Eye,
    Plus,
    Trash2,
    MoveRight,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import axios from "axios";

interface ItemReservation {
    id?: number;
    id_type: number;
    quantite: number;
    prix_unitaire: number;
    nb_adultes: number;
    nb_enfants: number;
    nb_bebes: number;
    nom?: string;
    type?: {
        id: number;
        nom: string;
    };
}

interface ReservationGroup {
    id: number;
    date_arrivee: string;
    date_depart: string;
    nb_personnes: number;
    items: ItemReservation[];
}

interface Tarif {
    id: number;
    id_type: number;
    prix: number;
    date_debut: string;
    date_fin: string;
    type: {
        id: number;
        nom: string;
    };
}

interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    proof_path: string;
    provenance: string;
    notes?: string;
    is_verified: boolean;
    status: 'pending' | 'verified' | 'rejected';
    notes_admin?: string;
    created_at: string;
}

interface Reservation {
    id: number;
    code_reference: string;
    nom_contact: string;
    email: string;
    telephone: string;
    date_arrivee: string;
    date_depart: string;
    nb_personnes: number;
    prix_total: number;
    montant_paye?: number;
    lien_paiement?: string;
    statut: string;
    hotel: {
        id: number;
        name: string;
        ville: string;
        tarifs: Tarif[];
    };
    groups: ReservationGroup[];
    details: ItemReservation[]; // Keep for backward compatibility if needed, but primary is groups
    payments: Payment[];
}

interface Props {
    reservation: Reservation;
    token: string;
    confirm_url: string;
    update_url: string;
    payment_url: string;
}

const ProcessTimeline = ({ currentStatus }: { currentStatus: string }) => {
    const steps = [
        { id: "en_attente", label: "Demande", icon: Clock },
        { id: "en_verification", label: "Vérification", icon: Eye },
        { id: "valide", label: "Confirmation", icon: CheckCircle2 },
        { id: "en_attente_paiement", label: "Paiement", icon: CreditCard },
    ];

    const getStatusIndex = (status: string) => {
        if (status === "en_attente") return 0;
        if (status === "en_verification") return 1;
        if (status === "valide") return 2;
        if (
            status === "en_attente_paiement" ||
            status === "paye_partiellement" ||
            status === "paye"
        )
            return 3;
        return 0;
    };

    const currentIndex = getStatusIndex(currentStatus);

    return (
        <div className="relative flex justify-between items-center max-w-2xl mx-auto mb-12">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
            <div
                className="absolute top-1/2 left-0 h-0.5 bg-amber-500 -translate-y-1/2 -z-10 transition-all duration-1000"
                style={{
                    width: `${(currentIndex / (steps.length - 1)) * 100}%`,
                }}
            />

            {steps.map((step, idx) => {
                const isCompleted = idx < currentIndex;
                const isActive = idx === currentIndex;
                const Icon = step.icon;

                return (
                    <div
                        key={step.id}
                        className="flex flex-col items-center gap-2"
                    >
                        <div
                            className={`
                            w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                            ${
                                isCompleted
                                    ? "bg-amber-500 border-amber-500 text-white"
                                    : isActive
                                      ? "bg-white border-amber-500 text-amber-500 shadow-lg shadow-amber-500/20"
                                      : "bg-white border-slate-200 text-slate-400"
                            }
                        `}
                        >
                            {isCompleted ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <Icon className="w-5 h-5" />
                            )}
                        </div>
                        <span
                            className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-slate-900" : "text-slate-400"}`}
                        >
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const PaymentSection = ({
    reservation,
    paymentUrl,
}: {
    reservation: Reservation;
    paymentUrl: string;
}) => {
    const [showUpload, setShowUpload] = useState(false);
    const montantPaye = reservation.montant_paye || 0;
    const resteAPayer = Math.max(0, reservation.prix_total - montantPaye);

    const { data, setData, post, processing, reset, errors } = useForm({
        amount: resteAPayer.toString(),
        preuve_paiement: null as File | null,
        notes: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(paymentUrl, {
            onSuccess: () => {
                setShowUpload(false);
                reset();
            },
        });
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Totals Grid */}
            <div className="bg-white rounded-2xl border border-amber-200 shadow-lg shadow-amber-500/5 overflow-hidden">
                <div className="p-6 border-b border-amber-100 flex items-center gap-3 bg-amber-50/30">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                        <CreditCard className="w-4 h-4" />
                    </div>
                    <h2 className="font-bold text-slate-900 uppercase tracking-tight text-sm">
                        Informations de Paiement
                    </h2>
                </div>
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Montant Total
                            </p>
                            <p className="text-xl font-black text-slate-900">
                                {reservation.prix_total.toLocaleString("fr-FR")}{" "}
                                <span className="text-sm font-bold text-slate-400">
                                    MAD
                                </span>
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Montant Validé
                            </p>
                            <p className="text-xl font-black text-emerald-600">
                                {montantPaye.toLocaleString("fr-FR")}{" "}
                                <span className="text-sm font-bold text-emerald-600/30">
                                    MAD
                                </span>
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Reste à Payer
                            </p>
                            <p
                                className={`text-xl font-black ${resteAPayer > 0 ? "text-amber-500" : "text-emerald-600"}`}
                            >
                                {resteAPayer.toLocaleString("fr-FR")}{" "}
                                <span className="text-sm font-bold text-slate-300">
                                    MAD
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        {resteAPayer > 0 ? (
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1 text-center md:text-left">
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        Vous pouvez régler le solde via le lien
                                        de paiement en ligne (si disponible) ou
                                        en nous envoyant votre preuve de payment
                                        directement ci-dessous.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {reservation.lien_paiement && (
                                        <a
                                            href={reservation.lien_paiement}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                                        >
                                            Payer en ligne
                                            <MoveRight className="w-3 h-3" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() =>
                                            setShowUpload(!showUpload)
                                        }
                                        className="flex-1 md:flex-none px-6 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Envoyer une preuve
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3 text-emerald-700">
                                <CheckCircle2 className="w-5 h-5" />
                                <p className="text-xs font-bold uppercase tracking-tight">
                                    Réservation entièrement réglée
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upload Form */}
                    {showUpload && (
                        <div className="mt-8 p-8 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top-4 duration-300">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Montant versé (MAD)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={data.amount}
                                            onChange={(e) =>
                                                setData(
                                                    "amount",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none font-bold"
                                        />
                                        {errors.amount && (
                                            <p className="text-rose-500 text-[10px] font-bold">
                                                {errors.amount}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Preuve de paiement (IMG/PDF)
                                        </label>
                                        <input
                                            type="file"
                                            required
                                            onChange={(e) =>
                                                setData(
                                                    "preuve_paiement",
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 transition-all cursor-pointer"
                                        />
                                        {errors.preuve_paiement && (
                                            <p className="text-rose-500 text-[10px] font-bold">
                                                {errors.preuve_paiement}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Notes ou précisions (optionnel)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData("notes", e.target.value)
                                        }
                                        placeholder="Ex: Virement effectué depuis le compte de M. X..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none text-sm font-medium"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowUpload(false)}
                                        className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-8 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {processing ? (
                                            "Envoi en cours..."
                                        ) : (
                                            <>
                                                Confirmer l'envoi
                                                <Save className="w-3 h-3" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment History */}
            {reservation.payments && reservation.payments.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                        <Receipt className="w-5 h-5 text-slate-400" />
                        <h2 className="font-bold text-slate-900 uppercase tracking-tight text-sm">
                            Historique des versements
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                    <th className="px-8 py-4">Date Sub</th>
                                    <th className="px-8 py-4">Montant</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Preuve</th>
                                    <th className="px-8 py-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reservation.payments.map((p) => (
                                    <tr key={p.id} className="group">
                                        <td className="px-8 py-4 text-xs font-bold text-slate-600">
                                            {format(
                                                new Date(p.created_at),
                                                "dd/MM/yyyy HH:mm",
                                            )}
                                        </td>
                                        <td className="px-8 py-4 font-black text-slate-900">
                                            {p.amount.toLocaleString("fr-FR")}{" "}
                                            MAD
                                        </td>
                                        <td className="px-8 py-4">
                                            <div
                                                className={`
                                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                                            ${
                                                p.status === "verified"
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    : p.status === "rejected"
                                                      ? "bg-rose-50 text-rose-600 border-rose-100"
                                                      : "bg-blue-50 text-blue-600 border-blue-100"
                                            }
                                        `}
                                            >
                                                {p.status === "pending" && (
                                                    <Clock className="w-3 h-3" />
                                                )}
                                                {p.status === "verified" && (
                                                    <Check className="w-3 h-3" />
                                                )}
                                                {p.status === "rejected" && (
                                                    <XCircle className="w-3 h-3" />
                                                )}
                                                {p.status === "pending"
                                                    ? "En attente"
                                                    : p.status === "verified"
                                                      ? "Validé"
                                                      : "Refusé"}
                                            </div>
                                            {p.status === "rejected" &&
                                                p.notes_admin && (
                                                    <p className="text-[10px] text-rose-400 font-bold mt-1 max-w-[200px]">
                                                        ⚠️ {p.notes_admin}
                                                    </p>
                                                )}
                                        </td>
                                        <td className="px-8 py-4">
                                            <a
                                                href={`/storage/${p.proof_path}`}
                                                target="_blank"
                                                className="text-amber-500 hover:text-amber-600"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                        </td>
                                        <td className="px-8 py-4 text-xs text-slate-500 font-medium italic">
                                            {p.notes || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const OccupantStepper = ({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (v: number) => void; min?: number }) => (
    <div className="flex items-center gap-2">
        <span className="text-xs">{label}</span>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 scale-90 origin-left">
            <button
                type="button"
                onClick={() => onChange(Math.max(min, value - 1))}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-50 hover:bg-slate-100 text-[10px] font-bold transition-colors"
            >
                -
            </button>
            <span className="text-[10px] font-black w-3 text-center">{value}</span>
            <button
                type="button"
                onClick={() => onChange(value + 1)}
                className="w-5 h-5 flex items-center justify-center rounded bg-slate-50 hover:bg-slate-100 text-[10px] font-bold transition-colors"
            >
                +
            </button>
        </div>
    </div>
);

export default function Verify({
    reservation,
    token,
    confirm_url,
    update_url,
    payment_url,
}: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showAddRoom, setShowAddRoom] = useState(false);

    // Ensure dates are string YYYY-MM-DD for input[type="date"]
    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return "";
        return dateStr.split("T")[0];
    };

    const { data, setData, post, processing, errors } = useForm({
        groups: reservation.groups.map((g) => ({
            id: g.id,
            date_arrivee: formatDateForInput(g.date_arrivee),
            date_depart: formatDateForInput(g.date_depart),
            nb_personnes: g.nb_personnes,
            items: g.items.map((i) => ({
                id_type: i.id_type,
                quantite: i.quantite,
                prix_unitaire: i.prix_unitaire,
                nb_adultes: i.nb_adultes || 2,
                nb_enfants: i.nb_enfants || 0,
                nb_bebes: i.nb_bebes || 0,
                nom: i.nom || i.type?.nom || "Inconnu",
            })),
        })),
    });


        // Sync unit prices when arrival date changes
        // This logic needs to be per-group now. Skipping for now as it's complex 
        // to do in a simple useEffect, better handled within GroupEdit component.

    const getGroupNights = (date_arrivee: string, date_depart: string) => {
        if (!date_arrivee || !date_depart) return 0;
        const start = new Date(date_arrivee);
        const end = new Date(date_depart);
        return Math.max(1, differenceInDays(end, start));
    };

    const calculatedTotal = useMemo(() => {
        if (!isEditing) return reservation.prix_total;
        return data.groups.reduce((total, group) => {
            const groupNights = getGroupNights(group.date_arrivee, group.date_depart);
            const groupTotal = group.items.reduce(
                (sum, item) => sum + item.quantite * item.prix_unitaire * groupNights,
                0,
            );
            return total + groupTotal;
        }, 0);
    }, [isEditing, data.groups, reservation.prix_total]);

    const handleConfirm = () => {
        router.post(
            confirm_url,
            {},
            {
                onSuccess: () =>
                    setSuccessMessage(
                        "Votre réservation a été confirmée avec succès !",
                    ),
            },
        );
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const hasRooms = data.groups.some(g => g.items.length > 0);
        if (!hasRooms) {
            alert("Veuillez ajouter au moins une chambre dans l'un des groupes.");
            return;
        }
        setSubmitting(true);
        try {
            const response = await axios.put(
                update_url,
                data,
            );
            if (response.data.success) {
                window.location.reload();
            }
        } catch (err) {
            console.error(err);
            alert("Une erreur est survenue lors de la mise à jour.");
        } finally {
            setSubmitting(false);
        }
    };

    const updateGroupItemQuantity = (groupIndex: number, itemIndex: number, qty: number) => {
        const newGroups = [...data.groups];
        newGroups[groupIndex].items[itemIndex].quantite = Math.max(1, qty);
        
        // Recalculate total persons for this group
        newGroups[groupIndex].nb_personnes = newGroups[groupIndex].items.reduce((total, i) => {
            return total + (i.nb_adultes + i.nb_enfants + i.nb_bebes) * i.quantite;
        }, 0);
        
        setData("groups", newGroups);
    };

    const removeGroupItem = (groupIndex: number, itemIndex: number) => {
        const newGroups = [...data.groups];
        newGroups[groupIndex].items.splice(itemIndex, 1);
        setData("groups", newGroups);
    };

    const updateGroupItemOccupant = (groupIndex: number, itemIndex: number, field: string, value: number) => {
        const newGroups = [...data.groups];
        const item = newGroups[groupIndex].items[itemIndex] as any;
        item[field] = Math.max(0, value);
        
        // Recalculate total persons for this group
        newGroups[groupIndex].nb_personnes = newGroups[groupIndex].items.reduce((total, i) => {
            return total + (i.nb_adultes + i.nb_enfants + i.nb_bebes) * i.quantite;
        }, 0);
        
        setData("groups", newGroups);
    };

    const addGroupItem = (groupIndex: number, tarif: Tarif) => {
        const newGroups = [...data.groups];
        const group = newGroups[groupIndex];
        const exists = group.items.find(i => i.id_type === tarif.id_type);

        if (exists) {
            exists.quantite += 1;
        } else {
            group.items.push({
                id_type: tarif.id_type,
                quantite: 1,
                prix_unitaire: tarif.prix,
                nb_adultes: 2, // Default to 2 adults as a reasonable starting point
                nb_enfants: 0,
                nb_bebes: 0,
                nom: tarif.type.nom
            });
        }
        
        // Recalculate total persons for this group
        newGroups[groupIndex].nb_personnes = newGroups[groupIndex].items.reduce((total, i) => {
            return total + (i.nb_adultes + i.nb_enfants + i.nb_bebes) * i.quantite;
        }, 0);
        
        setData("groups", newGroups);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-100 selection:text-amber-900">
            <Head title={`Vérification - ${reservation.code_reference}`} />

            {/* Top Navigation / Brand */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
                            <span className="text-white font-black text-xs">
                                GRH
                            </span>
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm leading-none uppercase tracking-tight">
                                Groupe Résidences Hôtelières
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                                Espace Client Privé
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Besoin d'aide ?
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                                +212 5 22 XX XX XX
                            </span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block" />
                        <div
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border 
                            ${reservation.statut === "en_verification" ? "bg-blue-50 text-blue-600 border-blue-100" : 
                              reservation.statut === "en_attente_paiement" || reservation.statut === "paye_partiellement" ? "bg-amber-50 text-amber-600 border-amber-100" :
                              reservation.statut === "paye" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              "bg-slate-100 text-slate-600 border-slate-200"}
                        `}
                        >
                            {reservation.statut === "en_verification"
                                ? "Devis à Valider"
                                : reservation.statut === "en_attente_paiement"
                                ? "En attente de paiement"
                                : reservation.statut === "paye_partiellement"
                                ? "Payé Partiellement"
                                : reservation.statut === "paye"
                                ? "Payé"
                                : reservation.statut}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <ProcessTimeline currentStatus={reservation.statut} />

                    <div className="text-center space-y-2">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
                            Dossier de réservation{" "}
                            <span className="text-amber-500">
                                #{reservation.code_reference}
                            </span>
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {reservation.nom_contact}, veuillez vérifier les
                            détails de votre devis pour validation finale.
                        </p>
                    </div>
                </div>

                {successMessage && (
                    <div className="mb-12 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 text-emerald-800 animate-in zoom-in-95">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="font-bold">{successMessage}</p>
                    </div>
                )}

                {/* Financial Summary & Payment Section */}
                {(reservation.statut === "en_attente_paiement" || 
                  reservation.statut === "paye_partiellement" || 
                  reservation.statut === "paye") && (
                    <div className="mb-12">
                        <PaymentSection reservation={reservation} paymentUrl={payment_url} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Details & Prestations */}
                    <div className="lg:col-span-2 space-y-8">
                        {(isEditing ? data.groups : reservation.groups).map((group, gIdx) => (
                            <div key={group.id || gIdx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs">
                                            {gIdx + 1}
                                        </div>
                                        <h2 className="font-bold text-slate-900 uppercase tracking-tight text-sm">
                                            Séjour Groupe {gIdx + 1}
                                        </h2>
                                    </div>
                                    {isEditing && (
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[9px] font-black uppercase rounded border border-amber-100">
                                            Édition Active
                                        </span>
                                    )}
                                </div>
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Hotel className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                                    Établissement
                                                </p>
                                                <p className="font-bold text-slate-900">
                                                    {reservation.hotel.name}
                                                </p>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {reservation.hotel.ville}, Maroc
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Users className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                                    Voyageurs (Total)
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {(() => {
                                                        const groupItems = isEditing ? group.items : group.items;
                                                        const a = groupItems.reduce((acc, i) => acc + (i.nb_adultes || 0) * i.quantite, 0);
                                                        const e = groupItems.reduce((acc, i) => acc + (i.nb_enfants || 0) * i.quantite, 0);
                                                        const b = groupItems.reduce((acc, i) => acc + (i.nb_bebes || 0) * i.quantite, 0);
                                                        return (
                                                            <>
                                                                <span title="Adultes" className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">Ad. {a}</span>
                                                                {e > 0 && <span title="Enfants" className="px-2 py-0.5 bg-sky-50 rounded-md text-[10px] font-bold text-sky-600">Enf. {e}</span>}
                                                                {b > 0 && <span title="Bébés" className="px-2 py-0.5 bg-pink-50 rounded-md text-[10px] font-bold text-pink-600">Béb. {b}</span>}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                        Arrivée
                                                    </p>
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            value={group.date_arrivee}
                                                            onChange={(e) => {
                                                                const newGroups = [...data.groups];
                                                                newGroups[gIdx].date_arrivee = e.target.value;
                                                                setData("groups", newGroups);
                                                            }}
                                                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 outline-none"
                                                        />
                                                    ) : (
                                                        <p className="font-bold text-slate-900">
                                                            {format(new Date(group.date_arrivee), "dd MMM yyyy", { locale: fr })}
                                                        </p>
                                                    )}
                                                </div>
                                                <MoveRight className="w-4 h-4 text-slate-300 mx-2 mt-4" />
                                                <div className="flex-1 text-right">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                        Départ
                                                    </p>
                                                    {isEditing ? (
                                                        <input
                                                            type="date"
                                                            value={group.date_depart}
                                                            onChange={(e) => {
                                                                const newGroups = [...data.groups];
                                                                newGroups[gIdx].date_depart = e.target.value;
                                                                setData("groups", newGroups);
                                                            }}
                                                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 outline-none text-right"
                                                        />
                                                    ) : (
                                                        <p className="font-bold text-slate-900">
                                                            {format(new Date(group.date_depart), "dd MMM yyyy", { locale: fr })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-xs font-bold text-slate-700">
                                                    {getGroupNights(group.date_arrivee, group.date_depart)} Nuits
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto border-t border-slate-100">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left">
                                                <th className="px-8 py-4">Hébergement</th>
                                                <th className="px-8 py-4 text-center">Quantité</th>
                                                <th className="px-8 py-4 text-right">P.U / Nuit</th>
                                                <th className="px-8 py-4 text-right">Sous-total</th>
                                                {isEditing && <th className="px-8 py-4 text-right">Action</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {group.items.map((item, iIdx) => (
                                                <tr key={iIdx} className="group hover:bg-slate-50/30 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                                                    <Hotel className="w-4 h-4 text-slate-400" />
                                                                </div>
                                                                <span className="font-bold text-slate-900 leading-tight">
                                                                    {item.nom || item.type?.nom}
                                                                </span>
                                                            </div>
                                                            
                                                            {/* Occupants breakdown */}
                                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                                {isEditing ? (
                                                                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-wrap gap-x-4 gap-y-2">
                                                                        <OccupantStepper 
                                                                            label="Adultes" 
                                                                            value={item.nb_adultes} 
                                                                            onChange={(v) => updateGroupItemOccupant(gIdx, iIdx, 'nb_adultes', v)}
                                                                            min={1}
                                                                        />
                                                                        <OccupantStepper 
                                                                            label="Enfants" 
                                                                            value={item.nb_enfants} 
                                                                            onChange={(v) => updateGroupItemOccupant(gIdx, iIdx, 'nb_enfants', v)}
                                                                        />
                                                                        <OccupantStepper 
                                                                            label="Bébés" 
                                                                            value={item.nb_bebes} 
                                                                            onChange={(v) => updateGroupItemOccupant(gIdx, iIdx, 'nb_bebes', v)}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <span title="Adultes" className="flex items-center gap-1 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md font-bold text-slate-600">Ad. {item.nb_adultes}</span>
                                                                        <span title="Enfants" className="flex items-center gap-1 text-[10px] bg-sky-50 px-1.5 py-0.5 rounded-md font-bold text-sky-600">Enf. {item.nb_enfants}</span>
                                                                        <span title="Bébés" className="flex items-center gap-1 text-[10px] bg-pink-50 px-1.5 py-0.5 rounded-md font-bold text-pink-600">Béb. {item.nb_bebes}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        {isEditing ? (
                                                            <div className="flex items-center justify-center gap-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateGroupItemQuantity(gIdx, iIdx, item.quantite - 1)}
                                                                    className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
                                                                >-</button>
                                                                <span className="w-4 text-center font-bold">{item.quantite}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateGroupItemQuantity(gIdx, iIdx, item.quantite + 1)}
                                                                    className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
                                                                >+</button>
                                                            </div>
                                                        ) : (
                                                            <p className="text-center font-bold text-slate-900">
                                                                x{item.quantite}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6 text-right font-medium text-slate-600">
                                                        {item.prix_unitaire.toLocaleString("fr-FR")} MAD
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className="font-bold text-slate-900">
                                                            {(item.quantite * item.prix_unitaire * getGroupNights(group.date_arrivee, group.date_depart)).toLocaleString("fr-FR")} MAD
                                                        </span>
                                                    </td>
                                                    {isEditing && (
                                                        <td className="px-8 py-6 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeGroupItem(gIdx, iIdx)}
                                                                className="w-9 h-9 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {isEditing && (
                                                <tr>
                                                    <td colSpan={5} className="px-8 py-4 bg-slate-50/50">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAddRoom(showAddRoom === gIdx ? null : gIdx)}
                                                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            {showAddRoom === gIdx ? "Annuler l'ajout" : "+ Ajouter une chambre à ce groupe"}
                                                        </button>
                                                        {showAddRoom === gIdx && (
                                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 animate-in zoom-in-95">
                                                                {reservation.hotel.tarifs
                                                                    .filter(t => {
                                                                        const cin = new Date(group.date_arrivee);
                                                                        return new Date(t.date_debut) <= cin && new Date(t.date_fin) >= cin;
                                                                    })
                                                                    .map(t => (
                                                                        <button
                                                                            key={t.id}
                                                                            onClick={() => {
                                                                                addGroupItem(gIdx, t);
                                                                                setShowAddRoom(null);
                                                                            }}
                                                                            className="p-3 bg-white border border-slate-100 rounded-xl text-left hover:border-amber-400 transition-all group"
                                                                        >
                                                                            <p className="font-bold text-slate-900 text-[11px] group-hover:text-amber-600">{t.type.nom}</p>
                                                                            <p className="text-[10px] text-slate-400 font-medium">{t.prix.toLocaleString("fr-FR")} MAD / Nuit</p>
                                                                        </button>
                                                                    ))
                                                                }
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}


                    </div>

                    {/* Right Column: Sidebar / Total */}
                    <div className="space-y-8 sticky top-28">
                        <div className="bg-white rounded-2xl border border-slate-900 shadow-xl overflow-hidden">
                            <div className="p-6 bg-slate-900 text-white">
                                <h3 className="font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-amber-500" />
                                    Récapitulatif Financier
                                </h3>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">
                                            Prix des chambres
                                        </span>
                                        <span className="text-slate-900 font-bold">
                                            {calculatedTotal.toLocaleString(
                                                "fr-FR",
                                            )}{" "}
                                            MAD
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">
                                            Taxes & Frais
                                        </span>
                                        <span className="text-emerald-600 font-bold uppercase text-[10px]">
                                            Inclus
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                                        <p className="text-xs font-black text-slate-900 uppercase">
                                            Total T.T.C
                                        </p>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-slate-900 tracking-tight">
                                                {calculatedTotal.toLocaleString(
                                                    "fr-FR",
                                                )}{" "}
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    MAD
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                                            Garantie GRH Premium
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                        Ce devis est ferme et définitif après
                                        acceptation administrative.
                                    </p>
                                </div>

                                {!isEditing ? (
                                    <div className="space-y-4 pt-4">
                                        {reservation.statut === "en_verification" ? (
                                            <>
                                                <button
                                                    onClick={handleConfirm}
                                                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all text-slate-900 font-black rounded-xl shadow-lg shadow-amber-500/20 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                                >
                                                    Accepter le devis{" "}
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setIsEditing(true)
                                                    }
                                                    className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Edit3 className="w-4 h-4" />{" "}
                                                    Modifier ma demande
                                                </button>
                                            </>
                                        ) : reservation.statut === "en_attente_paiement" || reservation.statut === "paye_partiellement" ? (
                                            <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl text-amber-900">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <CreditCard className="w-4 h-4 text-amber-600" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Action Requise</p>
                                                </div>
                                                <p className="text-xs font-bold leading-relaxed mb-3">
                                                    Veuillez procéder au règlement pour confirmer définitivement votre séjour.
                                                </p>
                                                <p className="text-[10px] opacity-70 leading-relaxed font-medium">
                                                    Utilisez le bouton dans la section "Informations de Paiement" pour accéder au portail sécurisé.
                                                </p>
                                            </div>
                                        ) : reservation.statut === "paye" ? (
                                            <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-900">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Félicitations</p>
                                                </div>
                                                <p className="text-xs font-bold leading-relaxed mb-1">
                                                    Votre séjour est confirmé.
                                                </p>
                                                <p className="text-[10px] opacity-70 leading-relaxed font-medium">
                                                    Un conseiller prendra contact avec vous prochainement pour les détails de bienvenue.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-center">
                                                <p className="text-xs font-bold uppercase tracking-widest mb-1 italic">
                                                     Analyse en cours...
                                                </p>
                                                <p className="text-[10px] leading-relaxed">
                                                     Un agent GRH traite votre demande de modification.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3 pt-4">
                                        <button
                                            onClick={handleUpdateSubmit}
                                            disabled={submitting}
                                            className="w-full py-4 bg-slate-900 hover:bg-black text-white font-black rounded-xl uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            {submitting
                                                ? "Mise à jour..."
                                                : "Renvoyer pour revue"}{" "}
                                            <Save className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setShowAddRoom(false);
                                            }}
                                            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="flex flex-col items-center gap-6 text-center">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                    <ShieldCheck className="w-6 h-6 text-slate-400" />
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                                    <CreditCard className="w-6 h-6 text-slate-400" />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] max-w-[200px] leading-loose">
                                Plateforme de réservation sécurisée par cryptage
                                de bout en bout.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="mt-24 pt-8 border-t border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
                        Groupe Résidences Hôtelières © 2026 · Excellence &
                        Prestige
                    </p>
                </footer>
            </main>
        </div>
    );
}
