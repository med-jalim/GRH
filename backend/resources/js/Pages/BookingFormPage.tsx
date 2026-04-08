import { useState, useCallback, useMemo } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
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

export default function BookingFormPage({ hotels }: Props) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<{
        reference: string;
        data: any;
    } | null>(null);

    // React Hook Form
    const methods = useForm<BookingSchemaType>({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: {
            agencyName: "",
            agencyCode: "",
            contactName: "",
            email: "",
            phone: "",
            hotelId: undefined,
            groups: [
                {
                    uid: Math.random().toString(36).substr(2, 9),
                    date_arrivee: "",
                    date_depart: "",
                    items: []
                }
            ],
            specialRequests: "",
        },
        mode: "onBlur",
    });

    const { trigger, handleSubmit, control } = methods;

    // Specifically watch these fields for real-time reactivity
    const watchedHotelId = useWatch({ control, name: "hotelId" });

    const selectedHotel = useMemo(
        () => (hotels || []).find((h) => h.id === Number(watchedHotelId)) ?? null,
        [watchedHotelId, hotels],
    );

    // These are pushed UP from PriceSummary via onTotalChange
    const [totalPrice, setTotalPrice] = useState(0);
    const [nights,     setNights]     = useState(0);

    const handleTotalChange = useCallback((total: number, n: number) => {
        setTotalPrice(total);
        setNights(n);
    }, []);

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
            nom_agence: data.agencyName,
            nom_contact: data.contactName,
            code_agence: data.agencyCode,
            email: data.email,
            telephone: data.phone,
            id_hotel: data.hotelId,
            prix_total: totalPrice,
            remarques_speciales: data.specialRequests,
            groups: data.groups.map((group: any) => {
                const checkInDate = new Date(group.date_arrivee);
                return {
                    date_arrivee: group.date_arrivee,
                    date_depart: group.date_depart,
                    items: group.items.map((r: any) => {
                        const checkInDate = new Date(group.date_arrivee);
                        const validTarif = (selectedHotel?.tarifs || []).find(
                            (t) => {
                                const start = new Date(t.date_debut.substring(0, 10) + "T00:00:00");
                                const end = new Date(t.date_fin.substring(0, 10) + "T23:59:59");
                                return Number(t.id_type) === Number(r.id_type) && start <= checkInDate && end >= checkInDate;
                            }
                        );
                        return {
                            id_type: r.id_type,
                            quantite: r.quantite,
                            prix_unitaire: validTarif?.prix || 0,
                            nb_adultes: r.nb_adultes,
                            nb_enfants: r.nb_enfants,
                            nb_bebes: r.nb_bebes,
                        };
                    })
                };
            })
        };

        try {
            const res = await axios.post("/admin/reservations", payload, {
                headers: { Accept: "application/json" },
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <header className="py-5 px-6">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <span className="text-slate-900 font-black text-xs tracking-tight">
                            GRH
                        </span>
                    </div>
                    <div>
                        <p className="text-white font-bold text-base leading-none">
                            Groupe Résidences Hôtelières
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">
                            Demande de réservation en ligne
                        </p>
                    </div>
                </div>
            </header>

            <main className="px-4 pb-16">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-100 px-8 py-6">
                            <StepIndicator currentStep={step} />
                        </div>

                        <div className="p-8">
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {step === 1 && <AgencyInfoStep />}
                                    {step === 2 && (
                                        <ReservationDetailsStep
                                            hotels={hotels}
                                            onTotalChange={handleTotalChange}
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
                        <div className="px-8 pb-8 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleBack}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${step === 1 ? "invisible" : "text-slate-500 hover:bg-slate-100"}`}
                            >
                                ← Retour
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-8 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-all"
                                >
                                    Continuer →
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={submitting}
                                    className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-slate-900 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                                >
                                    {submitting
                                        ? "Envoi en cours..."
                                        : "✓ Envoyer la demande"}
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-center text-slate-500 text-xs mt-6">
                        Groupe Résidences Hôtelières · 2026
                    </p>
                </div>
            </main>
        </div>
    );
}
