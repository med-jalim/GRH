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

interface RoomDetail {
    id?: number;
    id_type: number;
    quantite: number;
    prix_unitaire: number;
    nom: string;
    type?: {
        id: number;
        nom: string;
    };
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
    details: RoomDetail[];
}

interface Props {
    reservation: Reservation;
    token: string;
    confirm_url: string;
    update_url: string;
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

const PaymentSection = ({ reservation }: { reservation: Reservation }) => {
    const montantPaye = reservation.montant_paye || 0;
    const resteAPayer = Math.max(0, reservation.prix_total - montantPaye);
    const isReadyForPayment = reservation.statut === "en_attente_paiement" || reservation.statut === "paye_partiellement";

    return (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-lg shadow-amber-500/5 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-amber-100 flex items-center gap-3 bg-amber-50/30">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                    <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900 uppercase tracking-tight text-sm">
                    Informations de Paiement
                </h2>
            </div>
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Montant Total</p>
                        <p className="text-xl font-black text-slate-900">
                            {reservation.prix_total.toLocaleString("fr-FR")} <span className="text-sm font-bold text-slate-400">MAD</span>
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Montant Payé</p>
                        <p className="text-xl font-black text-emerald-600">
                            {montantPaye.toLocaleString("fr-FR")} <span className="text-sm font-bold text-emerald-200 text-emerald-600/30">MAD</span>
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reste à Payer</p>
                        <p className={`text-xl font-black ${resteAPayer > 0 ? "text-amber-500" : "text-emerald-600"}`}>
                            {resteAPayer.toLocaleString("fr-FR")} <span className="text-sm font-bold text-slate-300">MAD</span>
                        </p>
                    </div>
                </div>

                {isReadyForPayment && reservation.lien_paiement ? (
                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 items-center gap-6 flex flex-col md:flex-row text-center md:text-left">
                        <div className="flex-1">
                            <h3 className="font-bold text-amber-900 mb-1">Paiement Sécurisé en Ligne</h3>
                            <p className="text-xs text-amber-700 font-medium">
                                Votre lien de paiement est prêt. Cliquez sur le bouton pour finaliser votre réservation en toute sécurité.
                            </p>
                        </div>
                        <a
                            href={reservation.lien_paiement}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <CreditCard className="w-4 h-4" />
                            Procéder au Paiement
                            <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                ) : reservation.statut === "paye" ? (
                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4 text-emerald-800">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                            <Check className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold">Réservation Entièrement Réglée</p>
                            <p className="text-xs font-medium opacity-80">Nous avons bien reçu la totalité de votre paiement. Merci de votre confiance.</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 text-slate-600">
                        <Clock className="w-5 h-5 text-slate-400" />
                        <p className="text-xs font-medium">Votre lien de paiement sera généré une fois que l'administrateur aura validé définitivement votre dossier.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Verify({ reservation, token, confirm_url, update_url }: Props) {
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
        date_arrivee: formatDateForInput(reservation.date_arrivee),
        date_depart: formatDateForInput(reservation.date_depart),
        nb_personnes: reservation.nb_personnes,
        details: reservation.details.map((d) => ({
            id_type: d.id_type,
            quantite: d.quantite,
            prix_unitaire: d.prix_unitaire,
            nom: d.nom || d.type?.nom || "Inconnu",
        })),
    });

    // Available tarifs filtered by arrival date
    const availableTarifs = useMemo(() => {
        if (!data.date_arrivee) return [];
        const checkIn = new Date(data.date_arrivee);
        return reservation.hotel.tarifs.filter((t) => {
            const start = new Date(t.date_debut);
            const end = new Date(t.date_fin);
            return start <= checkIn && end >= checkIn;
        });
    }, [data.date_arrivee, reservation.hotel.tarifs]);

    // Sync unit prices when arrival date changes
    useEffect(() => {
        if (!isEditing || !data.date_arrivee) return;

        const checkIn = new Date(data.date_arrivee);
        const updatedDetails = data.details.map((detail) => {
            const matchingTarif = reservation.hotel.tarifs.find((t) => {
                const start = new Date(t.date_debut);
                const end = new Date(t.date_fin);
                return (
                    t.id_type === detail.id_type &&
                    start <= checkIn &&
                    end >= checkIn
                );
            });

            if (matchingTarif && matchingTarif.prix !== detail.prix_unitaire) {
                return { ...detail, prix_unitaire: matchingTarif.prix };
            }
            return detail;
        });

        // Only update if there are changes to avoid infinite loop
        const hasChange =
            JSON.stringify(updatedDetails) !== JSON.stringify(data.details);
        if (hasChange) {
            setData("details", updatedDetails);
        }
    }, [data.date_arrivee, reservation.hotel.tarifs, isEditing]);

    const nights = useMemo(() => {
        const start = new Date(
            isEditing ? data.date_arrivee : reservation.date_arrivee,
        );
        const end = new Date(
            isEditing ? data.date_depart : reservation.date_depart,
        );
        return Math.max(1, differenceInDays(end, start));
    }, [isEditing, data.date_arrivee, data.date_depart, reservation]);

    const calculatedTotal = useMemo(() => {
        if (!isEditing) return reservation.prix_total;
        return data.details.reduce(
            (sum, item) => sum + item.quantite * item.prix_unitaire * nights,
            0,
        );
    }, [isEditing, data.details, nights, reservation.prix_total]);

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
        if (data.details.length === 0) {
            alert("Veuillez ajouter au moins une chambre.");
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

    const updateQuantity = (typeId: number, qty: number) => {
        setData(
            "details",
            data.details.map((d) =>
                d.id_type === typeId ? { ...d, quantite: Math.max(1, qty) } : d,
            ),
        );
    };

    const removeRoom = (index: number) => {
        setData(
            "details",
            data.details.filter((_, i) => i !== index),
        );
    };

    const addRoomType = (tarif: Tarif) => {
        // Check if already exists
        const exists = data.details.some((d) => d.id_type === tarif.id_type);
        if (exists) {
            updateQuantity(
                tarif.id_type,
                data.details.find((d) => d.id_type === tarif.id_type)!
                    .quantite + 1,
            );
        } else {
            setData("details", [
                ...data.details,
                {
                    id_type: tarif.id_type,
                    quantite: 1,
                    prix_unitaire: tarif.prix,
                    nom: tarif.type.nom,
                },
            ]);
        }
        setShowAddRoom(false);
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
                        <PaymentSection reservation={reservation} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Details & Prestations */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                <Building2 className="w-5 h-5 text-slate-400" />
                                <h2 className="font-bold text-slate-900 uppercase tracking-tight text-sm">
                                    Informations de séjour
                                </h2>
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
                                                Voyageurs
                                            </p>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={data.nb_personnes}
                                                    onChange={(e) =>
                                                        setData(
                                                            "nb_personnes",
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className="w-20 mt-1 px-3 py-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-bold"
                                                />
                                            ) : (
                                                <p className="font-bold text-slate-900">
                                                    {reservation.nb_personnes}{" "}
                                                    Personnes
                                                </p>
                                            )}
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
                                                        value={
                                                            data.date_arrivee
                                                        }
                                                        onChange={(e) =>
                                                            setData(
                                                                "date_arrivee",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                                    />
                                                ) : (
                                                    <p className="font-bold text-slate-900">
                                                        {format(
                                                            new Date(
                                                                reservation.date_arrivee,
                                                            ),
                                                            "dd MMM yyyy",
                                                            { locale: fr },
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <ArrowLeft className="w-4 h-4 text-slate-300 rotate-180 mx-2 mt-4" />
                                            <div className="flex-1 text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                    Départ
                                                </p>
                                                {isEditing ? (
                                                    <input
                                                        type="date"
                                                        value={data.date_depart}
                                                        onChange={(e) =>
                                                            setData(
                                                                "date_depart",
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-right"
                                                    />
                                                ) : (
                                                    <p className="font-bold text-slate-900">
                                                        {format(
                                                            new Date(
                                                                reservation.date_depart,
                                                            ),
                                                            "dd MMM yyyy",
                                                            { locale: fr },
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-200 flex items-center justify-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                                            <span className="text-xs font-bold text-slate-700">
                                                {nights} Nuits
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Prestations Table */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <Receipt className="w-5 h-5 text-slate-400" />
                                    <h2 className="font-bold text-slate-900 uppercase tracking-tight text-sm">
                                        Détail des prestations
                                    </h2>
                                </div>
                                {isEditing && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAddRoom(!showAddRoom)
                                            }
                                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 shadow-sm active:scale-95 ${showAddRoom ? "bg-slate-200 text-slate-700" : "bg-slate-900 text-white hover:bg-black"}`}
                                        >
                                            {showAddRoom ? (
                                                "Fermer"
                                            ) : (
                                                <>
                                                    <Plus className="w-3.5 h-3.5" />{" "}
                                                    Ajouter une chambre
                                                </>
                                            )}
                                        </button>
                                        <div className="w-px h-6 bg-slate-200" />
                                        <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-md animate-pulse">
                                            Modification active
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Add Room Selector */}
                            {isEditing && showAddRoom && (
                                <div className="p-6 bg-slate-50/80 border-b border-slate-100 animate-in slide-in-from-top-4 duration-300">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                        Sélectionnez un type de chambre
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {availableTarifs.length > 0 ? (
                                            availableTarifs.map((tarif) => (
                                                <button
                                                    key={tarif.id}
                                                    type="button"
                                                    onClick={() =>
                                                        addRoomType(tarif)
                                                    }
                                                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all text-left flex items-center justify-between group"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                                                            {tarif.type.nom}
                                                        </p>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            {tarif.prix.toLocaleString(
                                                                "fr-FR",
                                                            )}{" "}
                                                            MAD / Nuit
                                                        </p>
                                                    </div>
                                                    <MoveRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="col-span-full p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                <p className="text-xs font-bold">
                                                    Aucun tarif disponible pour
                                                    la date d'arrivée
                                                    sélectionnée (
                                                    {data.date_arrivee}).
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left">
                                            <th className="px-8 py-4">
                                                Type d'hébergement
                                            </th>
                                            <th className="px-8 py-4 text-center">
                                                Quantité
                                            </th>
                                            <th className="px-8 py-4 text-right">
                                                Prix Unitaire / Nuit
                                            </th>
                                            <th className="px-8 py-4 text-right">
                                                Sous-total
                                            </th>
                                            {isEditing && (
                                                <th className="px-8 py-4 text-right">
                                                    Action
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {(isEditing
                                            ? data.details
                                            : reservation.details
                                        ).map((item, idx) => (
                                            <tr
                                                key={idx}
                                                className="group hover:bg-slate-50/30 transition-colors"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:border-amber-200 transition-colors">
                                                            <Hotel className="w-5 h-5 text-slate-400" />
                                                        </div>
                                                        <span className="font-bold text-slate-900">
                                                            {(item as any)
                                                                .nom ||
                                                                (item as any)
                                                                    .type?.nom}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {isEditing ? (
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id_type,
                                                                        item.quantite -
                                                                            1,
                                                                    )
                                                                }
                                                                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-4 text-center font-bold">
                                                                {item.quantite}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id_type,
                                                                        item.quantite +
                                                                            1,
                                                                    )
                                                                }
                                                                className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold hover:bg-slate-200 transition-colors"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <p className="text-center font-bold text-slate-900">
                                                            x{item.quantite}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right font-medium text-slate-600">
                                                    {item.prix_unitaire.toLocaleString(
                                                        "fr-FR",
                                                    )}{" "}
                                                    MAD
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <span className="font-bold text-slate-900">
                                                        {(
                                                            item.quantite *
                                                            item.prix_unitaire *
                                                            nights
                                                        ).toLocaleString(
                                                            "fr-FR",
                                                        )}{" "}
                                                        MAD
                                                    </span>
                                                </td>
                                                {isEditing && (
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeRoom(idx)
                                                            }
                                                            className="w-9 h-9 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}

                                        {/* Empty State in Edit Mode */}
                                        {isEditing &&
                                            data.details.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan={5}
                                                        className="px-8 py-12 text-center"
                                                    >
                                                        <div className="max-w-xs mx-auto space-y-3">
                                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                                                                <Info className="w-6 h-6 text-slate-400" />
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                                                                Aucune
                                                                prestation
                                                                sélectionnée
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                                                Veuillez ajouter
                                                                au moins une
                                                                chambre pour
                                                                continuer votre
                                                                demande de mise
                                                                à jour.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
