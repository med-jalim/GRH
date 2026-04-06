import type { GroupSelection, RoomSelection, RoomType } from '@/types/booking';
import { RoomRow } from './RoomRow';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/data/mockData';
import { nanoid } from 'nanoid';

interface RoomOption {
  type: RoomType;
  price: number;
}

interface Props {
  group:            GroupSelection;
  availableOptions: RoomOption[];
  index:            number;
  onUpdateGroup:    (uid: string, field: keyof GroupSelection, value: any) => void;
  onUpdateRoom:     (groupUid: string, roomUid: string, field: keyof RoomSelection, value: any) => void;
  onAddRoom:        (groupUid: string) => void;
  onRemoveRoom:     (groupUid: string, roomUid: string) => void;
  onRemoveGroup:    (uid: string) => void;
  availabilityData?: Record<string, any>;
}

export function GroupRow({ 
  group, 
  availableOptions, 
  index, 
  onUpdateGroup, 
  onUpdateRoom, 
  onAddRoom, 
  onRemoveRoom, 
  onRemoveGroup,
  availabilityData
}: Props) {
  const today = new Date().toISOString().split("T")[0];
  
  // Calculate total for this group
  const diff = group.checkIn && group.checkOut ? new Date(group.checkOut).getTime() - new Date(group.checkIn).getTime() : 0;
  const nights = Math.max(1, Math.round(diff / 86_400_000));
  
  const groupTotal = group.rooms.reduce((acc, room) => {
    const opt = availableOptions.find(o => o.type.id === room.roomTypeId);
    return acc + (opt?.price || 0) * room.quantity * nights;
  }, 0);

  return (
    <div className="group/group-row flex flex-col gap-6 p-8 bg-white rounded-3xl border border-slate-200 hover:border-[#54b172]/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/30 rounded-full -mr-16 -mt-16 blur-3xl group-hover/group-row:bg-emerald-100/40 transition-colors" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-950 text-white font-black text-lg shadow-lg shadow-slate-200 group-hover/group-row:scale-110 group-hover/group-row:bg-[#54b172] transition-all duration-500">
            {index + 1}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Groupe de Séjour #{index + 1}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Configuration du segment voyageur</p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => onRemoveGroup(group.uid)}
          className="flex items-center gap-2 px-4 py-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest bg-rose-50 rounded-xl hover:bg-rose-100 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Supprimer le groupe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date d'Arrivée</label>
          <Input
            type="date"
            min={today}
            value={group.checkIn}
            onChange={e => onUpdateGroup(group.uid, 'checkIn', e.target.value)}
            className="h-12 bg-white rounded-xl border-slate-200 font-bold text-sm focus:ring-[#54b172]/20 focus:border-[#54b172] shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date de Départ</label>
          <Input
            type="date"
            min={group.checkIn || today}
            value={group.checkOut}
            onChange={e => onUpdateGroup(group.uid, 'checkOut', e.target.value)}
            className="h-12 bg-white rounded-xl border-slate-200 font-bold text-sm focus:ring-[#54b172]/20 focus:border-[#54b172] shadow-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre de Voyageurs</label>
          <div className="relative">
            <Input
              type="number"
              min="1"
              value={group.occupants}
              onChange={e => onUpdateGroup(group.uid, 'occupants', Math.max(1, Number(e.target.value)))}
              className="h-12 bg-white rounded-xl border-slate-200 font-bold text-sm focus:ring-[#54b172]/20 focus:border-[#54b172] pl-10 shadow-sm"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Choix des Hébergements</h4>
          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
            {nights} {nights > 1 ? 'Nuits' : 'Nuit'}
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          {group.rooms.map((room) => {
            const filteredOptions = availableOptions.filter(opt => 
                !group.rooms.some(r => r.uid !== room.uid && r.roomTypeId === opt.type.id)
            );
            
            return (
              <RoomRow
                key={room.uid}
                room={room}
                availableOptions={filteredOptions}
                onChange={(ruid, field, val) => onUpdateRoom(group.uid, ruid, field, val)}
                onRemove={(ruid) => onRemoveRoom(group.uid, ruid)}
                availability={availabilityData ? availabilityData[room.uid] : null}
              />
            );
          })}
        </div>

        {group.rooms.length < availableOptions.length && (
          <button
            type="button"
            onClick={() => onAddRoom(group.uid)}
            className="w-full h-12 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:border-[#54b172] hover:text-[#54b172] hover:bg-emerald-50/50 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un type de chambre pour ce groupe
          </button>
        )}
      </div>

      {/* Group Footer */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-end relative z-10">
         <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sous-total du groupe</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">
              {formatPrice(groupTotal)}
            </p>
         </div>
      </div>
    </div>
  );
}
