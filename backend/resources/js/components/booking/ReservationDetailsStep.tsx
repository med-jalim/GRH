import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Hotel } from "@/types/booking";
import type { BookingSchemaType } from "@/lib/schemas";
import { RoomRow } from "./RoomRow";
import { PriceSummary } from "./PriceSummary";

interface Props {
    hotels: Hotel[];
    nights: number;
    totalPrice: number;
}

export function ReservationDetailsStep({ hotels, nights, totalPrice }: Props) {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<BookingSchemaType>();

    const formData = watch();
    const today = new Date().toISOString().split("T")[0];

    const selectedHotel = useMemo(
        () => hotels.find((h) => h.id === formData.hotelId) ?? null,
        [formData.hotelId, hotels],
    );

    const typesWithPrices = useMemo(() => {
        if (!selectedHotel || !selectedHotel.chambres) return [];

        const checkInDate = formData.checkIn
            ? new Date(formData.checkIn)
            : null;

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

                let validTarif = null;
                if (checkInDate && selectedHotel.tarifs) {
                    validTarif = selectedHotel.tarifs.find(
                        (t) =>
                            t.id_type === tid &&
                            new Date(t.date_debut) <= checkInDate &&
                            new Date(t.date_fin) >= checkInDate,
                    );
                } else if (!checkInDate && selectedHotel.tarifs) {
                    // If no checkIn selected yet, loosely show all available types, we'll pick the first
                    validTarif = selectedHotel.tarifs.find(
                        (t) => t.id_type === tid,
                    );
                }

                if (!chambre?.type || !validTarif) return null;
                return { type: chambre.type, price: validTarif.prix };
            })
            .filter(Boolean) as { type: any; price: number }[];
    }, [selectedHotel, formData.checkIn]);

    const handleHotelChange = (id: number | null) => {
        setValue("hotelId", id as any);
        setValue("rooms", []);
    };

    const updateRoom = (uid: string, field: string, value: number) => {
        const updated = formData.rooms.map((r) => {
            if (r.uid !== uid) return r;
            return { ...r, [field]: value };
        });
        setValue("rooms", updated);
    };

    const removeRoom = (uid: string) => {
        setValue(
            "rooms",
            formData.rooms.filter((r) => r.uid !== uid),
        );
    };

    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 text-sm font-bold">
                        2
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                        Détails de la réservation
                    </h2>
                </div>
                <p className="text-slate-400 text-sm ml-11">
                    Hôtel, dates et types de chambres
                </p>
            </div>

            <div className="space-y-6">
                {/* Hotel */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="hotel"
                        className="text-slate-700 font-medium text-sm"
                    >
                        Hôtel <span className="text-red-400">*</span>
                    </Label>
                    <select
                        id="hotel"
                        {...register("hotelId", { valueAsNumber: true })}
                        onChange={(e) =>
                            handleHotelChange(
                                e.target.value ? Number(e.target.value) : null,
                            )
                        }
                        className={`w-full h-10 rounded-lg border bg-white px-3 text-sm text-slate-700 transition-all ${errors.hotelId ? "border-red-400" : "border-slate-200"}`}
                    >
                        <option value="">— Sélectionner un hôtel —</option>
                        {hotels.map((h) => (
                            <option key={h.id} value={h.id}>
                                {"★".repeat(h.stars)} {h.name} — {h.ville}
                            </option>
                        ))}
                    </select>
                    {errors.hotelId && (
                        <p className="text-red-500 text-xs">
                            {errors.hotelId.message}
                        </p>
                    )}
                </div>

                {/* Total Occupants */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="totalOccupants"
                        className="text-slate-700 font-medium text-sm"
                    >
                        Nombre total de personnes{" "}
                        <span className="text-red-400">*</span>
                    </Label>
                    <Input
                        id="totalOccupants"
                        type="number"
                        {...register("totalOccupants", { valueAsNumber: true })}
                        className={
                            errors.totalOccupants ? "border-red-400" : ""
                        }
                    />
                    {errors.totalOccupants && (
                        <p className="text-red-500 text-xs">
                            {errors.totalOccupants.message}
                        </p>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="checkIn"
                            className="text-slate-700 font-medium text-sm"
                        >
                            Date d'arrivée{" "}
                            <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="checkIn"
                            type="date"
                            min={today}
                            {...register("checkIn")}
                            className={errors.checkIn ? "border-red-400" : ""}
                        />
                        {errors.checkIn && (
                            <p className="text-red-500 text-xs">
                                {errors.checkIn.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="checkOut"
                            className="text-slate-700 font-medium text-sm"
                        >
                            Date de départ{" "}
                            <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            id="checkOut"
                            type="date"
                            min={formData.checkIn || today}
                            {...register("checkOut")}
                            className={errors.checkOut ? "border-red-400" : ""}
                        />
                        {errors.checkOut && (
                            <p className="text-red-500 text-xs">
                                {errors.checkOut.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Rooms */}
                <div className="space-y-3">
                    <Label className="text-slate-700 font-medium text-sm">
                        Chambres <span className="text-red-400">*</span>
                    </Label>
                    {!selectedHotel ? (
                        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-sm text-slate-400">
                            Sélectionnez un hôtel pour ajouter des chambres
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {formData.rooms.map((room, i) => (
                                <RoomRow
                                    key={room.uid}
                                    room={room}
                                    availableOptions={typesWithPrices.filter(
                                        (tp) =>
                                            !formData.rooms
                                                .map((r) => r.roomTypeId)
                                                .includes(tp.type.id) ||
                                            tp.type.id === room.roomTypeId,
                                    )}
                                    nights={nights}
                                    index={i}
                                    onChange={updateRoom as any}
                                    onRemove={removeRoom}
                                />
                            ))}

                            {formData.rooms.length < typesWithPrices.length && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const firstUnused =
                                            typesWithPrices.find(
                                                (tp) =>
                                                    !formData.rooms
                                                        .map(
                                                            (r) => r.roomTypeId,
                                                        )
                                                        .includes(tp.type.id),
                                            );
                                        if (firstUnused) {
                                            setValue("rooms", [
                                                ...formData.rooms,
                                                {
                                                    uid: crypto.randomUUID(),
                                                    roomTypeId:
                                                        firstUnused.type.id,
                                                    quantity: 1,
                                                },
                                            ]);
                                        }
                                    }}
                                    className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    + Ajouter un type de chambre
                                </button>
                            )}
                            {errors.rooms && (
                                <p className="text-red-500 text-xs">
                                    {errors.rooms.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {formData.rooms.length > 0 && nights > 0 && (
                    <PriceSummary
                        rooms={formData.rooms}
                        hotel={selectedHotel}
                        nights={nights}
                        totalPrice={totalPrice}
                    />
                )}
            </div>
        </div>
    );
}
