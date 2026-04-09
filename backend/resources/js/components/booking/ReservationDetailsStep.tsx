import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useFormContext } from "react-hook-form";
import axios from "axios";
import { Label } from "@/components/ui/label";
import type { Hotel, GroupSelection, RoomSelection } from "@/types/booking";
import type { BookingSchemaType } from "@/lib/schemas";
import { GroupRow } from "./GroupRow";
import { PriceSummary } from "./PriceSummary";
import { computeDynamicPrice } from "@/lib/utils";

interface Props {
    hotels: Hotel[];
    totalPrice: number;
    disabledHotel?: boolean;
    reservationId?: number;
    onAvailabilityChange?: (isAvailable: boolean) => void;
    onCheckingChange?: (isChecking: boolean) => void;
    onCapacityErrorChange?: (hasError: boolean) => void;
}

export function ReservationDetailsStep({ hotels, totalPrice, disabledHotel = false, reservationId, onAvailabilityChange, onCheckingChange, onCapacityErrorChange }: Props) {
    const {
        register,
        watch,
        setValue,
        trigger,
        formState: { errors },
    } = useFormContext<BookingSchemaType>();

    const formData = watch();
    const today = new Date().toISOString().split("T")[0];

    const [availabilityMap, setAvailabilityMap] = useState<any>(null);
    const [isChecking, setIsCheckingInternal] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const setIsChecking = useCallback((val: boolean) => {
        setIsCheckingInternal(val);
        onCheckingChange?.(val);
    }, [onCheckingChange]);

    const checkAvailability = useCallback(async () => {
        if (!formData.hotelId || !formData.groups || formData.groups.length === 0) return;

        setIsChecking(true);
        try {
            const res = await axios.post("/booking/check-availability", {
                id_hotel: formData.hotelId,
                groups: formData.groups,
                reservation_id: reservationId
            });
            if (res.data.success) {
                // Flatten results for easier access by UID
                const map: Record<string, any> = {};
                res.data.availability.forEach((group: any) => {
                    group.rooms.forEach((room: any) => {
                        if (room.uid) map[room.uid] = room;
                    });
                });
                setAvailabilityMap(map);
                
                const allAvailable = res.data.availability.every((g: any) => 
                    g.rooms.every((r: any) => r.available)
                );
                onAvailabilityChange?.(allAvailable);
            }
        } catch (err) {
            console.error("Availability check failed", err);
        } finally {
            setIsChecking(false);
        }
    }, [formData.hotelId, formData.groups, reservationId]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            checkAvailability();
        }, 600);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [formData.hotelId, formData.groups, checkAvailability]);

    const selectedHotel = useMemo(
        () => hotels.find((h) => h.id === formData.hotelId) ?? null,
        [formData.hotelId, hotels],
    );

    const allTypes = useMemo(() => {
        if (!selectedHotel || !selectedHotel.chambres) return [];

        const uniqueTypeIds = [
            ...new Set(
                selectedHotel.chambres.map((c) => c?.id_type).filter(Boolean),
            ),
        ];

        return uniqueTypeIds
            .map((tid) => {
                const chambre = selectedHotel.chambres.find(
                    (c) => c.id_type === tid,
                );
                
                if (!chambre?.type) return null;
                
                
                const dynamicPrice = computeDynamicPrice(selectedHotel, tid, today);

                return { type: chambre.type, price: dynamicPrice };
            })
            .filter(Boolean) as { type: any; price: number }[];
    }, [selectedHotel]);

    // Capacity Validation Logic
    const hasCapacityError = useMemo(() => {
        if (!availabilityMap) return false;
        
        return formData.groups.some(group => 
            group.rooms.some(room => {
                const avail = availabilityMap[room.uid];
                if (!avail || !avail.capacities) return false;
                
                const caps = avail.capacities;
                return (
                    room.adults > (caps.cap_adultes * room.quantity) ||
                    room.children > (caps.cap_enfants * room.quantity) ||
                    room.babies > (caps.cap_bebes * room.quantity)
                );
            })
        );
    }, [formData.groups, availabilityMap]);

    useEffect(() => {
        onCapacityErrorChange?.(hasCapacityError);
    }, [hasCapacityError, onCapacityErrorChange]);

    const handleHotelChange = (id: number | null) => {
        setValue("hotelId", id as any);
        
        // Find default type for the new hotel
        const newlySelectedHotel = hotels.find(h => h.id === id);
        let defaultTypeId = 0;
        if (newlySelectedHotel && newlySelectedHotel.chambres?.length > 0) {
           defaultTypeId = newlySelectedHotel.chambres[0]?.id_type || 0;
        }

        const checkInDate = new Date(today);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + 1);

        setValue("groups", [
            {
                uid: Math.random().toString(36).substr(2, 9),
                checkIn: today,
                checkOut: checkOutDate.toISOString().split("T")[0],
                occupants: 2,
                rooms: [
                    {
                        uid: Math.random().toString(36).substr(2, 9),
                        roomTypeId: defaultTypeId,
                        quantity: 1,
                        adults: 2,
                        children: 0,
                        babies: 0,
                    }
                ]
            }
        ]);
        
        // Let react-hook-form revalidate the step 2 since we forcibly changed values
        setTimeout(() => trigger(["hotelId", "groups"]), 50);
    };

    // Group Management
    const addGroup = () => {
        const checkInDate = new Date(today);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + 1);
        
        const newGroup: GroupSelection = {
            uid: Math.random().toString(36).substr(2, 9),
            checkIn: today,
            checkOut: checkOutDate.toISOString().split("T")[0],
            occupants: 2,
            rooms: [
                {
                    uid: Math.random().toString(36).substr(2, 9),
                    roomTypeId: allTypes[0]?.type.id || 0,
                    quantity: 1,
                    adults: 2,
                    children: 0,
                    babies: 0,
                }
            ]
        };
        setValue("groups", [...(formData.groups || []), newGroup]);
    };

    const removeGroup = (uid: string) => {
        setValue("groups", formData.groups.filter(g => g.uid !== uid));
    };

    const updateGroup = (uid: string, field: keyof GroupSelection, value: any) => {
        const updated = formData.groups.map(g => g.uid === uid ? { ...g, [field]: value } : g);
        setValue("groups", updated);
    };

    // Room Management (Inside Group)
    const addRoomToGroup = (groupUid: string) => {
        const updated = formData.groups.map(g => {
            if (g.uid !== groupUid) return g;
            
            const selectedTypeIds = g.rooms.map(r => r.roomTypeId);
            const firstAvailable = allTypes.find(t => !selectedTypeIds.includes(t.type.id));
            const nextTypeId = firstAvailable?.type.id || 0;

            return {
                ...g,
                rooms: [...g.rooms, {
                    uid: Math.random().toString(36).substr(2, 9),
                    roomTypeId: nextTypeId,
                    quantity: 1,
                    adults: 2,
                    children: 0,
                    babies: 0,
                }]
            };
        });
        setValue("groups", updated);
    };

    const removeRoomFromGroup = (groupUid: string, roomUid: string) => {
        const updated = formData.groups.map(g => {
            if (g.uid !== groupUid) return g;
            // Keep at least one room
            if (g.rooms.length <= 1) return g;
            return {
                ...g,
                rooms: g.rooms.filter(r => r.uid !== roomUid)
            };
        });
        setValue("groups", updated);
    };

    const updateRoomInGroup = (groupUid: string, roomUid: string, field: keyof RoomSelection, value: any) => {
        const updated = formData.groups.map(g => {
            if (g.uid !== groupUid) return g;
            
            const newRooms = g.rooms.map(r => r.uid === roomUid ? { ...r, [field]: value } : r);
            const totalOccupants = newRooms.reduce((acc, r) => acc + (r.adults + r.children + r.babies), 0);

            return {
                ...g,
                occupants: totalOccupants,
                rooms: newRooms
            };
        });
        setValue("groups", updated);
    };

    return (
        <div>
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#54b172] flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/20">
                        2
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                        Détails du Séjour
                    </h2>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest ml-[52px]">
                    Choix de l'Hôtel et Groupes de Voyageurs
                </p>
            </div>

            <div className="space-y-12">
                {/* Hotel Selection */}
                <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Hôtel Partenaire
                    </Label>
                    <select
                        disabled={disabledHotel}
                        value={formData.hotelId || ""}
                        onChange={(e) => handleHotelChange(Number(e.target.value))}
                        className={`w-full h-14 rounded-2xl border ${
                            errors.hotelId ? "border-rose-300" : "border-slate-200"
                        } px-6 text-sm font-bold text-slate-700 bg-white focus:outline-none focus:ring-4 focus:ring-[#54b172]/10 focus:border-[#54b172] transition-all shadow-sm ${
                            disabledHotel ? "opacity-60 cursor-not-allowed bg-slate-50" : ""
                        }`}
                    >
                        <option value="" disabled>
                            -- Sélectionner un établissement --
                        </option>
                        {hotels.map((h) => (
                            <option key={h.id} value={h.id}>
                                {h.name} ({h.ville}) — {h.stars}★
                            </option>
                        ))}
                    </select>
                    {errors.hotelId && (
                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">
                            {errors.hotelId.message}
                        </p>
                    )}
                </div>

                {/* Groups Section */}
                {formData.hotelId ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {hasCapacityError && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3 animate-in fade-in slide-in-from-left-2">
                                <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none mb-1">Capacité dépassée</p>
                                    <p className="text-xs font-bold text-rose-600 leading-tight">
                                        Certaines de vos sélections dépassent le nombre maximum d'occupants autorisés pour ces chambres. Veuillez corriger les valeurs en rouge.
                                    </p>
                                </div>
                            </div>
                        )}

                        {formData.groups?.map((group, idx) => (
                            <GroupRow
                                key={group.uid}
                                hotel={selectedHotel}
                                group={group}
                                availableOptions={allTypes}
                                index={idx}
                                onUpdateGroup={updateGroup}
                                onUpdateRoom={updateRoomInGroup}
                                onAddRoom={addRoomToGroup}
                                onRemoveRoom={removeRoomFromGroup}
                                onRemoveGroup={removeGroup}
                                availabilityData={availabilityMap}
                            />
                        ))}

                        <button
                            type="button"
                            onClick={addGroup}
                            className="w-full py-6 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-bold hover:border-[#54b172] hover:text-[#54b172] hover:bg-emerald-50/50 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#54b172] group-hover:text-white transition-colors duration-300">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest">Ajouter un nouveau groupe de voyageurs</span>
                        </button>
                        
                        <PriceSummary totalPrice={totalPrice} groups={formData.groups} hotel={selectedHotel} />
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 text-slate-300">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Action Requise</h3>
                        <p className="text-xs text-slate-400 font-medium max-w-[280px] leading-relaxed italic">
                            Veuillez choisir un hôtel ci-dessus pour configurer vos groupes et vos types de chambres.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
