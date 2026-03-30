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
    return new Date(d + 'T00:00:00').toLocaleDateString('fr-DZ', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 text-sm font-bold">3</div>
          <h2 className="text-xl font-bold text-slate-800">Récapitulatif de la demande</h2>
        </div>
        <p className="text-slate-400 text-sm ml-11">Vérifiez les informations avant d'envoyer votre demande</p>
      </div>

      <div className="space-y-5">
        <div className="bg-slate-50 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Agence de voyage</h3>
          <Row label="Agence"      value={formData.agencyName} />
          <Row label="Responsable" value={formData.contactName} />
          <Row label="E-mail"      value={formData.email} />
          <Row label="Téléphone"   value={formData.phone} />
        </div>

        <div className="bg-slate-50 rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Réservation</h3>
          <Row label="Hôtel"       value={hotel ? `${hotel.name} — ${hotel.ville}` : '—'} />
          <Row label="Arrivée"     value={fmt(formData.checkIn)} />
          <Row label="Départ"      value={fmt(formData.checkOut)} />
          <Row label="Durée"       value={`${nights} nuit${nights > 1 ? 's' : ''}`} />
          <Row label="Personnes"   value={`${formData.totalOccupants} personne${formData.totalOccupants > 1 ? 's' : ''}`} />
        </div>

        {hotel && formData.rooms.length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Chambres ({formData.rooms.reduce((acc: number, r: any) => acc + r.quantity, 0)})
            </h3>
            {formData.rooms.map((room, i) => {
              const chambre = hotel.chambres.find(c => c.id_type === room.roomTypeId);
              const tarif   = hotel.tarifs.find(t => t.id_type === room.roomTypeId);
              const price   = tarif?.prix || 0;
              const sub     = price * nights * room.quantity;

              return (
                <div key={room.uid}>
                  {i > 0 && <Separator className="my-2" />}
                  <div className="flex justify-between items-start py-1">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{chambre?.type.nom ?? '—'}</p>
                      <p className="text-xs text-slate-400">
                        {room.quantity} chambre{room.quantity > 1 ? 's' : ''} ·{' '}
                        {formatPrice(price)}/nuit
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{formatPrice(sub)}</span>
                  </div>
                </div>
              );
            })}

            <Separator className="my-3" />
            <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-sm font-semibold text-slate-600">Total estimé</span>
              <span className="text-xl font-black text-amber-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="specialRequests" className="text-slate-700 font-medium text-sm">
            Demandes particulières <span className="text-slate-400 font-normal">(optionnel)</span>
          </Label>
          <Textarea 
            id="specialRequests" 
            {...register('specialRequests')} 
            rows={3} 
            className="resize-none border-slate-200" 
          />
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-700 text-sm">
          <p><strong>Note :</strong> Ce formulaire constitue une demande de réservation. Notre équipe vous contactera sous 24h.</p>
        </div>
      </div>
    </div>
  );
}
