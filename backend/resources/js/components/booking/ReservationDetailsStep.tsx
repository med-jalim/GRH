import { useEffect, useMemo } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Hotel } from "@/types/booking";
import type { BookingSchemaType } from "@/lib/schemas";
import { RoomRow } from "./RoomRow";
import { PriceSummary } from "./PriceSummary";

interface Props {
    hotels:          Hotel[];
    onTotalChange:   (total: number, nights: number) => void;
}

export function ReservationDetailsStep({ hotels, onTotalChange }: Props) {
    const {
        register,
        setValue,
        control,
        formState: { errors },
    } = useFormContext<BookingSchemaType>();

    const {
        fields: groups,
        append: appendGroup,
        remove: removeGroup,
    } = useFieldArray({
        control,
        name: "groups",
    });

    const watchedGroups = useWatch({ control, name: "groups" }) || [];
    const watchedHotelId = useWatch({ control, name: "hotelId" });

    const today = new Date().toISOString().split("T")[0];

    const selectedHotel = useMemo(
        () => hotels.find((h) => h.id === watchedHotelId) ?? null,
        [watchedHotelId, hotels],
    );

    const handleHotelChange = (id: number | null) => {
        setValue("hotelId", id as any);
        // Reset groups but keep at least one
        setValue("groups", [
            {
                uid: Math.random().toString(36).substr(2, 9),
                date_arrivee: "",
                date_depart: "",
                items: [],
            },
        ]);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shadow-lg shadow-slate-800/20">
                        <span className="text-amber-400 text-sm font-bold">
                            2
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                        Détails de la réservation
                    </h2>
                </div>
                <p className="text-slate-400 text-sm ml-11">
                    Sélectionnez l'hôtel et précisez les périodes et types de
                    chambres.
                </p>
            </div>

            <div className="space-y-6">
                {/* Hotel Selection */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <Label
                        htmlFor="hotel"
                        className="text-slate-700 font-bold text-sm block mb-2"
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
                        className={`w-full h-11 rounded-xl border bg-white px-4 text-sm font-medium text-slate-700 transition-all focus:ring-2 focus:ring-slate-300 ${errors.hotelId ? "border-red-400" : "border-slate-200"}`}
                    >
                        <option value="">— Sélectionner un hôtel —</option>
                        {hotels.map((h) => (
                            <option key={h.id} value={h.id}>
                                {"★".repeat(h.stars)} {h.name} — {h.ville}
                            </option>
                        ))}
                    </select>
                    {errors.hotelId && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium">
                            {errors.hotelId.message}
                        </p>
                    )}
                </div>

                {!selectedHotel ? (
                    <div className="p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-slate-300"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                            </svg>
                        </div>
                        <h4 className="text-slate-500 font-semibold mb-1">
                            Aucun hôtel sélectionné
                        </h4>
                        <p className="text-slate-400 text-sm">
                            Veuillez choisir un établissement pour continuer la
                            réservation.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Render Groups */}
                        {groups.map((groupField, groupIndex) => (
                            <GroupBlock
                                key={groupField.id}
                                groupIndex={groupIndex}
                                hotel={selectedHotel}
                                onRemove={() => removeGroup(groupIndex)}
                                isRemovable={groups.length > 1}
                            />
                        ))}

                        {/* Add Group Button */}
                        <button
                            type="button"
                            onClick={() =>
                                appendGroup({
                                    uid: Math.random()
                                        .toString(36)
                                        .substr(2, 9),
                                    date_arrivee: "",
                                    date_depart: "",
                                    items: [],
                                })
                            }
                            className="w-full py-4 bg-white border-2 border-dashed border-slate-200 rounded-3xl text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 group"
                        >
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                <svg
                                    className="w-5 h-5 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                            </span>
                            Ajouter une autre période ou un autre groupe de
                            voyageurs
                        </button>

                        <PriceSummary
                            groups={watchedGroups}
                            hotel={selectedHotel}
                            onTotalChange={onTotalChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Inner Component for Group Block
function GroupBlock({
    groupIndex,
    hotel,
    onRemove,
    isRemovable,
}: {
    groupIndex: number;
    hotel: Hotel;
    onRemove: () => void;
    isRemovable: boolean;
}) {
    const {
        register,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<BookingSchemaType>();
    const groupData = watch(`groups.${groupIndex}`);
    const today = new Date().toISOString().split("T")[0];

    const {
        fields: roomFields,
        append: appendRoom,
        remove: removeRoom,
        update: updateRoom,
    } = useFieldArray({
        control,
        name: `groups.${groupIndex}.items` as any,
    });

    const checkInDate = groupData.date_arrivee
        ? new Date(groupData.date_arrivee)
        : null;
    const checkOutDate = groupData.date_depart
        ? new Date(groupData.date_depart)
        : null;
    const nights =
        checkInDate && checkOutDate
            ? Math.max(
                  1,
                  Math.round(
                      (checkOutDate.getTime() - checkInDate.getTime()) /
                          86400000,
                  ),
              )
            : 0;

    const availableTypes = useMemo(() => {
        if (!hotel.tarifs || !groupData.date_arrivee) return [];

        // Get all types available for the selected check-in date
        const typesForDate = hotel.tarifs
            .filter(
                (t) =>
                    new Date(t.date_debut) <= checkInDate! &&
                    new Date(t.date_fin) >= checkInDate!,
            )
            .map((t) => ({
                type: hotel.chambres?.find((c) => c.id_type === t.id_type)
                    ?.type,
                price: t.prix,
            }))
            .filter((t) => t.type) as { type: any; price: number }[];

        return typesForDate;
    }, [hotel, checkInDate]);

    return (
        <div className="relative p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow group-block">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 font-extrabold shadow-lg shadow-amber-500/20">
                        {groupIndex + 1}
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-800">
                            Groupe ou Période {groupIndex + 1}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">
                            Définissez les dates et l'hébergement pour ce bloc
                        </p>
                    </div>
                </div>
                {isRemovable && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Dates */}
                <div className="space-y-2">
                    <Label className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                        Arrivée
                    </Label>
                        <Input
                            type="date"
                            min={today}
                            {...register(
                                `groups.${groupIndex}.date_arrivee` as any,
                            )}
                            className="h-11 rounded-xl bg-slate-50 border-slate-200"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                            Départ
                        </Label>
                        <Input
                            type="date"
                            min={groupData.date_arrivee || today}
                            {...register(
                                `groups.${groupIndex}.date_depart` as any,
                            )}
                            className="h-11 rounded-xl bg-slate-50 border-slate-200"
                        />
                    </div>
            </div>

            <div
                className={`space-y-4 transition-all duration-500 ${!groupData.date_arrivee ? "opacity-50 pointer-events-none grayscale" : ""}`}
            >
                <Label className="text-slate-500 font-bold text-[11px] uppercase tracking-wider block mb-2">
                    {groupData.date_arrivee
                        ? "Choix de l'hébergement"
                        : "⚠️ Veuillez d'abord choisir une date d'arrivée"}
                </Label>
                <div className="space-y-3">
                    {roomFields.map((field, roomIdx) => {
                        const currentItem = groupData.items?.[roomIdx] || field;
                        const currentTypeId = currentItem.id_type;
                        const rowAvailableOptions = availableTypes.filter(
                            (opt) =>
                                opt.type.id === currentTypeId ||
                                !(groupData.items || []).some(
                                    (item: any) => item.id_type === opt.type.id
                                )
                        );

                        const typeCapacity = hotel.type_capacities?.find(
                            (tc) => tc.id_type === currentTypeId
                        );

                        return (
                            <RoomRow
                                key={field.id}
                                room={currentItem as any}
                                index={roomIdx}
                                nights={nights}
                                availableOptions={rowAvailableOptions}
                                typeCapacity={typeCapacity}
                                onChange={(uid, fieldName, val) => {
                                    updateRoom(roomIdx, {
                                        ...currentItem,
                                        [fieldName]: val,
                                    });
                                }}
                                onRemove={() => removeRoom(roomIdx)}
                            />
                        );
                    })}

                    {(() => {
                        const unassignedTypes = availableTypes.filter(
                            (opt) =>
                                !(groupData.items || []).some(
                                    (item: any) => item.id_type === opt.type.id
                                )
                        );

                        return (
                            <button
                                type="button"
                                disabled={
                                    !groupData.date_arrivee ||
                                    unassignedTypes.length === 0
                                }
                                onClick={() => {
                                    if (unassignedTypes.length > 0) {
                                        appendRoom({
                                            uid: crypto.randomUUID(),
                                            id_type: unassignedTypes[0].type.id,
                                            quantite: 1,
                                            nb_adultes: 1,
                                            nb_enfants: 0,
                                            nb_bebes: 0,
                                        });
                                    }
                                }}
                                className="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                            >
                                {!groupData.date_arrivee
                                    ? "Sélectionnez une date pour ajouter des chambres"
                                    : unassignedTypes.length === 0 &&
                                        (groupData.items || []).length > 0
                                      ? "Toutes les chambres disponibles sont déjà ajoutées"
                                      : "+ Ajouter une chambre pour ce groupe"}
                            </button>
                        );
                    })()}
                </div>
            </div>

            {nights > 0 && nights < 100 && (
                <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">
                        Durée du séjour
                    </span>
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-black">
                        {nights} Nuits
                    </span>
                </div>
            )}
        </div>
    );
}
