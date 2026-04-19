import { useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { bookingSchema, type BookingSchemaType } from "@/lib/schemas";
import { computeDynamicPrice } from "@/lib/utils";

import type { Hotel } from "@/types/booking";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { AgencyInfoStep } from "@/components/booking/AgencyInfoStep";
import { ReservationDetailsStep } from "@/components/booking/ReservationDetailsStep";
import { SummaryStep } from "@/components/booking/SummaryStep";
import { BookingSuccessPage } from "./BookingSuccessPage";

interface Props {
    hotels: Hotel[];
}

import { Building2 } from "lucide-react";

export default function BookingFormPage({ hotels }: Props) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string[]>([]);
    const [isAvailable, setIsAvailable] = useState(true);
    const [isCapacityValid, setIsCapacityValid] = useState(true);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [successData, setSuccessData] = useState<{
        reference: string;
        data: any;
    } | null>(null);

    // React Hook Form
    const methods = useForm<BookingSchemaType>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            bookingType: "groupe",
            agencyName: "",
            agencyCode: "",
            contactName: "",
            email: "",
            phone: "",
            hotelId: undefined,
            groups: [
                {
                    uid: Math.random().toString(36).substr(2, 9),
                    checkIn: "",
                    checkOut: "",
                    occupants: 1,
                    rooms: [],
                },
            ],
            specialRequests: "",
        },
        mode: "onBlur",
    });

    const { watch, trigger, handleSubmit } = methods;
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
        const taxeParAdulte = selectedHotel.taxe_sejour ?? 0;

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

    const totalPrice = (formData.bookingType === 'agence' ? basePrice * 0.96 : basePrice) + stayTaxTotal;

    // ── Navigation ───────────────────────────────────────
    const handleNext = async () => {
        setApiError([]);
        let fieldsToValidate: any[] = [];
        if (step === 1)
            fieldsToValidate = [
                "agencyName",
                "agencyCode",
                "contactName",
                "email",
                "phone",
            ];
        if (step === 2)
            fieldsToValidate = [
                "hotelId",
                "groups",
            ];

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

    const onSubmit = async (data: BookingSchemaType) => {
        setSubmitting(true);

        const payload = {
            type_reservant: data.bookingType,
            nom_agence: data.agencyName,
            nom_contact: data.contactName,
            code_agence: data.agencyCode,
            email: data.email,
            telephone: data.phone,
            id_hotel: data.hotelId,
            prix_total: totalPrice,
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

        try {
            const res = await axios.post("/booking", payload, {
                headers: { Accept: "application/json" }
            });
            setSuccessData({
                reference: res.data.data.code_reference,
                data: data,
            });
        } catch (error: any) {
            console.error("API Error:", error);
            if (error.response && error.response.status === 422) {
                const data = error.response.data;
                if (data.errors && Array.isArray(data.errors)) {
                    setApiError(data.errors);
                } else if (data.errors) {
                    const flatErrors = Object.values(data.errors).flat() as string[];
                    setApiError(flatErrors);
                } else {
                    setApiError([data.message || "Erreur de validation"]);
                }
                // Redirect back to Step 2 for corrections
                setStep(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setApiError(["Une erreur est survenue lors de la réservation. Veuillez réessayer."]);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (successData) {
        return (
            <BookingSuccessPage
                reference={successData.reference}
                formData={successData.data}
                hotel={selectedHotel}
                basePrice={basePrice}
                stayTaxTotal={stayTaxTotal}
                totalPrice={totalPrice}
            />
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
            {/* STICKY HEADER - ADMIN STYLE */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200/60 backdrop-blur-md bg-white/80 py-4 px-6 mb-8">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#54b172] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Building2 className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none uppercase">
                            Nouvelle Réservation
                        </h1>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">
                            Portail <span className="text-[#54b172]">Groupe Résidences Hôtelières </span>
                        </p>
                    </div>
                </div>
            </header>

            <main className="px-6 pb-20">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex justify-between items-center bg-white/50 backdrop-blur">
                            <StepIndicator currentStep={step} />
                        </div>

                        <div className="p-8 md:p-12">
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {step === 1 && <AgencyInfoStep />}
                                    {step === 2 && (
                                        <ReservationDetailsStep
                                            hotels={hotels}
                                            totalPrice={totalPrice}
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
                        {apiError.length > 0 && (
                            <div className="mx-12 mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex gap-3">
                                    <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Action Requise</p>
                                        <ul className="list-disc list-inside space-y-0.5">
                                            {apiError.map((err, idx) => (
                                                <li key={idx} className="text-xs font-bold text-rose-600 leading-relaxed">{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="px-12 pb-10 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleBack}
                                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${step === 1 ? "invisible" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}
                            >
                                ← Retour
                            </button>

                            <div className="flex gap-4">
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!isAvailable || !isCapacityValid || isCheckingAvailability}
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
                                    <button
                                        type="button"
                                        onClick={handleSubmit(onSubmit)}
                                        disabled={submitting}
                                        className="px-10 py-4 bg-[#54b172] hover:bg-emerald-600 disabled:opacity-70 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                    >
                                        {submitting
                                            ? "Envoi en cours..."
                                            : "✓ Envoyer la demande"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <footer className="py-10 text-center border-t border-slate-200 mt-20">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                            © 2026 GRH Hôtels · Expérience Client Premium
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    );
}
