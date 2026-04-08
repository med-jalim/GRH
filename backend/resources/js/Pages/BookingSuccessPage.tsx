import { Link } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import type { BookingSchemaType as BookingFormData } from '@/lib/schemas';
import type { Hotel } from '@/types/booking';
import { formatPrice } from '@/data/mockData';

interface Props {
  reference:  string;
  formData:   BookingFormData;
  hotel:      Hotel | null;
  totalPrice: number;
  nights:     number;
}

export function BookingSuccessPage({ reference, formData, hotel, totalPrice, nights }: Props) {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('fr-MA', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="py-5 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <span className="text-slate-900 font-black text-xs">GRH</span>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">Groupe Résidences Hôtelières</p>
            <p className="text-slate-400 text-xs mt-0.5">Confirmation de demande</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pb-16 flex items-start justify-center">
        <div className="w-full max-w-2xl">
          {/* Success card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
            {/* Green banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-8 text-center">
              {/* Animated check */}
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-white">Demande envoyée !</h1>
              <p className="text-emerald-100 text-sm mt-1">
                Votre demande de réservation a été reçue avec succès
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                <span className="text-emerald-100 text-xs font-medium">N° de référence</span>
                <span className="text-white font-black text-lg tracking-wider">{reference}</span>
              </div>
            </div>

            {/* Details */}
            <div className="p-8 space-y-6">
              {/* Info notice */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-blue-700 text-sm">
                  Notre équipe vous contactera à l'adresse{' '}
                  <strong>{formData.email}</strong> dans un délai de 24h pour confirmer votre réservation.
                </p>
              </div>

              {/* Booking summary */}
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Récapitulatif de votre demande
                </h2>

                <div className="bg-slate-50 rounded-2xl p-5 space-y-2">
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-slate-500">Agence</span>
                    <span className="text-sm font-medium text-slate-700">{formData.agencyName}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-slate-500">Responsable</span>
                    <span className="text-sm font-medium text-slate-700">{formData.contactName}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-slate-500">Hôtel</span>
                    <span className="text-sm font-medium text-slate-700">{hotel?.name} — {hotel?.ville}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-slate-500">Arrivée (min)</span>
                    <span className="text-sm font-medium text-slate-700">
                      {formData.groups.length > 0 ? fmt(formData.groups.reduce((min, g) => (g.date_arrivee < min ? g.date_arrivee : min), formData.groups[0].date_arrivee)) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-slate-500">Départ (max)</span>
                    <span className="text-sm font-medium text-slate-700">
                      {formData.groups.length > 0 ? fmt(formData.groups.reduce((max, g) => (g.date_depart > max ? g.date_depart : max), formData.groups[0].date_depart)) : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-slate-500">Durée globale</span>
                    <span className="text-sm font-medium text-slate-700">{nights} nuit{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-slate-500">Personnes (Total)</span>
                    <span className="text-sm font-medium text-slate-700">
                      {formData.groups.reduce((acc: number, g: any) => 
                        acc + g.items.reduce((ra: number, r: any) => 
                          ra + (Number(r.nb_adultes || 0) + Number(r.nb_enfants || 0) + Number(r.nb_bebes || 0)) * r.quantite, 0), 0)} personnes
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-slate-500">Chambres (Total)</span>
                    <span className="text-sm font-medium text-slate-700">
                      {formData.groups.reduce((acc: number, g: any) => acc + g.items.reduce((ra: number, r: any) => ra + r.quantite, 0), 0)} chambres
                    </span>
                  </div>

                  <Separator />
                  <div className="flex justify-between py-1 items-center">
                    <span className="text-sm font-semibold text-slate-600">Total estimé</span>
                    <span className="text-xl font-black text-amber-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {formData.specialRequests && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-400 mb-1">Demandes particulières</p>
                    <p className="text-sm text-slate-600 italic">"{formData.specialRequests}"</p>
                  </div>
                )}
              </div>

              {/* New request button */}
              <Link
                href="/booking"
                className="block w-full py-3 text-center bg-slate-800 hover:bg-slate-900 text-white
                  rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg"
              >
                + Nouvelle demande de réservation
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-500 text-xs mt-6">
            Groupe Résidences Hôtelières · Toutes les demandes sont traitées sous 24h
          </p>
        </div>
      </main>
    </div>
  );
}
