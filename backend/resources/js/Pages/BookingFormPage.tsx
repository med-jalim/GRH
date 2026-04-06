import { useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, usePage } from "@inertiajs/react";
import axios from "axios";
import { bookingSchema, type BookingSchemaType } from "@/lib/schemas";

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
    const [successData, setSuccessData] = useState<{
        reference: string;
        data: any;
    } | null>(null);

    // React Hook Form
    const methods = useForm<BookingSchemaType>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            agencyName: "",
            agencyCode: "",
            contactName: "",
            email: "",
            phone: "",
            hotelId: undefined,
            checkIn: "",
            checkOut: "",
            totalOccupants: 0,
            rooms: [],
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

    const nights = useMemo(() => {
        if (!formData.checkIn || !formData.checkOut) return 0;
        const diff =
            new Date(formData.checkOut).getTime() -
            new Date(formData.checkIn).getTime();
        return Math.max(0, Math.round(diff / 86_400_000));
    }, [formData.checkIn, formData.checkOut]);

    const totalPrice = useMemo(() => {
        if (!selectedHotel || nights === 0 || !formData.checkIn) return 0;
        const checkInDate = new Date(formData.checkIn);
        return formData.rooms.reduce((sum: number, r: any) => {
            const tarif = selectedHotel.tarifs.find(
                (t) =>
                    t.id_type === r.roomTypeId &&
                    new Date(t.date_debut) <= checkInDate &&
                    new Date(t.date_fin) >= checkInDate,
            );
            return sum + (tarif ? tarif.prix * nights * r.quantity : 0);
        }, 0);
    }, [formData.rooms, selectedHotel, nights, formData.checkIn]);

    // ── Navigation ───────────────────────────────────────
    const handleNext = async () => {
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
                "checkIn",
                "checkOut",
                "totalOccupants",
                "rooms",
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
            nom_agence: data.agencyName,
            nom_contact: data.contactName,
            code_agence: data.agencyCode,
            email: data.email,
            telephone: data.phone,
            id_hotel: data.hotelId,
            date_arrivee: data.checkIn,
            date_depart: data.checkOut,
            nb_personnes: data.totalOccupants,
            prix_total: totalPrice,
            remarques_speciales: data.specialRequests,
            details: data.rooms.map((r: any) => {
                const checkInDate = new Date(data.checkIn);
                const validTarif = selectedHotel?.tarifs.find(
                    (t) =>
                        t.id_type === r.roomTypeId &&
                        new Date(t.date_debut) <= checkInDate &&
                        new Date(t.date_fin) >= checkInDate,
                );
                return {
                    id_type: r.roomTypeId,
                    quantite: r.quantity,
                    prix_unitaire: validTarif?.prix || 0,
                };
            }),
        };

        try {
            const res = await axios.post("/booking", payload, {
                headers: { Accept: "application/json" }
            });
            setSuccessData({
                reference: res.data.data.code_reference,
                data: data,
            });
        } catch (error) {
            console.error("API Error:", error);
            alert("Une erreur est survenue lors de la réservation.");
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
                totalPrice={totalPrice}
                nights={nights}
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
                                            nights={nights}
                                            totalPrice={totalPrice}
                                        />
                                    )}
                                    {step === 3 && (
                                        <SummaryStep
                                            hotel={selectedHotel}
                                            nights={nights}
                                            totalPrice={totalPrice}
                                        />
                                    )}
                                </form>
                            </FormProvider>
                        </div>

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
                                        className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
                                    >
                                        Suivant →
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
