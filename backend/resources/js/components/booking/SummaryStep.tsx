import { BedDouble } from 'lucide-react';
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
  basePrice:  number;
  stayTaxTotal: number;
  totalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  groupCalculations: any[];
}

function Row({ label, value, accent, strikethrough }: { label: string; value: string; accent?: boolean; strikethrough?: boolean }) {
  return (
    <div className="flex justify-between items-start py-2">
      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex-shrink-0 mr-4">{label}</span>
      <span className={`text-sm font-bold text-right ${accent ? 'text-[#54b172]' : strikethrough ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
}

export function SummaryStep({ 
  hotel, 
  basePrice, 
  stayTaxTotal, 
  totalPrice, 
  discountPercentage, 
  discountAmount, 
  groupCalculations = [] 
}: Props) {
  const { register, watch } = useFormContext<BookingSchemaType>();
  const formData = watch();

  const totalOccupants = formData.groups?.reduce((acc, g) => acc + (Number(g.occupants) || 0), 0) || 0;

  return (
    <div>
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#54b172] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/20">3</div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Estimation des Frais</h2>
        </div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-[52px]">Veuillez vérifier votre estimation avant validation</p>
      </div>

      <div className="space-y-6">
        {/* Contact Info */}
        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
          <h3 className="text-[10px] font-black text-[#54b172] uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Agence & Contact</h3>
          <Row label="Agence"      value={formData.agencyName || '—'} />
          <Row label="Code Agence" value={formData.agencyCode || '—'} />
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
          const calculation = groupCalculations[gIdx] || { percentage: 0, amount: 0, subTotal: 0 };

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
                        
                        const multiplier = formData.bookingType === 'agence' 
                            ? Number((hotel as any)?.agency_ratio ?? 0.96) 
                            : Number((hotel as any)?.group_ratio ?? 1.00);

                        const price = computeDynamicPrice(hotel, room.roomTypeId, room.subTypeId, checkInDate, multiplier);
                        const sub = price * groupNights * room.quantity;

                        return (
                            <div key={room.uid} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm group-hover:border-[#54b172] group-hover:text-[#54b172] transition-all">
                                        <BedDouble size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            {chambre?.type.nom ?? '—'} 
                                            {selectedSubType && (
                                                <span className="text-[#54b172] ml-1.5 font-bold">
                                                    ({selectedSubType.nom})
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 underline decoration-slate-200/50 underline-offset-4">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                                {room.adults}A {room.children > 0 && `· ${room.children}E`}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {formatPrice(price)}/nuit
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-flex items-center justify-center px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black mb-1">
                                        x{room.quantity}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 tracking-tight">{formatPrice(sub)}</p>
                                </div>
                            </div>
                        );
                    })}

                    {calculation.percentage > 0 && (
                        <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                                    <span className="text-[10px] font-black">-{calculation.percentage}%</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Remise de nuitée</p>
                                    <p className="text-[9px] text-emerald-600 font-bold uppercase mt-0.5 tracking-tight">Appliquée sur ce groupe ({groupNights} nuits)</p>
                                </div>
                            </div>
                            <p className="text-sm font-black text-emerald-700 tracking-tighter">-{formatPrice(calculation.amount)}</p>
                        </div>
                    )}
                </div>
            </div>
          );
        })}

        <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                        <h3 className="text-[10px] font-black text-[#54b172] uppercase tracking-[0.2em] mb-2">Détail des Tarifs</h3>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-400 flex justify-between gap-8">
                                <span>Sous-total Hébergement :</span>
                                <span className={discountPercentage > 0 ? 'line-through opacity-70' : 'font-bold text-white'}>{formatPrice(basePrice)}</span>
                            </p>
                            {discountPercentage > 0 && (
                                <p className="text-xs text-emerald-400 flex justify-between gap-8 font-bold">
                                    <span>Remise :</span>
                                    <span>- {formatPrice(discountAmount)}</span>
                                </p>
                            )}
                            {stayTaxTotal > 0 && (
                                <p className="text-xs text-amber-400 flex justify-between gap-8 font-bold">
                                    <span>Taxes de séjour :</span>
                                    <span>+ {formatPrice(stayTaxTotal)}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Total Net à payer</h3>
                        <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">TVA & Taxes incluses</p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black tracking-tighter text-white leading-none">{formatPrice(totalPrice)}</p>
                    </div>
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
