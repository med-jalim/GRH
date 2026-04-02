import { useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import { bookingSchema, type BookingSchemaType } from "@/lib/schemas";

import type { Hotel } from "@/types/booking";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { AgencyInfoStep } from "@/components/booking/AgencyInfoStep";
import { ReservationDetailsStep } from "@/components/booking/ReservationDetailsStep";
import { SummaryStep } from "@/components/booking/SummaryStep";
import { CheckCircle, XCircle, FileUp, CreditCard, ExternalLink, Calendar, Users, Building2, BedDouble, Upload, Clock, Ban, Loader2 } from "lucide-react";

interface Props {
    reservation: any;
    hotels: Hotel[];
}

export default function PublicReservationPortal({ reservation, hotels }: Props) {
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

    // Payment State
    const [paymentFile, setPaymentFile] = useState<File | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);

    const methods = useForm<BookingSchemaType>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            agencyName: reservation.nom_agence || "",
            agencyCode: reservation.code_agence || "",
            contactName: reservation.nom_contact || "",
            email: reservation.email || "",
            phone: reservation.telephone || "",
            hotelId: reservation.id_hotel,
            checkIn: reservation.date_arrivee ? reservation.date_arrivee.split('T')[0] : "",
            checkOut: reservation.date_depart ? reservation.date_depart.split('T')[0] : "",
            totalOccupants: reservation.nb_personnes || 0,
            rooms: reservation.details?.map((d: any) => ({
                uid: crypto.randomUUID(),
                roomTypeId: d.id_type,
                quantity: d.quantite,
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

    const nights = useMemo(() => {
        if (!formData.checkIn || !formData.checkOut) return 0;
        const diff = new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime();
        return Math.max(0, Math.round(diff / 86_400_000));
    }, [formData.checkIn, formData.checkOut]);

    const totalPrice = useMemo(() => {
        if (!selectedHotel || nights === 0 || !formData.checkIn) return 0;
        const checkInDate = new Date(formData.checkIn);
        return formData.rooms.reduce((sum: number, r: any) => {
            const tarif = selectedHotel.tarifs.find(
                (t: any) =>
                    t.id_type === r.roomTypeId &&
                    new Date(t.date_debut) <= checkInDate &&
                    new Date(t.date_fin) >= checkInDate,
            );
            return sum + (tarif ? tarif.prix * nights * r.quantity : 0);
        }, 0);
    }, [formData.rooms, selectedHotel, nights, formData.checkIn]);

    const handleNext = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ["agencyName", "agencyCode", "contactName", "email", "phone"];
        if (step === 2) fieldsToValidate = ["hotelId", "checkIn", "checkOut", "totalOccupants", "rooms"];

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

    const onSubmit = async (data: BookingSchemaType) => {
        setSubmitting(true);
        const payload = {
            nom_agence: data.agencyName, nom_contact: data.contactName, code_agence: data.agencyCode,
            email: data.email, telephone: data.phone, id_hotel: data.hotelId,
            date_arrivee: data.checkIn, date_depart: data.checkOut,
            nb_personnes: data.totalOccupants, prix_total: totalPrice, remarques_speciales: data.specialRequests,
            details: data.rooms.map((r: any) => {
                const checkInDate = new Date(data.checkIn);
                const validTarif = selectedHotel?.tarifs.find((t: any) => t.id_type === r.roomTypeId && new Date(t.date_debut) <= checkInDate && new Date(t.date_fin) >= checkInDate);
                return { id_type: r.roomTypeId, quantite: r.quantity, prix_unitaire: validTarif?.prix || 0 };
            }),
        };

        router.post(`/reservation/${reservation.token}/update`, payload, {
            onStart: () => setSubmitting(true),
            onFinish: () => setSubmitting(false),
            onError: (errors) => {
                console.error("Inertia Error:", errors);
                alert("Une erreur est survenue lors de la mise à jour.");
            }
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

    const formatPrice = (amount: number) => new Intl.NumberFormat("fr-MA", { style: "decimal", minimumFractionDigits: 0 }).format(amount) + " MAD";
    const formatDateStr = (dateStr: string) => new Date(dateStr).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

    // Status helpers
    const getStatusInfo = (statut: string) => {
        switch(statut) {
            case 'en_attente': return { label: 'En attente', colors: 'bg-amber-100 text-amber-700 border-amber-200' };
            case 'en_attente_paiement': return { label: 'En attente de paiement', colors: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
            case 'confirme': return { label: 'Confirmée', colors: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
            case 'annule': return { label: 'Annulée', colors: 'bg-red-100 text-red-700 border-red-200' };
            case 'valide': return { label: 'Validée', colors: 'bg-cyan-100 text-cyan-700 border-cyan-200' };
            case 'partiellement_paye': return { label: 'Partiellement Payée', colors: 'bg-blue-100 text-blue-700 border-blue-200' };
            default: return { label: statut, colors: 'bg-slate-100 text-slate-700 border-slate-200' };
        }
    };
    const sInfo = getStatusInfo(reservation.statut);

    const totalValidPaid = reservation.payments.filter((p:any) => p.statut === 'valide').reduce((sum:number, p:any) => sum + p.amount, 0);
    const waitingPayments = reservation.payments.filter((p:any) => p.statut === 'en_attente');
    const remaining = Math.max(0, reservation.prix_total - totalValidPaid);

    return (
        <div className="min-h-screen bg-slate-900">
            <header className="py-8 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                   <h1 className="text-2xl font-black text-white uppercase tracking-widest">
                       {isEditing ? "Modifier ma réservation" : "Détails de ma réservation"}
                   </h1>
                   <p className="text-slate-400 text-xs mt-2">Référence : <span className="text-amber-500 font-mono font-bold">{reservation.code_reference}</span></p>
                </div>
            </header>

            <main className="px-4 pb-16">
                <div className="max-w-4xl mx-auto">
                    
                    {!isEditing ? (
                        <div className="space-y-6">
                            {/* Tabs Switcher */}
                            <div className="flex justify-center mb-4">
                                <div className="flex items-center gap-1 bg-slate-800/50 p-1.5 rounded-2xl w-fit backdrop-blur-sm border border-slate-700/50">
                                    <button
                                        onClick={() => setActiveTab("general")}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                            activeTab === "general"
                                                ? "bg-white text-slate-900 shadow-sm"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        <Building2 className="w-4 h-4" />
                                        Informations
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("payment")}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                            activeTab === "payment"
                                                ? "bg-indigo-500 text-white shadow-sm"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Règlement
                                    </button>
                                </div>
                            </div>

                            {activeTab === "general" && (
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-bottom-5">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Statut actuel</p>
                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border ${sInfo.colors}`}>
                                            {sInfo.label}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {reservation.statut !== 'confirme' && reservation.statut !== 'annule' && (
                                            <>
                                                {reservation.statut === 'en_validation' && (
                                                    <button onClick={() => { if(confirm("Confirmer la réservation ?")) router.get(`/reservation/${reservation.token}/confirm`) }} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5">
                                                        <CheckCircle className="w-4 h-4" /> Valider
                                                    </button>
                                                )}
                                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                                                    Modifier
                                                </button>
                                                <button onClick={() => { if(confirm("Annuler la réservation ?")) router.get(`/reservation/${reservation.token}/cancel`) }} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                                                    <XCircle className="w-4 h-4" /> Annuler
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Informations</p>
                                        <div className="space-y-3 font-medium text-sm text-slate-700">
                                            <p><span className="text-slate-400">Nom :</span> {reservation.nom_contact}</p>
                                            <p><span className="text-slate-400">Email :</span> {reservation.email}</p>
                                            <p><span className="text-slate-400">Tél :</span> {reservation.telephone}</p>
                                            {reservation.hotel && <p className="flex items-center gap-2 mt-2"><Building2 className="w-4 h-4 text-slate-400"/> {reservation.hotel.name}, {reservation.hotel.ville}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Séjour</p>
                                        <div className="space-y-3 font-medium text-sm text-slate-700">
                                            <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400"/> {formatDateStr(reservation.date_arrivee)} <span className="text-slate-300">→</span> {formatDateStr(reservation.date_depart)}</p>
                                            <p className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400"/> {reservation.nb_personnes} personne(s)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Chambres & Options</p>
                                    <div className="bg-slate-50 rounded-2xl p-4">
                                        {reservation.details.map((d:any) => (
                                            <div key={d.id} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <BedDouble className="w-4 h-4 text-indigo-400" />
                                                    <span className="text-sm font-bold text-slate-700">{d.type?.nom ?? 'Chambre'} (x{d.quantite})</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-900">{formatPrice(d.prix_unitaire * d.quantite)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-slate-200">
                                            <span className="text-sm font-black text-slate-900 uppercase">Total Estimé</span>
                                            <span className="text-lg font-black text-amber-500">{formatPrice(reservation.prix_total)}</span>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            )}

                            {activeTab === "payment" && (
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5"/>
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900">Règlement</h2>
                                </div>

                                {(reservation.statut === 'en_attente_paiement' || reservation.payment_link) && reservation.statut !== 'confirme' && remaining > 0 && (
                                    <div className="mb-8 p-6 bg-indigo-600 rounded-3xl text-white">
                                        <p className="text-indigo-200 text-sm font-medium mb-4">Pour confirmer définitivement votre réservation, vous pouvez régler par carte bancaire via notre système sécurisé :</p>
                                        <a href={reservation.payment_link || "#"} target="_blank" className="inline-flex items-center gap-2 bg-white text-indigo-900 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                                            💳 Payer en ligne (Payzone)
                                        </a>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Historique des preuves</p>
                                        {reservation.payments.length === 0 ? (
                                            <p className="text-sm text-slate-500 italic">Aucun document soumis.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {reservation.payments.map((p:any) => (
                                                    <div key={p.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900">{formatPrice(p.amount)}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                {p.statut === 'valide' && <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Validé</span>}
                                                                {p.statut === 'en_attente' && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">En attente</span>}
                                                                {p.statut === 'refuse' && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Refusé</span>}
                                                                <span className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <a href={`/storage/${p.document_path}`} target="_blank" className="p-2 text-indigo-500 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                                                            <ExternalLink className="w-4 h-4"/>
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {remaining > 0 && reservation.statut !== 'annule' && (
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Soumettre une preuve de virement</p>
                                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 block mb-1">Montant transféré (MAD)</label>
                                                    <input type="number" required min="1" max={remaining} value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full bg-white border-slate-200 rounded-xl text-sm" placeholder={remaining.toString()} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-slate-600 block mb-1">Document (PDF/Image)</label>
                                                    <input type="file" required accept=".pdf,image/*" onChange={e => setPaymentFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                                </div>
                                                <button disabled={isUploading || !paymentFile || !paymentAmount} type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 disabled:opacity-50">
                                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Upload className="w-4 h-4"/>} Soumettre
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            )}
                        </div>

                    ) : (

                        /* EDITING MODE */
                        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                            <div className="bg-slate-50 border-b border-slate-100 px-8 py-6 flex justify-between items-center">
                                <StepIndicator currentStep={step} />
                                <button onClick={cancelEdit} className="text-xs text-slate-500 font-bold hover:text-slate-800 uppercase tracking-wider hidden md:block">
                                    X Annuler la modification
                                </button>
                            </div>

                            <div className="p-8 md:p-12">
                                <FormProvider {...methods}>
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        {step === 1 && <AgencyInfoStep />}
                                        {step === 2 && <ReservationDetailsStep hotels={hotels} nights={nights} totalPrice={totalPrice} disabledHotel={true} />}
                                        {step === 3 && <SummaryStep hotel={selectedHotel} nights={nights} totalPrice={totalPrice} />}
                                    </form>
                                </FormProvider>
                            </div>

                            <div className="px-12 pb-12 flex justify-between items-center">
                                <button type="button" onClick={handleBack} className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${step === 1 ? "invisible" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}>
                                    ← Retour
                                </button>

                                {step < 3 ? (
                                    <button type="button" onClick={handleNext} className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black tracking-wide transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20">
                                        Continuer →
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleSubmit(onSubmit)} disabled={submitting} className="px-10 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-slate-900 rounded-2xl text-sm font-black tracking-wide transition-all active:scale-[0.98] shadow-xl shadow-amber-500/20 flex items-center gap-2">
                                        {submitting ? "Mise à jour..." : "✓ Enregistrer"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
