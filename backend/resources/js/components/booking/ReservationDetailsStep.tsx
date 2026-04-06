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
}

export function ReservationDetailsStep({ hotels, totalPrice, disabledHotel = false, reservationId, onAvailabilityChange, onCheckingChange }: Props) {
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
                occupants: 1,
                rooms: [
                    {
                        uid: Math.random().toString(36).substr(2, 9),
                        roomTypeId: defaultTypeId,
                        quantity: 1
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
            occupants: 1,
            rooms: [
                {
                    uid: Math.random().toString(36).substr(2, 9),
                    roomTypeId: allTypes[0]?.type.id || 0,
                    quantity: 1
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
                    quantity: 1
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
            return {
                ...g,
                rooms: g.rooms.map(r => r.uid === roomUid ? { ...r, [field]: value } : r)
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
                <div className="space-y-8">
                    {formData.groups?.map((group, idx) => (
                        <GroupRow
                            key={group.uid}
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

                    {formData.hotelId ? (
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
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Veuillez d'abord sélectionner un hôtel</p>
                        </div>
                    )}
                </div>

                <PriceSummary totalPrice={totalPrice} groups={formData.groups} hotel={selectedHotel} />
            </div>
        </div>
    );
}
