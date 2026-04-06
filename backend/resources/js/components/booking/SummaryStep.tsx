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
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex-shrink-0 mr-4">{label}</span>
      <span className={`text-sm font-bold text-right ${accent ? 'text-[#54b172]' : 'text-slate-700'}`}>
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
    return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#54b172] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/20">3</div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Récapitulatif de la demande</h2>
        </div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-[52px]">Veuillez vérifier vos informations avant validation</p>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
          <h3 className="text-[10px] font-black text-[#54b172] uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Agence & Contact</h3>
          <Row label="Agence"      value={formData.agencyName} />
          <Row label="Code Agence" value={formData.agencyCode} />
          <Row label="Responsable" value={formData.contactName} />
          <Row label="E-mail"      value={formData.email} />
          <Row label="Téléphone"   value={formData.phone} />
        </div>

        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
          <h3 className="text-[10px] font-black text-[#54b172] uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Détails du Séjour</h3>
          <Row label="Hôtel"       value={hotel ? `${hotel.name} — ${hotel.ville}` : '—'} />
          <Row label="Arrivée"     value={fmt(formData.checkIn)} />
          <Row label="Départ"      value={fmt(formData.checkOut)} />
          <Row label="Durée"       value={`${nights} nuit${nights > 1 ? 's' : ''}`} />
          <Row label="Personnes"   value={`${formData.totalOccupants} personne${formData.totalOccupants > 1 ? 's' : ''}`} />
        </div>

        {hotel && formData.rooms.length > 0 && (
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
            <h3 className="text-[10px] font-black text-[#54b172] uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">
              Configuration Chambres ({formData.rooms.reduce((acc: number, r: any) => acc + r.quantity, 0)})
            </h3>
            {formData.rooms.map((room, i) => {
              const chambre = hotel.chambres.find(c => c.id_type === room.roomTypeId);
              const tarif   = hotel.tarifs.find(t => t.id_type === room.roomTypeId);
              const price   = tarif?.prix || 0;
              const sub     = price * nights * room.quantity;

              return (
                <div key={room.uid}>
                  {i > 0 && <Separator className="my-3 opacity-50" />}
                  <div className="flex justify-between items-start py-1">
                    <div>
                      <p className="text-sm font-bold text-slate-800 tracking-tight">{chambre?.type.nom ?? '—'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {room.quantity} chambre{room.quantity > 1 ? 's' : ''} ·{' '}
                        {formatPrice(price)}/nuit
                      </p>
                    </div>
                    <span className="text-sm font-black text-slate-800">{formatPrice(sub)}</span>
                  </div>
                </div>
              );
            })}

            <Separator className="my-5" />
            <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-emerald-100 shadow-sm shadow-emerald-500/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estimation Totale (HT)</span>
              <span className="text-2xl font-black text-[#54b172] tracking-tighter">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="specialRequests" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
            Demandes particulières <span className="lowercase font-normal opacity-50">(optionnel)</span>
          </Label>
          <Textarea 
            id="specialRequests" 
            {...register('specialRequests')} 
            rows={3} 
            className="resize-none border-slate-200 rounded-xl focus:ring-[#54b172] focus:border-[#54b172] text-sm" 
            placeholder="Ex: Chambres côte à côte, lit bébé..."
          />
        </div>

        <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex gap-4 text-emerald-800 text-xs leading-relaxed">
          <div className="w-5 h-5 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-emerald-500/20">
            <span className="text-white font-black text-[10px]">!</span>
          </div>
          <p>
            <strong className="font-black uppercase tracking-widest text-[9px] block mb-1">Information Importante :</strong> 
            Ce formulaire constitue une <strong>demande de réservation</strong>. Elle sera validée par notre équipe sous 24h ouvrées.
          </p>
        </div>
      </div>
    </div>
  );
}
