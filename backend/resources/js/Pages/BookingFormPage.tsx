import { useState, useCallback, useMemo, useEffect } from "react";
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
    types:  any[];
    settings: { min_rooms: number };
}

export default function BookingFormPage({ hotels, types, settings }: Props) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<{
        reference: string;
        data: any;
    } | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    // React Hook Form
    const methods = useForm<BookingSchemaType>({
        resolver: zodResolver(bookingSchema) as any,
        defaultValues: {
            client_type: "agence",
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

    const [hotelTarifs, setHotelTarifs] = useState<any[]>([]);

    // Specifically watch these fields for real-time reactivity
    const watchedHotelId = useWatch({ control, name: "hotelId" });
    const watchedClientType = useWatch({ control, name: "client_type" });

    // Fetch adjusted tarifs from backend when hotel or client type changes
    useEffect(() => {
        if (watchedHotelId) {
            fetch(`/booking/tarifs/${watchedHotelId}?client_type=${watchedClientType}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setHotelTarifs(data.tarifs);
                    }
                })
                .catch(err => console.error("Error fetching tarifs:", err));
        } else {
            setHotelTarifs([]);
        }
    }, [watchedHotelId, watchedClientType]);

    const selectedHotel = useMemo(
        () => (hotels || []).find((h) => h.id === Number(watchedHotelId)) ?? null,
        [watchedHotelId, hotels],
    );

    // Merge active tarifs into the selected hotel object for easier prop passing
    const hotelWithActiveTarifs = useMemo(() => {
        if (!selectedHotel) return null;
        return {
            ...selectedHotel,
            tarifs: hotelTarifs
        };
    }, [selectedHotel, hotelTarifs]);

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
        if (step === 2) {
            const watchedGroups = methods.getValues("groups") || [];
            const count = watchedGroups.reduce((acc, g) => acc + (g.items?.reduce((iAcc, item) => iAcc + (Number(item.quantite) || 0), 0) || 0), 0);
            
            if (count < settings.min_rooms) {
                setApiError(`Attention: Un minimum de ${settings.min_rooms} chambres est requis.`);
                return;
            }
            
            fieldsToValidate = [
                "hotelId",
                "groups",
            ];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            setApiError(null);
            setStep((s) => s + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleBack = () => {
        setApiError(null);
        setStep((s) => Math.max(1, s - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const onSubmit = async (data: BookingSchemaType) => {
        setSubmitting(true);

        const payload = {
            client_type: data.client_type,
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
                        const checkInStr = group.date_arrivee.substring(0, 10);
                        const validTarif = (hotelWithActiveTarifs?.tarifs || []).find(
                            (t: any) => {
                                const startStr = t.date_debut.toString().substring(0, 10);
                                const endStr   = t.date_fin.toString().substring(0, 10);
                                return Number(t.id_capacity) === Number(r.id_capacity) && 
                                       checkInStr >= startStr && 
                                       checkInStr <= endStr;
                            }
                        );
                        return {
                            id_type: r.id_type,
                            id_capacity: r.id_capacity,
                            quantite: r.quantite,
                            prix_unitaire: Number(validTarif?.prix || 0),
                            nb_adultes: r.nb_adultes,
                            nb_enfants: r.nb_enfants,
                        };
                    })
                };
            })
        };

        try {
            setApiError(null);
            const res = await axios.post("/admin/reservations", payload, {
                headers: { Accept: "application/json" },
            });
            setSuccessData({
                reference: res.data.data.code_reference,
                data: data,
            });
        } catch (error: any) {
            console.error("API Error:", error);
            if (error.response?.data?.message) {
                setApiError(error.response.data.message);
            } else {
                setApiError("Une erreur est survenue lors de la réservation.");
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
                hotel={hotelWithActiveTarifs}
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

                        {apiError && (
                            <div className="mx-8 mt-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm font-bold">{apiError}</p>
                            </div>
                        )}

                        <div className="p-8">
                            <FormProvider {...methods}>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {step === 1 && <AgencyInfoStep />}
                                    {step === 2 && (
                                            <ReservationDetailsStep
                                                hotels={hotels}
                                                activeHotel={hotelWithActiveTarifs}
                                                types={types}
                                                onTotalChange={handleTotalChange}
                                                discounts={hotelWithActiveTarifs?.discounts || []}
                                                settings={settings}
                                            />
                                    )}
                                    {step === 3 && (
                                        <SummaryStep
                                            hotel={hotelWithActiveTarifs}
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
