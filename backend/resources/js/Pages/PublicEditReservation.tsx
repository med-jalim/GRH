import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import axios from "axios";
import { bookingSchema, type BookingSchemaType } from "@/lib/schemas";

import type { Hotel } from "@/types/booking";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { AgencyInfoStep } from "@/components/booking/AgencyInfoStep";
import { ReservationDetailsStep } from "@/components/booking/ReservationDetailsStep";
import { SummaryStep } from "@/components/booking/SummaryStep";

interface Props {
    reservation: any;
    hotels: Hotel[];
}

export default function PublicEditReservation({ reservation, hotels }: Props) {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // React Hook Form
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

    const { watch, trigger, handleSubmit, setValue } = methods;
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
                  (t: any) =>
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
            await axios.post(`/reservation/${reservation.token}/update`, payload);
            console.log(payload);
            router.visit(`/reservation/${reservation.token}/confirm`); // Just a way to show success
        } catch (error) {
            console.error("API Error:", error);
            alert("Une erreur est survenue lors de la mise à jour.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900">
            <header className="py-8 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                   <h1 className="text-2xl font-black text-white uppercase tracking-widest">Modifier ma réservation</h1>
                   <p className="text-slate-400 text-xs mt-2">Référence : <span className="text-amber-500 font-mono font-bold">{reservation.code_reference}</span></p>
                </div>
            </header>

            <main className="px-4 pb-16">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
                        <div className="bg-slate-50 border-b border-slate-100 px-8 py-6">
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
                                            disabledHotel={true}
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

                        <div className="px-12 pb-12 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleBack}
                                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${step === 1 ? "invisible" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}
                            >
                                ← Retour
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black tracking-wide transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20"
                                >
                                    Continuer →
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={submitting}
                                    className="px-10 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-slate-900 rounded-2xl text-sm font-black tracking-wide transition-all active:scale-[0.98] shadow-xl shadow-amber-500/20 flex items-center gap-2"
                                >
                                    {submitting ? "Mise à jour..." : "✓ Enregistrer les modifications"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
