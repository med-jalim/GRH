import type { RoomSelection, RoomType, TypeCapacity } from "@/types/booking";
import { formatPrice } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Minus, Plus, AlertTriangle } from "lucide-react";

interface RoomOption {
    type: RoomType;
    price: number;
}

interface Props {
    room: RoomSelection;
    availableOptions: RoomOption[];
    nights: number;
    index: number;
    typeCapacity?: TypeCapacity;
    onChange: (uid: string, field: keyof RoomSelection, value: number) => void;
    onRemove: (uid: string) => void;
}

function Stepper({
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
        <div className="flex flex-col gap-1 items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {label}
            </span>
            <div
                className={`flex items-center gap-2 bg-white px-2 py-1.5 rounded-lg border focus-within:ring-2 focus-within:ring-slate-300 transition-all ${isOver ? "border-red-400 bg-red-50" : "border-slate-200"}`}
            >
                <button
                    type="button"
                    onClick={() => onChange(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 transition-colors"
                >
                    <Minus className="w-3 h-3" />
                </button>
                <span
                    className={`text-xs font-black w-4 text-center ${isOver ? "text-red-500" : "text-slate-700"}`}
                >
                    {value}
                </span>
                <button
                    type="button"
                    onClick={() => onChange(value + 1)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            <span
                className={`text-[9px] font-medium ${isOver ? "text-red-500" : "text-slate-400"}`}
            >
                Max total: {max}
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
        (opt) => opt.type.id === room.id_type,
    );
    const price = selectedOption?.price || 0;
    const subtotal = price * nights;

    // Resolve max capacities (multiplied by quantity)
    const maxAdultes = (typeCapacity?.capacite_adultes ?? 2) * room.quantite;
    const maxEnfants = (typeCapacity?.capacite_enfants ?? 2) * room.quantite;
    const maxBebes = (typeCapacity?.capacite_bebes ?? 2) * room.quantite;

    // Check capacity overrides
    const overAdultes = room.nb_adultes > maxAdultes;
    const overEnfants = room.nb_enfants > maxEnfants;
    const overBebes = room.nb_bebes > maxBebes;
    const hasCapacityWarning =
        overAdultes || overEnfants || overBebes;

    return (
        <div className="flex flex-col gap-4 p-5 bg-slate-50/50 rounded-[1.5rem] border border-slate-200 hover:border-slate-300 transition-colors">
            {/* Top Row: Room Type & Quantity & Price/Delete */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-800/20">
                        {index + 1}
                    </span>
                </div>

                <div className="flex-1 w-full gap-3 grid grid-cols-1 sm:grid-cols-3">
                    <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Type de chambre
                        </label>
                        <select
                            value={room.id_type}
                            onChange={(e) =>
                                onChange(
                                    room.uid,
                                    "id_type",
                                    Number(e.target.value),
                                )
                            }
                            className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all"
                        >
                            {availableOptions.map((opt) => (
                                <option key={opt.type.id} value={opt.type.id}>
                                    {opt.type.nom} — {formatPrice(opt.price)}
                                    /nuit
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Nombre de chambres
                        </label>
                        <Input
                            type="number"
                            min="1"
                            value={room.quantite}
                            onChange={(e) =>
                                onChange(
                                    room.uid,
                                    "quantite",
                                    Math.max(1, Number(e.target.value)),
                                )
                            }
                            className="h-10 bg-white rounded-xl font-bold"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                    <div className="text-right">
                        {subtotal > 0 && (
                            <p className="text-base font-black text-amber-600 leading-none">
                                {formatPrice(subtotal * room.quantite)}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemove(room.uid)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Bottom Row: Occupancy configuration */}
            <div className="bg-white rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap gap-6 items-start">
                    <Stepper
                        label="Adultes"
                        value={room.nb_adultes}
                        max={maxAdultes}
                        onChange={(val) =>
                            onChange(room.uid, "nb_adultes", val)
                        }
                    />
                    <Stepper
                        label="Enfants"
                        value={room.nb_enfants}
                        max={maxEnfants}
                        onChange={(val) =>
                            onChange(room.uid, "nb_enfants", val)
                        }
                    />
                    <Stepper
                        label="Bébés"
                        value={room.nb_bebes}
                        max={maxBebes}
                        onChange={(val) => onChange(room.uid, "nb_bebes", val)}
                    />
                </div>

                {hasCapacityWarning && (
                    <div className="mt-4 flex gap-2 items-center bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        Attention, la capacité totale d'accueil pour le nombre de chambres sélectionné a été dépassée !
                    </div>
                )}
            </div>
        </div>
    );
}
