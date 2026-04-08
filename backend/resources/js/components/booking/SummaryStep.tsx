import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Hotel } from '@/types/booking';
import { formatPrice } from '@/data/mockData';
import type { BookingSchemaType } from '@/lib/schemas';

interface Props {
  hotel:      Hotel | null;
  nights:     number;
  totalPrice: number;
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-start py-2">
      <span className="text-sm text-slate-500 flex-shrink-0 mr-4">{label}</span>
      <span className={`text-sm font-medium text-right ${accent ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
}

export function SummaryStep({ hotel, nights, totalPrice }: Props) {
  const { register, watch } = useFormContext<BookingSchemaType>();
  const formData = watch();

  const fmt = (d: string) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('fr-MA', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 text-sm font-bold shadow-lg shadow-slate-800/20">3</div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Récapitulatif de la demande</h2>
        </div>
        <p className="text-slate-400 text-sm ml-11">Veuillez vérifier les détails de chaque période avant l'envoi.</p>
      </div>

      <div className="space-y-8">
        {/* Agence Info */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200/50 pb-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Agence & Contact</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <Row label="Agence"      value={formData.agencyName} />
            <Row label="Code Agence" value={formData.agencyCode} />
            <Row label="Responsable" value={formData.contactName} />
            <Row label="E-mail"      value={formData.email} />
            <Row label="Téléphone"   value={formData.phone} />
          </div>
        </div>

        {/* Hotel Header */}
        <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-xl">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Établissement sélectionné</h3>
           <p className="text-lg font-black text-amber-400">{hotel ? hotel.name : '—'}</p>
           <p className="text-xs text-slate-300 font-medium">{hotel ? hotel.ville : '—'}</p>
        </div>

        {/* Groups Summary */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Détails par groupe / séjour</h3>
          {formData.groups.map((group, idx) => {
            const gCheckIn = new Date(group.date_arrivee);
            const gCheckOut = new Date(group.date_depart);
            const gNights = (group.date_arrivee && group.date_depart) 
              ? Math.max(1, Math.round((gCheckOut.getTime() - gCheckIn.getTime()) / 86400000))
              : 0;

            return (
              <div key={group.uid} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-900 text-xs font-black flex items-center justify-center">{idx + 1}</span>
                    <span className="text-sm font-bold text-slate-700">Séjour du {fmt(group.date_arrivee)} au {fmt(group.date_depart)}</span>
                  </div>
                  <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">{gNights} nuits</span>
                </div>

                <div className="space-y-3">
                  {(group.items || []).map((item: any, rIdx: number) => {
                    const chambre = hotel?.chambres?.find(c => c.id_type === item.id_type);
                    const tarif   = hotel?.tarifs?.find(t => 
                      t.id_type === item.id_type && 
                      new Date(t.date_debut) <= gCheckIn && 
                      new Date(t.date_fin) >= gCheckIn
                    );
                    const sub = (tarif?.prix || 0) * gNights * (item.quantite || 0);

                    return (
                      <div key={item.uid} className="flex justify-between items-start py-1">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{chambre?.type.nom ?? '—'}</p>
                          <p className="text-xs text-slate-400">
                             Quantité: {item.quantite} · {formatPrice(tarif?.prix || 0)}/nuit
                             <span className="ml-2 text-amber-600 font-bold">
                                (Ad. {item.nb_adultes} Enf. {item.nb_enfants} Béb. {item.nb_bebes})
                             </span>
                          </p>
                        </div>
                        <span className="text-sm font-bold text-slate-700">{formatPrice(sub)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-center bg-amber-500 p-6 rounded-3xl shadow-lg shadow-amber-500/20">
          <div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest opacity-70">Total estimé de la demande</span>
            <p className="text-xs text-slate-900 font-bold opacity-80">Toutes périodes confondues</p>
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatPrice(totalPrice)}</span>
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <Label htmlFor="specialRequests" className="text-slate-700 font-bold text-xs uppercase ml-1">
            Demandes particulières / Commentaires
          </Label>
          <Textarea 
            id="specialRequests" 
            {...register('specialRequests')} 
            rows={4} 
            placeholder="Ex: Chambres communicantes, lit bébé, arrivée tardive..."
            className="resize-none border-slate-200 rounded-2xl focus:ring-slate-300 p-4 text-sm" 
          />
        </div>

        <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex gap-4 text-blue-700 text-sm">
          <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="font-medium">Cette demande sera vérifiée par notre équipe commerciale. Un devis définitif vous sera envoyé par e-mail après validation des disponibilités.</p>
        </div>
      </div>
    </div>
  );
}
