import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingSchema, type BookingSchemaType } from "@/lib/schemas";
import api from "@/lib/api";

import type { Hotel } from "@/types/booking";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { AgencyInfoStep } from "@/components/booking/AgencyInfoStep";
import { ReservationDetailsStep } from "@/components/booking/ReservationDetailsStep";
import { SummaryStep } from "@/components/booking/SummaryStep";

export function BookingFormPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // API State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

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

  useEffect(() => {
    api
      .get("/hotels")
      .then((res) => {
        if (res.data.success) setHotels(res.data.data);
        else throw new Error(res.data.message);
      })
      .catch((err) => setApiError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedHotel = useMemo(
    () => hotels.find((h) => h.id === formData.hotelId) ?? null,
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
    if (!selectedHotel || nights === 0) return 0;
    return formData.rooms.reduce((sum: number, r: any) => {
      const tarif = selectedHotel.tarifs.find(
        (t) => t.id_type === r.roomTypeId,
      );
      return sum + (tarif ? tarif.prix * nights * r.quantity : 0);
    }, 0);
  }, [formData.rooms, selectedHotel, nights]);

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
    try {
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
        details: data.rooms.map((r: any) => ({
          id_type: r.roomTypeId,
          quantite: r.quantity,
          prix_unitaire:
            selectedHotel?.tarifs.find((t) => t.id_type === r.roomTypeId)
              ?.prix || 0,
        })),
      };

      const res = await api.post("/reservations", payload);

      if (!res.data.success) throw new Error(res.data.message);

      navigate("/success", {
        state: {
          reference: res.data.data.code_reference,
          formData: data,
          hotel: selectedHotel,
          totalPrice,
          nights,
        },
      });
    } catch (err: any) {
      alert(`Erreur : ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

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
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
                  <p className="text-slate-500 font-medium animate-pulse">
                    Chargement des hôtels...
                  </p>
                </div>
              ) : apiError ? (
                <div className="py-12 px-6 bg-red-50 border border-red-100 rounded-2xl text-center">
                  <h3 className="text-red-900 font-bold mb-1">
                    Erreur de connexion
                  </h3>
                  <p className="text-red-600 text-sm mb-4">{apiError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-xs font-bold text-red-700 underline uppercase"
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
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
              )}
            </div>

            {/* Navigation buttons */}
            {!loading && !apiError && (
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
                    {submitting ? "Envoi en cours..." : "✓ Envoyer la demande"}
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-center text-slate-500 text-xs mt-6">
            Groupe Résidences Hôtelières · 2026
          </p>
        </div>
      </main>
    </div>
  );
}
