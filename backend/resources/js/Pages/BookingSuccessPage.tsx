import { Link } from "@inertiajs/react";
import { Separator } from "@/components/ui/separator";
import type { BookingSchemaType as BookingFormData } from "@/lib/schemas";
import type { Hotel } from "@/types/booking";
import {
  Building2,
  CheckCircle,
  Mail,
  MapPin,
  Calendar,
  Users,
  BedDouble,
  PlusCircle,
} from "lucide-react";
interface Props {
  reference: string;
  formData: BookingFormData;
  hotel: Hotel | null;
  basePrice: number;
  stayTaxTotal: number;
  totalPrice: number;
}

export function BookingSuccessPage({
  reference,
  formData,
  hotel,
  basePrice,
  stayTaxTotal,
  totalPrice,
}: Props) {
  const formatPrice = (amount: number) => new Intl.NumberFormat("fr-MA", { style: "decimal", minimumFractionDigits: 0 }).format(amount) + " MAD";
  
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/60 backdrop-blur-md bg-white/80 py-4 px-6 mb-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
            <div className="w-10 h-10 bg-[#54b172] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Building2 className="text-white w-6 h-6" />
            </div>
            <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none uppercase">
                    Confirmation Demande
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
            {/* Minimal Success Header */}
            <div className="bg-emerald-50/50 border-b border-emerald-100 p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#54b172] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <CheckCircle className="text-white w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight uppercase mb-2">Demande Envoyée</h1>
              <p className="text-slate-500 text-sm font-medium">
                Votre dossier est en cours de traitement par notre équipe de réservation.
              </p>
              
              <div className="mt-8 inline-flex flex-col items-center gap-1 bg-white border border-emerald-200 rounded-xl px-8 py-3 shadow-sm">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">N° de Référence</span>
                <span className="text-slate-900 font-black text-xl tracking-tight">{reference}</span>
              </div>
            </div>

            <div className="p-10 space-y-10">
              {/* Info Notice */}
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl flex gap-4 items-start">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-[#54b172]">
                    <Mail size={16} />
                </div>
                <div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Un récapitulatif a été envoyé à <strong>{formData.email}</strong>. 
                        Notre équipe vous contactera sous 24h pour finaliser votre séjour.
                    </p>
                </div>
              </div>

                    {/* Booking Summary - PORTAL STYLE */}
              <div>
                <h3 className="text-[10px] font-bold text-[#54b172] uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                    Récapitulatif de la Demande
                </h3>

                <div className="grid grid-cols-1 gap-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Agence émettrice</span>
                            <span className="text-sm font-bold text-slate-800">{formData.agencyName}</span>
                        </div>
                        <div className="flex flex-col md:text-right">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Établissement</span>
                            <span className="text-sm font-bold text-slate-800 flex items-center md:justify-end gap-2">
                                <MapPin size={14} className="text-slate-400"/> {hotel?.name} — {hotel?.ville}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             Détails des Groupes de Séjour
                        </h4>
                        {formData.groups.map((group, idx) => {
                            const diff = new Date(group.checkOut).getTime() - new Date(group.checkIn).getTime();
                            const groupNights = Math.max(1, Math.round(diff / 86_400_000));
                            
                            return (
                                <div key={group.uid} className="p-6 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">
                                                {idx + 1}
                                            </span>
                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">Groupe #{idx + 1}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                                            <span>{group.occupants} voyageurs</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                            <span>{groupNights} nuit(s)</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>Du {fmt(group.checkIn)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>Au {fmt(group.checkOut)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50">
                                        <div className="flex flex-wrap gap-2">
                                            {group.rooms.map((r, rIdx) => {
                                                const typeNom = hotel?.chambres.find(c => c.id_type === r.roomTypeId)?.type.nom || "Type Inconnu";
                                                return (
                                                    <span key={rIdx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-700">
                                                        <BedDouble size={12} className="text-slate-400" />
                                                        {r.quantity}x {typeNom}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 p-8 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200">
                    {formData.specialRequests && (
                        <div className="mb-6 pb-6 border-b border-white/10 text-xs text-slate-400 italic">
                             "{formData.specialRequests}"
                        </div>
                    )}

                    <div className="flex justify-between items-end">
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Estimation Totale</p>
                                <p className="text-xs text-white/60 font-medium whitespace-nowrap">Incluant taxes et remises</p>
                            </div>
                            
                            {formData.bookingType === 'agence' && (
                                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-max">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Remise Agence (4%)</span>
                                    <span className="text-sm font-black text-emerald-300">- {formatPrice(basePrice * 0.04)}</span>
                                </div>
                            )}

                            {stayTaxTotal > 0 && (
                                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg w-max">
                                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Taxe de Séjour</span>
                                    <span className="text-sm font-black text-amber-300">+ {formatPrice(stayTaxTotal)}</span>
                                </div>
                            )}
                        </div>
                        <div className="text-right flex flex-col items-end">
                            {formData.bookingType === 'agence' && (
                                <span className="text-lg font-bold text-slate-500 line-through opacity-70 mb-1">
                                    {formatPrice(basePrice + stayTaxTotal)}
                                </span>
                            )}
                            <span className="text-3xl sm:text-4xl font-black text-[#54b172]">{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Action */}
              <Link
                href="/booking"
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
              >
                <PlusCircle size={16} /> Effectuer une nouvelle demande
              </Link>
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
