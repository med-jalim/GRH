import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Hotel } from '@/types/booking';
import { formatPrice } from '@/data/mockData';
import type { BookingSchemaType } from '@/lib/schemas';
import { computeDynamicPrice } from '@/lib/utils';

interface Props {
  hotel:      Hotel | null;
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

export function SummaryStep({ hotel, totalPrice }: Props) {
  const { register, watch } = useFormContext<BookingSchemaType>();
  const formData = watch();

  console.log(formData) ;

  const totalOccupants = formData.groups?.reduce((acc, g) => acc + (Number(g.occupants) || 0), 0) || 0;

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
        {/* Contact Info */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
          <h3 className="text-[10px] font-black text-[#54b172] uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Agence & Contact</h3>
          <Row label="Agence"      value={formData.agencyName} />
          <Row label="Code Agence" value={formData.agencyCode} />
          <Row label="Responsable" value={formData.contactName} />
          <Row label="E-mail"      value={formData.email} />
          <Row label="Téléphone"   value={formData.phone} />
        </div>

        {/* Stay Summary */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
          <h3 className="text-[10px] font-black text-[#54b172] uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Détails Globaux</h3>
          <Row label="Hôtel"       value={hotel ? `${hotel.name} — ${hotel.ville}` : '—'} />
          <Row label="Total Pers." value={`${totalOccupants} personne${totalOccupants > 1 ? 's' : ''}`} />
          <Row label="Total Groupes" value={`${formData.groups?.length || 0} groupe(s)`} />
        </div>

        {/* Groups Breakdown */}
        {hotel && formData.groups?.map((group, gIdx) => {
          const diff = group.checkIn && group.checkOut ? new Date(group.checkOut).getTime() - new Date(group.checkIn).getTime() : 0;
          const groupNights = Math.max(1, Math.round(diff / 86_400_000));
          const checkInDate = new Date(group.checkIn);

          return (
            <div key={group.uid} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-md">
                            {gIdx + 1}
                        </span>
                        <div>
                            <h4 className="text-sm font-black text-slate-800 tracking-tight">Groupe #{gIdx + 1}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {group.occupants} voyageurs · {groupNights} nuits
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-[#54b172] uppercase tracking-widest mb-0.5">Période du séjour</p>
                        <p className="text-[10px] font-bold text-slate-600">
                            Du {group.checkIn} au {group.checkOut}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {group.rooms.map((room) => {
                        const chambre = hotel.chambres.find(c => c.id_type === room.roomTypeId);
                        const selectedSubType = (chambre?.type as any)?.sub_types?.find((st: any) => st.id === room.subTypeId);
                        const price = computeDynamicPrice(hotel, room.roomTypeId, room.subTypeId, checkInDate);
                        const sub = price * groupNights * room.quantity;

                        return (
                            <div key={room.uid} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            {chambre?.type.nom ?? '—'} 
                                            {selectedSubType && (
                                                <span className="text-[#54b172] ml-1.5">
                                                    ({selectedSubType.nom})
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {room.quantity} unité(s) · {formatPrice(price)}/nuit
                                        </p>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                                            {room.adults}A {room.children > 0 && `· ${room.children}E`} {room.babies > 0 && `· ${room.babies}B`} per chambre
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 tracking-tighter">{formatPrice(sub)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          );
        })}

        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="relative z-10">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-[10px] font-black text-[#54b172] uppercase tracking-[0.2em] mb-2">Total de la Demande</h3>
                    <p className="text-xs text-slate-400">Taxes de séjour incluses dans l'estimation</p>
                </div>
                <div className="text-right">
                    <p className="text-4xl font-black tracking-tighter text-white leading-none">{formatPrice(totalPrice)}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{formData.groups?.reduce((acc, g) => acc + g.rooms.reduce((ra, r) => ra + r.quantity, 0), 0)} unité(s) au total</p>
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Notes & Remarques Spéciales</Label>
            <Textarea
              {...register('specialRequests')}
              placeholder="Ex: Arrivée tardive, allergie alimentaire, besoins spécifiques..."
              className="min-h-[140px] bg-slate-50/50 rounded-2xl border-slate-200 text-sm focus:ring-[#54b172]/20 focus:border-[#54b172] p-6 shadow-inner"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
