import type { GroupSelection, Hotel } from '@/types/booking';
import { formatPrice } from '@/data/mockData';

interface Props {
  groups:     GroupSelection[];
  hotel:      Hotel | null;
  totalPrice: number;
}

export function PriceSummary({ groups, hotel, totalPrice }: Props) {
  if (!hotel || (groups || []).length === 0) return null;

  return (
    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm shadow-emerald-500/5 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-[#54b172] shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
        </div>
        <h3 className="text-[10px] font-black text-[#54b172] uppercase tracking-[0.2em]">Estimation des Frais</h3>
      </div>

      <div className="space-y-6 mb-6">
        {groups.map((group, groupIdx) => {
          if (!group.checkIn || !group.checkOut) return null;
          const diff = new Date(group.checkOut).getTime() - new Date(group.checkIn).getTime();
          const groupNights = Math.max(1, Math.round(diff / 86_400_000));
          const checkInDate = new Date(group.checkIn);

          return (
            <div key={group.uid} className="space-y-3 p-4 bg-white/40 rounded-xl border border-emerald-100/50">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Groupe #{groupIdx + 1} · {groupNights} nuits</p>
                <p className="text-[9px] font-bold text-slate-400">{group.checkIn} au {group.checkOut}</p>
              </div>

              {group.rooms.map(room => {
                const chambre = hotel.chambres.find(c => c.id_type === room.roomTypeId);
                const tarif = hotel.tarifs.find(
                  (t) =>
                    t.id_type === room.roomTypeId &&
                    new Date(t.date_debut) <= checkInDate &&
                    new Date(t.date_fin) >= checkInDate,
                );

                if (!chambre || !tarif) return null;
                const sub = tarif.prix * groupNights * room.quantity;

                return (
                  <div key={room.uid} className="flex justify-between items-start gap-4 border-b border-emerald-50 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-tight">{chambre.type.nom}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {room.quantity} unités · {formatPrice(tarif.prix)}/nuit
                      </p>
                    </div>
                    <span className="text-xs font-black text-slate-800 whitespace-nowrap">{formatPrice(sub)}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-emerald-200 p-4 flex justify-between items-center shadow-sm shadow-emerald-500/5">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimé (HT)</p>
          <p className="text-[9px] font-bold text-[#54b172] uppercase tracking-widest mt-0.5">
            {groups.length} groupe{groups.length > 1 ? 's' : ''} · {groups.reduce((acc, g) => acc + g.rooms.reduce((ra, r) => ra + r.quantity, 0), 0)} unité{groups.reduce((acc, g) => acc + g.rooms.reduce((ra, r) => ra + r.quantity, 0), 0) > 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#54b172] tracking-tighter">{formatPrice(totalPrice)}</p>
        </div>
      </div>
    </div>
  );
}
