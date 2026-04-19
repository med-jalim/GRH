import { useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, usePage } from "@inertiajs/react";
import { bookingSchema, type BookingSchemaType } from "@/lib/schemas";
import { computeDynamicPrice } from "@/lib/utils";

import type { Hotel } from "@/types/booking";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { AgencyInfoStep } from "@/components/booking/AgencyInfoStep";
import { ReservationDetailsStep } from "@/components/booking/ReservationDetailsStep";
import { SummaryStep } from "@/components/booking/SummaryStep";
import { CheckCircle, XCircle, FileUp, CreditCard, ExternalLink, Calendar, Users, Building2, BedDouble, Upload, Clock, Ban, Loader2, Edit2, AlertTriangle, RefreshCw, Check } from "lucide-react";

interface Props {
    reservation: any;
    hotels: Hotel[];
}

export default function PublicReservationPortal({ reservation, hotels }: Props) {
    const { flash, errors } = usePage().props as any;
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<"general" | "payment">(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('tab') === 'payment') return 'payment';
        }
        return 'general';
    });

    // Edit Form State
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);
    const [isCapacityValid, setIsCapacityValid] = useState(true);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

    // Action State
    const [isActioning, setIsActioning] = useState<string | null>(null);
    const [paymentFile, setPaymentFile] = useState<File | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [actionConfirmType, setActionConfirmType] = useState<'confirm' | 'cancel' | null>(null);

    const methods = useForm<BookingSchemaType>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            bookingType: reservation.type_reservant || 'groupe',
            agencyName: reservation.nom_agence || "",
            agencyCode: reservation.code_agence || "",
            contactName: reservation.nom_contact || "",
            email: reservation.email || "",
            phone: reservation.telephone || "",
            hotelId: reservation.id_hotel,
            groups: reservation.groups?.map((g: any) => ({
                uid: Math.random().toString(36).substr(2, 9),
                checkIn: g.date_arrivee ? g.date_arrivee.split('T')[0] : "",
                checkOut: g.date_depart ? g.date_depart.split('T')[0] : "",
                occupants: g.nb_personnes || 1,
                rooms: g.items?.map((i: any) => ({
                    uid: Math.random().toString(36).substr(2, 9),
                    roomTypeId: i.id_type,
                    subTypeId: i.id_sub_type || 0,
                    quantity: i.quantite,
                    adults: i.nb_adultes ?? 2,
                    children: i.nb_enfants ?? 0,
                })) || [],
            })) || [],
            specialRequests: reservation.remarques_speciales || "",
        },
        mode: "onBlur",
    });

    const { watch, trigger, handleSubmit, reset } = methods;
    const formData = watch();

    const selectedHotel = useMemo(
        () => (hotels || []).find((h) => h.id === formData.hotelId) ?? null,
        [formData.hotelId, hotels],
    );

    const basePrice = useMemo(() => {
        if (!selectedHotel || !formData.groups || formData.groups.length === 0) return 0;
        
        return formData.groups.reduce((sum: number, g: any) => {
            if (!g.checkIn || !g.checkOut || !g.rooms) return sum;
            
            const diff = new Date(g.checkOut).getTime() - new Date(g.checkIn).getTime();
            const nights = Math.max(1, Math.round(diff / 86_400_000));
            const checkInDate = new Date(g.checkIn);

            const groupTotal = g.rooms.reduce((rSum: number, r: any) => {
                const prix = computeDynamicPrice(selectedHotel, r.roomTypeId, r.subTypeId, checkInDate);
                return rSum + (prix * nights * r.quantity);
            }, 0);

            return sum + groupTotal;
        }, 0);
    }, [formData.groups, selectedHotel]);

    const stayTaxTotal = useMemo(() => {
        if (!selectedHotel || !formData.groups || formData.groups.length === 0) return 0;
        const taxeParAdulte = selectedHotel.taxe_sejour || 0;

        return formData.groups.reduce((sum: number, g: any) => {
            if (!g.checkIn || !g.checkOut || !g.rooms) return sum;

            const diff = new Date(g.checkOut).getTime() - new Date(g.checkIn).getTime();
            const nights = Math.max(1, Math.round(diff / 86_400_000));

            const groupTax = g.rooms.reduce((rSum: number, r: any) => {
                return rSum + (r.adults * r.quantity * nights * taxeParAdulte);
            }, 0);

            return sum + groupTax;
        }, 0);
    }, [formData.groups, selectedHotel]);

    const totalPrice = formData.bookingType === 'agence' ? (basePrice * 0.96) + stayTaxTotal : basePrice + stayTaxTotal;

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ["agencyName", "agencyCode", "contactName", "email", "phone"];
        if (step === 2) fieldsToValidate = ["hotelId", "groups"];

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setStep((s) => s + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleBack = () => {
        setStep((s) => Math.max(1, s - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cancelEdit = () => {
        reset();
        setStep(1);
        setIsEditing(false);
    }

    const onSubmit = (data: BookingSchemaType) => {
        setSubmitting(true);
        const payload = {
            type_reservant: data.bookingType,
            nom_contact: data.contactName,
            email: data.email,
            telephone: data.phone,
            remarques_speciales: data.specialRequests,
            groups: data.groups.map(g => ({
                date_arrivee: g.checkIn,
                date_depart: g.checkOut,
                nb_personnes: g.rooms.reduce((sum, room) => sum + room.adults + room.children, 0),
                rooms: g.rooms.map(r => {
                    const checkInDate = new Date(g.checkIn);
                    const prix = computeDynamicPrice(selectedHotel, r.roomTypeId, r.subTypeId, checkInDate);
                    return {
                        id_type: r.roomTypeId,
                        id_sub_type: r.subTypeId,
                        quantite: r.quantity,
                        prix_unitaire: prix,
                        nb_adultes: r.adults,
                        nb_enfants: r.children,
                    };
                })
            }))
        };

        router.post(`/reservation/${reservation.token}/update`, payload, {
            onSuccess: () => {
                setSubmitting(false);
                setIsEditing(false);
                setStep(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
            onError: (errs) => {
                setSubmitting(false);
                // Smart redirect based on errors
                const hasStep2Error = Object.keys(errs).some(k => k.startsWith('groups') || k === 'availability');
                const hasStep1Error = Object.keys(errs).some(k => ['nom_contact', 'email', 'telephone'].includes(k));

                if (hasStep2Error) {
                    setStep(2);
                } else if (hasStep1Error) {
                    setStep(1);
                }
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
            onFinish: () => setSubmitting(false),
        });
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentFile || !paymentAmount) return;

        setIsUploading(true);
        const fd = new FormData();
        fd.append("document", paymentFile);
        fd.append("amount", paymentAmount);

        router.post(`/reservation/${reservation.token}/payments`, fd, {
            onSuccess: () => {
                setPaymentFile(null);
                setPaymentAmount("");
            },
            onFinish: () => setIsUploading(false)
        });
    };

    const handleAction = (action: 'confirm' | 'cancel') => {
        setActionConfirmType(action);
    };

    const confirmFinalAction = () => {
        if (!actionConfirmType) return;
        
        setIsActioning(actionConfirmType);
        router.post(`/reservation/${reservation.token}/${actionConfirmType}`, {}, {
            onFinish: () => {
                setIsActioning(null);
                setActionConfirmType(null);
            }
        });
    };

    const formatPrice = (amount: number) => new Intl.NumberFormat("fr-MA", { style: "decimal", minimumFractionDigits: 0 }).format(amount) + " MAD";
    const formatDateStr = (dateStr: string) => new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

    // Status helpers - ADMIN STYLE
    const getStatusInfo = (statut: string) => {
        switch (statut) {
            case 'en_attente': return { label: 'En attente', colors: 'bg-amber-50 text-amber-600 border-amber-200' };
            case 'en_attente_paiement': return { label: 'En attente de paiement', colors: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
            case 'confirme': return { label: 'Confirmée', colors: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
            case 'annule': return { label: 'Annulée', colors: 'bg-rose-50 text-rose-600 border-rose-200' };
            case 'valide': return { label: 'Validée', colors: 'bg-cyan-50 text-cyan-600 border-cyan-200' };
            case 'partiellement_paye': return { label: 'Partiellement Payée', colors: 'bg-blue-50 text-blue-600 border-blue-200' };
            case 'en_validation': return { label: 'Confirmation requise', colors: 'bg-amber-50 text-amber-600 border-amber-200' };
            default: return { label: statut, colors: 'bg-slate-50 text-slate-600 border-slate-200' };
        }
    };
    const sInfo = getStatusInfo(reservation.statut);

    const totalValidPaid = reservation.payments.filter((p: any) => p.statut === 'valide').reduce((sum: number, p: any) => sum + p.amount, 0);
    const waitingPayments = reservation.payments.filter((p: any) => p.statut === 'en_attente');
    const remaining = Math.max(0, reservation.prix_total - totalValidPaid);

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
            {/* Confirmation Modal */}
            {actionConfirmType && (
                <ActionConfirmModal 
                    type={actionConfirmType} 
                    onClose={() => setActionConfirmType(null)} 
                    onConfirm={confirmFinalAction} 
                    processing={!!isActioning}
                />
            )}
            {/* STICKY HEADER - ADMIN STYLE */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200/60 backdrop-blur-md bg-white/80 py-4 px-6 mb-8">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#54b172] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Building2 className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none uppercase">
                                Portail Réservation
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">
                                Référence: <span className="text-[#54b172]">{reservation.code_reference}</span>
                            </p>
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                            <button
                                onClick={() => setActiveTab("general")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "general"
                                        ? "bg-white text-slate-900 shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <Building2 className="w-3.5 h-3.5" />
                                Informations
                            </button>
                            {(reservation.statut === 'en_attente_paiement' || reservation.statut === 'partiellement_paye') && (<button
                                onClick={() => setActiveTab("payment")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "payment"
                                        ? "bg-[#54b172] text-white shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                <CreditCard className="w-3.5 h-3.5" />
                                Règlement
                            </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            <main className="px-6 pb-20">
                <div className="max-w-5xl mx-auto">

                    {/* Flash Messages */}
                    {flash.success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-4">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-bold">{flash.success}</p>
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 animate-in fade-in slide-in-from-top-4">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-bold">{flash.error}</p>
                        </div>
                    )}

                    {!isEditing ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                            {/* Left Column: Summary & Actions */}
                            <div className="lg:col-span-8 space-y-6">
                                {activeTab === "general" && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Statut de la réservation</p>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${sInfo.colors}`}>
                                                    {sInfo.label}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {reservation.statut !== 'confirme' && reservation.statut !== 'annule' && (
                                                    <>
                                                        {reservation.statut === 'en_validation' && (
                                                            <button
                                                                disabled={!!isActioning}
                                                                onClick={() => handleAction('confirm')}
                                                                className="px-5 py-2.5 bg-[#54b172] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                                                            >
                                                                {isActioning === 'confirm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Confirmer
                                                            </button>
                                                        )}
                                                        <button disabled={!!isActioning} onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50">
                                                            <Edit2 className="w-3.5 h-3.5" /> Modifier
                                                        </button>
                                                        <button
                                                            disabled={!!isActioning}
                                                            onClick={() => handleAction('cancel')}
                                                            className="px-5 py-2.5 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            {isActioning === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-3.5 h-3.5" />} Annuler
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-8">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                                <div>
                                                    <h3 className="text-[10px] font-bold text-[#54b172] uppercase tracking-widest mb-5 flex items-center gap-2">
                                                        <Users size={14} /> Vos Coordonnées
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Client</span>
                                                            <span className="text-sm font-bold text-slate-800">{reservation.nom_contact}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Email</span>
                                                            <span className="text-sm font-bold text-slate-800">{reservation.email}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Téléphone</span>
                                                            <span className="text-sm font-bold text-slate-800">{reservation.telephone}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="text-[10px] font-bold text-[#54b172] uppercase tracking-widest mb-5 flex items-center gap-2">
                                                        <Calendar size={14} /> Détails du Séjour
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Hôtel</span>
                                                            <span className="text-sm font-bold text-slate-800">{reservation.hotel?.name || 'Veuillez sélectionner un hôtel'}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Période</span>
                                                            <span className="text-sm font-bold text-slate-800">
                                                                {formatDateStr(reservation.date_arrivee)} - {formatDateStr(reservation.date_depart)}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Occupants</span>
                                                            <span className="text-sm font-bold text-slate-800">{reservation.nb_personnes} Personne(s)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-12 pt-8 border-t border-slate-100">
                                                <h3 className="text-[10px] font-bold text-[#54b172] uppercase tracking-widest mb-5">Hébergement & Tarification</h3>
                                                <div className="bg-slate-50 rounded-xl border border-slate-200/60 overflow-hidden">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="bg-slate-50 border-b border-slate-100">
                                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Hébergement & Dates</th>
                                                                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantité</th>
                                                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Sous-total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                            {reservation.groups.map((g: any) => {
                                                                const diff = new Date(g.date_depart).getTime() - new Date(g.date_arrivee).getTime();
                                                                const groupNights = Math.max(1, Math.round(diff / 86_400_000));

                                                                return g.items.map((i: any) => (
                                                                    <tr key={i.id} className="bg-white">
                                                                        <td className="px-6 py-4">
                                                                            <p className="font-bold text-slate-700">
                                                                                {i.type?.nom ?? 'Chambre'} 
                                                                                {i.sub_type && (
                                                                                    <span className="text-[#54b172] ml-1.5 font-bold">
                                                                                        ({i.sub_type.nom})
                                                                                    </span>
                                                                                )}
                                                                            </p>
                                                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                                                                                {i.nb_adultes} Adultes {i.nb_enfants > 0 && `· ${i.nb_enfants} Enfants`}
                                                                            </p>
                                                                            <p className="text-[10px] text-slate-400 font-medium">{formatPrice(i.prix_unitaire)}/nuit</p>
                                                                            <p className="text-[10px] text-slate-400 font-medium">Du {new Date(g.date_arrivee).toLocaleDateString('FR-fr')} au {new Date(g.date_depart).toLocaleDateString('FR-fr')} ({groupNights} nuits)</p>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-center font-medium text-slate-500">x{i.quantite}</td>
                                                                        <td className="px-6 py-4 text-right font-bold text-slate-900">{formatPrice(i.prix_unitaire * i.quantite * groupNights)}</td>
                                                                    </tr>
                                                                ));
                                                            })}
                                                        </tbody>
                                                        <tfoot className="bg-slate-50">
                                                            {reservation.type_reservant === 'agence' && reservation.prix_avant_remise ? (
                                                                <>
                                                                    <tr>
                                                                        <td colSpan={2} className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-widest border-b border-white">Sous-total Chambres</td>
                                                                        <td className="px-6 py-4 text-right font-bold text-slate-400 line-through border-b border-white">{formatPrice(reservation.prix_avant_remise)}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td colSpan={2} className="px-6 py-4 text-right font-bold text-emerald-500 uppercase tracking-widest border-b border-white">Remise Agence (4%)</td>
                                                                        <td className="px-6 py-4 text-right font-black text-emerald-500 border-b border-white">- {formatPrice(reservation.prix_avant_remise * 0.04)}</td>
                                                                    </tr>
                                                                </>
                                                            ):(
                                                                <tr>
                                                                    <td colSpan={2} className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-widest border-b border-white">Sous-total Chambres</td>
                                                                    <td className="px-6 py-4 text-right font-bold text-slate-400 border-b border-white">{formatPrice(reservation.prix_avant_remise || (reservation.prix_total - (reservation.taxe_sejour_total || 0)))}</td>
                                                                </tr>
                                                            )}
                                                            {reservation.taxe_sejour_total > 0 && (
                                                                <tr>
                                                                    <td colSpan={2} className="px-6 py-4 text-right font-bold text-slate-500 uppercase tracking-widest border-b border-white">Taxes de séjour</td>
                                                                    <td className="px-6 py-4 text-right font-bold text-slate-600 border-b border-white">+{formatPrice(reservation.taxe_sejour_total)}</td>
                                                                </tr>
                                                            )}
                                                            <tr>
                                                                <td colSpan={2} className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-widest">Total Net à payer</td>
                                                                <td className="px-6 py-4 text-right font-black text-lg text-[#54b172]">{formatPrice(reservation.prix_total)}</td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "payment" && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                        <div className="p-8 border-b border-slate-100 bg-indigo-50/30 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                                <CreditCard className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-900">Gestion du Règlement</h2>
                                                <p className="text-xs text-slate-500 font-medium">Consultez l'état de vos paiements et envoyez vos justificatifs</p>
                                            </div>
                                        </div>

                                        <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-10">
                                            <div className="md:col-span-12">
                                                {(reservation.statut === 'en_attente_paiement' || reservation.payment_link) && reservation.statut !== 'confirme' && remaining > 0 && (
                                                    <div className="mb-8 p-6 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                                                        <div className="text-center sm:text-left">
                                                            <h3 className="font-bold text-lg mb-1">Règlement en ligne sécurisé</h3>
                                                            <p className="text-indigo-100 text-xs">Utilisez notre lien direct pour confirmer votre réservation instantanément.</p>
                                                        </div>
                                                        <a href={reservation.payment_link || "#"} target="_blank" className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 whitespace-nowrap shadow-lg">
                                                            💳 Payer via Payzone
                                                        </a>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">🖋️ Historique des versements</p>
                                                        {reservation.payments.length === 0 ? (
                                                            <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                                                <p className="text-sm text-slate-400 font-medium italic">Aucun document soumis</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                {reservation.payments.map((p: any) => (
                                                                    <div key={p.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:border-slate-200 transition-colors bg-white">
                                                                        <div>
                                                                            <p className="text-sm font-bold text-slate-900">{formatPrice(p.amount)}</p>
                                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${p.statut === 'valide' ? 'bg-emerald-50 text-emerald-600' :
                                                                                        p.statut === 'en_attente' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                                                    }`}>
                                                                                    {p.statut === 'valide' ? 'Validé' : p.statut === 'en_attente' ? 'En attente' : 'Refusé'}
                                                                                </span>
                                                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(p.created_at).toLocaleDateString()}</span>
                                                                            </div>
                                                                        </div>
                                                                        <a href={`/storage/${p.document_path}`} target="_blank" className="p-2.5 text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">
                                                                            <ExternalLink className="w-4 h-4" />
                                                                        </a>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {remaining > 0 && reservation.statut !== 'annule' && (
                                                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Soumettre une preuve de virement</p>
                                                            <form onSubmit={handlePaymentSubmit} className="space-y-5">
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Montant du virement (MAD)</label>
                                                                    <input type="number" required min="1" max={remaining} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="ps-3 w-full bg-white border-slate-200 rounded-xl text-sm font-bold focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder={`Max : ${remaining}`} />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Justificatif (PDF/Image)</label>
                                                                    <input type="file" required accept=".pdf,image/*" onChange={e => setPaymentFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                                                                </div>
                                                                <button disabled={isUploading || !paymentFile || !paymentAmount} type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200">
                                                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Soumettre le versement
                                                                </button>
                                                            </form>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Mini Info Sticky */}
                            <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-28">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-4 mb-4 uppercase tracking-widest">
                                        Résumé Financier
                                    </h2>
                                    <div className="space-y-4">
                                        {reservation.type_reservant === 'agence' && reservation.prix_avant_remise ? (
                                            <>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 font-medium">Prix Chambres</span>
                                                    <span className="font-bold text-slate-400 line-through">{formatPrice(reservation.prix_avant_remise)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-emerald-600 font-bold">Remise Agence (4%)</span>
                                                    <span className="font-black text-emerald-600">-{formatPrice(reservation.prix_avant_remise * 0.04)}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium">Prix Chambres</span>
                                                <span className="font-bold text-slate-900">{formatPrice(reservation.prix_total - (reservation.taxe_sejour_total || 0))}</span>
                                            </div>
                                        )}
                                        
                                        {reservation.taxe_sejour_total > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium">Taxes de séjour</span>
                                                <span className="font-bold text-slate-700">+{formatPrice(reservation.taxe_sejour_total)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 italic">
                                            <span className="text-slate-600 font-bold">Total Net à payer</span>
                                            <span className="font-black text-slate-900">{formatPrice(reservation.prix_total)}</span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500 font-medium">Déjà versé</span>
                                            <span className="font-bold text-emerald-600">-{formatPrice(totalValidPaid)}</span>
                                        </div>
                                        {waitingPayments.length > 0 && (
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-amber-500 font-bold uppercase tracking-tighter italic">En cours de vérif.</span>
                                                <span className="font-bold text-amber-500 italic">+{formatPrice(waitingPayments.reduce((s: number, p: any) => s + p.amount, 0))}</span>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Reste à payer</span>
                                            <span className={`text-xl font-black ${remaining > 0 ? 'text-indigo-600' : 'text-emerald-500'}`}>
                                                {formatPrice(remaining)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
                                    <div className="flex items-center gap-3 text-emerald-700 mb-3">
                                        <CheckCircle size={20} />
                                        <span className="text-xs font-bold uppercase tracking-widest">Assistance</span>
                                    </div>
                                    <p className="text-[11px] text-emerald-600 font-medium leading-relaxed">
                                        Notre équipe de réception est disponible 24h/24 pour répondre à vos questions. Contactez l'hôtel directement par téléphone pour toute demande urgente.
                                    </p>
                                </div>
                            </div>
                        </div>

                    ) : (

                        /* EDITING MODE - ADMIN FORM STYLE */
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex justify-between items-center bg-white/50 backdrop-blur">
                                <StepIndicator currentStep={step} />
                                <button onClick={cancelEdit} className="text-[10px] text-rose-500 font-black hover:text-rose-700 uppercase tracking-widest flex items-center gap-1">
                                    <span className="w-5 h-5 bg-rose-50 rounded-full flex items-center justify-center">×</span> Abandonner
                                </button>
                            </div>

                            <div className="p-8 md:p-12">
                                <FormProvider {...methods}>
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        {step === 1 && <AgencyInfoStep />}
                                        {step === 2 && (
                                            <ReservationDetailsStep
                                                hotels={hotels}
                                                totalPrice={totalPrice}
                                                disabledHotel={true}
                                                reservationId={reservation.id}
                                                onAvailabilityChange={setIsAvailable}
                                                onCheckingChange={setIsCheckingAvailability}
                                                onCapacityErrorChange={(hasError) => setIsCapacityValid(!hasError)}
                                            />
                                        )}
                                        {step === 3 && (
                                            <SummaryStep 
                                                hotel={selectedHotel} 
                                                basePrice={basePrice} 
                                                stayTaxTotal={stayTaxTotal}
                                                totalPrice={totalPrice} 
                                            />
                                        )}
                                    </form>
                                </FormProvider>
                            </div>

                            {/* API Errors Display */}
                            {errors && Object.keys(errors).length > 0 && (
                                <div className="mx-12 mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex gap-3">
                                        <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Configuration Requise</p>
                                            <ul className="list-disc list-inside space-y-0.5">
                                                {Object.values(errors).flat().map((err: any, idx) => (
                                                    <li key={idx} className="text-xs font-bold text-rose-600 leading-relaxed">{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="px-12 pb-10 flex justify-between items-center">
                                <button type="button" onClick={handleBack} className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${step === 1 ? "invisible" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}>
                                    ← Retour
                                </button>

                                <div className="flex gap-4">
                                    {step < 3 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={!isAvailable || !isCapacityValid || isCheckingAvailability || (step === 2 && !formData.hotelId)}
                                            className="px-10 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10 flex items-center gap-2"
                                        >
                                            {isCheckingAvailability ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Vérification...
                                                </>
                                            ) : (
                                                "Suivant →"
                                            )}
                                        </button>
                                    ) : (
                                        <button type="button" onClick={handleSubmit(onSubmit)} disabled={submitting || !isAvailable} className="px-10 py-4 bg-[#54b172] hover:bg-emerald-600 disabled:opacity-70 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                                            {submitting ? "Traitement..." : "Confirmer les changements"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="py-10 text-center border-t border-slate-200 mt-20">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    © 2026 GRH Hôtels · Expérience Client Premium
                </p>
            </footer>
        </div>
    );
}

// ── Action Confirmation Modal ──────────────────────────────────────────────

function ActionConfirmModal({ 
    type, 
    onClose, 
    onConfirm, 
    processing 
}: { 
    type: 'confirm' | 'cancel'; 
    onClose: () => void; 
    onConfirm: () => void;
    processing: boolean;
}) {
    const isConfirm = type === 'confirm';
    
    return (
        <div role="dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isConfirm ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                            {isConfirm ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <Ban className="w-6 h-6 text-rose-600" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 leading-tight">
                                {isConfirm ? 'Confirmation' : 'Annulation'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">
                                Action requise
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative ${isConfirm ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                        {isConfirm ? (
                            <Check className="w-10 h-10 text-emerald-500 relative z-10" />
                        ) : (
                            <AlertTriangle className="w-10 h-10 text-rose-500 relative z-10" />
                        )}
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${isConfirm ? 'bg-emerald-200/30' : 'bg-rose-200/30'}`} />
                    </div>
                    
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                        {isConfirm ? 'Confirmer mon séjour ?' : 'Souhaitez-vous annuler ?'}
                    </h4>
                    
                    <p className="text-slate-600 text-sm font-medium leading-relaxed px-4">
                        {isConfirm 
                            ? "En confirmant, vous validez les informations de votre séjour et acceptez que votre dossier soit traité pour finalisation."
                            : "Attention, l'annulation de votre réservation est définitive et libérera immédiatement vos chambres."
                        }
                    </p>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/80 border-t border-slate-100 flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={processing}
                        className={`flex-[1.5] px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isConfirm ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                        }`}
                    >
                        {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : (isConfirm ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />)}
                        {isConfirm ? "Oui, je confirme" : "Oui, annuler"}
                    </button>
                </div>
            </div>
        </div>
    );
}
