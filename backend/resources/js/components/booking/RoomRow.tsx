import { useMemo } from "react";
import type { RoomSelection, RoomType, TypeCapacity } from "@/types/booking";
import { formatPrice } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Minus, Plus, AlertTriangle, X } from "lucide-react";

interface RoomOption {
    type: RoomType;
    capacity: TypeCapacity;
    price: number;
}

interface Props {
    room: RoomSelection;
    availableOptions: RoomOption[];
    nights: number;
    index: number;
    typeCapacity?: TypeCapacity;
    onChange: (uid: string, updates: Partial<RoomSelection>) => void;
    onRemove: (uid: string) => void;
}

function CompactStepper({
    label,
    value,
    max,
    min = 0,
    onChange,
}: {
    label: string;
    value: number;
    max: number;
    min?: number;
    onChange: (val: number) => void;
}) {
    const isOver = value > max;
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase min-w-[50px]">
                {label}
            </span>
            <div
                className={`flex items-center gap-1 bg-white border rounded-lg p-0.5 ${isOver ? "border-red-400 bg-red-50" : "border-slate-200"}`}
            >
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-20"
                >
                    <Minus className="w-3 h-3 text-slate-500" />
                </button>
                <span
                    className={`text-xs font-bold w-4 text-center ${isOver ? "text-red-600" : "text-slate-700"}`}
                >
                    {value}
                </span>
                <button
                    type="button"
                    onClick={() => onChange(value + 1)}
                    className="p-1 hover:bg-slate-100 rounded"
                >
                    <Plus className="w-3 h-3 text-slate-500" />
                </button>
            </div>
            <span className="text-[9px] text-slate-400 font-medium">
                / {max}
            </span>
        </div>
    );
}

export function RoomRow({
    room,
    availableOptions,
    nights,
    index,
    typeCapacity,
    onChange,
    onRemove,
}: Props) {
    const selectedOption = availableOptions.find(
        (opt) => opt.capacity.id === room.id_capacity,
    );

    const availableTypes = useMemo(() => {
        const typesMap = new Map();
        availableOptions.forEach((opt) => {
            if (!typesMap.has(opt.type.id)) typesMap.set(opt.type.id, opt.type);
        });
        return Array.from(typesMap.values());
    }, [availableOptions]);

    const filteredConfigs = useMemo(() => {
        return availableOptions.filter((opt) => opt.type.id === room.id_type);
    }, [availableOptions, room.id_type]);

    const price = selectedOption?.price || 0;
    const subtotal = price * nights * room.quantite;

    // Capacity Logic
    const maxAdultesConfig =
        (typeCapacity?.capacite_adultes ?? 2) * room.quantite;
    const maxEnfantsConfig =
        (typeCapacity?.capacite_enfants ?? 2) * room.quantite;
    const maxTotal =
        (typeCapacity?.capacite_totale ?? maxAdultesConfig + maxEnfantsConfig) *
        room.quantite;

    const currentMaxAdultes = Math.min(
        maxAdultesConfig,
        maxTotal - room.nb_enfants,
    );
    const currentMaxEnfants = Math.min(
        maxEnfantsConfig,
        maxTotal - room.nb_adultes,
    );

    const hasWarning =
        room.nb_adultes + room.nb_enfants > maxTotal ||
        room.nb_adultes > maxAdultesConfig ||
        room.nb_enfants > maxEnfantsConfig;

    return (
        <div className="flex flex-col gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-200 transition-all">
            {/* Top row: Selection & Basic Logistics */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 w-5">
                        #{index + 1}
                    </span>
                </div>

                <div className="flex-1 min-w-[400px] grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Type Select */}
                    <div className="sm:col-span-1">
                        <select
                            value={room.id_type || ""}
                            onChange={(e) => {
                                const typeId = Number(e.target.value);
                                const firstOpt = availableOptions.find(
                                    (o) => o.type.id === typeId,
                                );
                                if (firstOpt) {
                                    const mt =
                                        firstOpt.capacity.capacite_totale;
                                    let newA = Math.min(
                                        room.nb_adultes,
                                        firstOpt.capacity.capacite_adultes,
                                    );
                                    let newC = Math.min(
                                        room.nb_enfants,
                                        mt - newA,
                                    );
                                    onChange(room.uid, {
                                        id_type: typeId,
                                        id_capacity: firstOpt.capacity.id,
                                        nb_adultes: newA,
                                        nb_enfants: newC,
                                    });
                                }
                            }}
                            className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-slate-400 outline-none transition-all"
                        >
                            <option value="" disabled>
                                Type...
                            </option>
                            {availableTypes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Config Select */}
                    <div className="sm:col-span-1">
                        <select
                            value={room.id_capacity || ""}
                            onChange={(e) => {
                                const capId = Number(e.target.value);
                                const opt = filteredConfigs.find(
                                    (o) => o.capacity.id === capId,
                                );
                                if (opt) {
                                    const mt = opt.capacity.capacite_totale;
                                    let newA = Math.min(
                                        room.nb_adultes,
                                        opt.capacity.capacite_adultes,
                                    );
                                    let newC = Math.min(
                                        room.nb_enfants,
                                        mt - newA,
                                    );
                                    onChange(room.uid, {
                                        id_capacity: capId,
                                        nb_adultes: newA,
                                        nb_enfants: newC,
                                    });
                                }
                            }}
                            className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 focus:ring-1 focus:ring-slate-400 outline-none transition-all"
                            disabled={!room.id_type}
                        >
                            {!room.id_type ? (
                                <option value="">Choisir type...</option>
                            ) : (
                                filteredConfigs.map((opt) => (
                                    <option
                                        key={opt.capacity.id}
                                        value={opt.capacity.id}
                                    >
                                        {opt.capacity.label} —{" "}
                                        {formatPrice(opt.price)}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Rooms
                        </span>
                        <Input
                            type="number"
                            min="1"
                            value={room.quantite}
                            onChange={(e) =>
                                onChange(room.uid, {
                                    quantite: Math.max(
                                        1,
                                        Number(e.target.value),
                                    ),
                                })
                            }
                            className="h-9 w-16 rounded-lg text-center font-bold text-xs"
                        />
                    </div>

                    {/* Price Summary */}
                    <div className="flex items-center justify-end gap-3 ml-auto">
                        <div className="text-right">
                            <span className="text-sm font-black text-slate-800">
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemove(room.uid)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom row: Occupancy & Warning (Compact) */}
            <div className="flex flex-wrap items-center gap-6 pl-7">
                <CompactStepper
                    label="Adultes"
                    value={room.nb_adultes}
                    max={currentMaxAdultes}
                    onChange={(val) => onChange(room.uid, { nb_adultes: val })}
                />
                <CompactStepper
                    label="Enfants"
                    value={room.nb_enfants}
                    max={currentMaxEnfants}
                    onChange={(val) => onChange(room.uid, { nb_enfants: val })}
                />

                {hasWarning && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-[10px] font-bold text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        Capacité dépassée !
                    </div>
                )}
            </div>
        </div>
    );
}
