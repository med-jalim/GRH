import { useForm, router } from "@inertiajs/react";
import {
    Check,
    Plus,
    Tag,
    Trash2,
    X,
    Calendar as CalendarIcon,
    Filter,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { format } from "date-fns";
import { PricingCalendar } from "@/components/Calendar/PricingCalendar";
import { useToast } from "@/components/ui/Toast";
import { Select } from "@base-ui/react/select";
import { ChevronDown, Banknote, Briefcase, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function dateForInput(d: string) {
    return new Date(d).toISOString().split("T")[0];
}

export function TarifsTab({ hotel, types }: { hotel: any; types: any[] }) {
    const { error } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [editingTarif, setEditingTarif] = useState<any>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<string>(
        types.length > 0 ? types[0].id.toString() : "all",
    );
    const [selectedCapacityId, setSelectedCapacityId] = useState<string>("all");
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [viewMode, setViewMode] = useState<"base" | "agence" | "groupe">("base");

    const displayTarifs = useMemo(() => {
        if (!hotel.tarifs) return [];
        
        let multiplier = 1;
        if (viewMode === "agence") {
            multiplier = (hotel.agency_price_percentage ?? 100) / 100;
        } else if (viewMode === "groupe") {
            multiplier = (hotel.group_price_percentage ?? 120) / 100;
        }

        if (multiplier === 1) return hotel.tarifs;

        return hotel.tarifs.map((t: any) => ({
            ...t,
            prix: Number((t.prix * multiplier).toFixed(2))
        }));
    }, [hotel.tarifs, viewMode, hotel.agency_price_percentage, hotel.group_price_percentage]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_type: types.length > 0 ? types[0].id.toString() : "",
        id_capacity: "",
        id_hotel: hotel.id.toString(),
        prix: "",
        date_debut: "",
        date_fin: "",
    });

    function openCreate(startDate?: Date, endDate?: Date) {
        if (selectedTypeId === "all") {
            error("Veuillez sélectionner un type de chambre");
            return;
        }
        setEditingTarif(null);
        setData({
            id_type: selectedTypeId,
            id_capacity: selectedCapacityId === "all" ? "" : selectedCapacityId,
            id_hotel: hotel.id.toString(),
            prix: "",
            date_debut: startDate ? format(startDate, "yyyy-MM-dd") : "",
            date_fin: endDate
                ? format(endDate, "yyyy-MM-dd")
                : startDate
                  ? format(startDate, "yyyy-MM-dd")
                  : "",
        });
        setShowModal(true);
    }

    function openEdit(t: any) {
        if (selectedTypeId === "all") {
            error("Veuillez sélectionner un type de chambre");
            return;
        }
        setEditingTarif(t);
        setData({
            id_type: t.id_type.toString(),
            id_capacity: (t.id_capacity || "").toString(),
            id_hotel: hotel.id.toString(),
            prix: t.prix.toString(),
            date_debut: dateForInput(t.date_debut),
            date_fin: dateForInput(t.date_fin),
        });
        setShowModal(true);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (editingTarif) {
            put(`/admin/tarifs/${editingTarif.id}`, {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post("/admin/tarifs", {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    }

    function handleConfirmDelete() {
        if (!confirmDelete) return;
        setDeleting(true);
        router.delete(`/admin/tarifs/${confirmDelete}`, {
            onSuccess: () => {
                setConfirmDelete(null);
                setShowModal(false);
                setDeleting(false);
            },
            onFinish: () => setDeleting(false),
        });
    }


    // View Modes configs
    const VIEW_MODES = [
        { value: "base", label: "Prix de Base (Edition)", Icon: Banknote, color: "text-slate-700 bg-slate-50 border-slate-200" },
        { value: "agence", label: `Agences (${hotel.agency_price_percentage ?? 100}%)`, Icon: Briefcase, color: "text-blue-700 bg-blue-50 border-blue-200" },
        { value: "groupe", label: `Groupes (${hotel.group_price_percentage ?? 120}%)`, Icon: Users, color: "text-amber-700 bg-amber-50 border-amber-200" }
    ] as const;

    const currentMode = VIEW_MODES.find(m => m.value === viewMode) || VIEW_MODES[0];
    const ModeIcon = currentMode.Icon;

    return (
        <div className="space-y-4">
            {/* Mode Select Dropdown - Above the main part */}
            <div className="flex justify-end">
                 <Select.Root 
                    value={viewMode} 
                    onValueChange={(val) => val && setViewMode(val as any)} 
                >
                    <Select.Trigger
                        className={cn(
                            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-150 shadow-sm",
                            "cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-slate-900/10",
                            currentMode.color,
                        )}
                    >
                        <ModeIcon className="w-4 h-4" />
                        {currentMode.label}
                        <ChevronDown className="w-4 h-4 opacity-50 ml-1 transition-transform group-data-[open]:rotate-180" />
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Positioner className="z-[100] pt-1">
                            <Select.Popup className="bg-white rounded-xl border border-slate-100 shadow-xl p-1.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-100">
                                {VIEW_MODES.map((opt) => (
                                    <Select.Item
                                        key={opt.value}
                                        value={opt.value}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer outline-none transition-colors",
                                            "hover:bg-slate-50 focus:bg-slate-50 text-slate-700 data-[selected]:bg-slate-50 data-[selected]:text-slate-900",
                                        )}
                                    >
                                        <opt.Icon className="w-4 h-4 opacity-70" />
                                        <Select.ItemText>{opt.label}</Select.ItemText>
                                        <Check className="w-4 h-4 ml-auto opacity-0 data-[selected]:opacity-100 text-slate-900" />
                                    </Select.Item>
                                ))}
                            </Select.Popup>
                        </Select.Positioner>
                    </Select.Portal>
                </Select.Root>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* EN-TÊTE TARIFS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-slate-200 bg-white gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shadow-sm">
                            <CalendarIcon className="w-4 h-4 text-slate-700" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 tracking-tight">
                                Calendrier des Prix
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Cliquez sur un jour ou sélectionnez une période pour
                                ajouter un tarif.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">

                    <div className="flex-1 relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={selectedTypeId}
                            onChange={(e) => {
                              setSelectedTypeId(e.target.value);
                              setSelectedCapacityId("all");
                            }}
                            className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-semibold bg-white text-slate-700 shadow-sm appearance-none"
                        >
                            <option value="all">
                                Tous les types de chambre
                            </option>
                            {types.map((t) => (
                                <option key={t.id} value={t.id.toString()}>
                                    {t.nom}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedTypeId !== "all" && (
                      <div className="flex-1 relative animate-in fade-in slide-in-from-left-2">
                          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <select
                              value={selectedCapacityId}
                              onChange={(e) => setSelectedCapacityId(e.target.value)}
                              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 font-semibold bg-white text-slate-700 shadow-sm appearance-none"
                          >
                              <option value="all">
                                  Toutes les configurations
                              </option>
                              {hotel.type_capacities
                                ?.filter((tc: any) => tc.id_type.toString() === selectedTypeId)
                                ?.map((tc: any) => (
                                  <option key={tc.id} value={tc.id.toString()}>
                                      {tc.label || `${tc.capacite_adultes} Ad. + ${tc.capacite_enfants} Enf.`}
                                  </option>
                                ))}
                          </select>
                      </div>
                    )}

                    {viewMode === "base" && (
                        <button
                            onClick={() => openCreate()}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Ajouter Tarif
                        </button>
                    )}
                </div>
            </div>

            {/* LE CALENDRIER — Composant Indépendant */}
            <PricingCalendar
                tarifs={displayTarifs}
                selectedTypeId={selectedTypeId}
                selectedCapacityId={selectedCapacityId}
                onTarifClick={(t) => { if (viewMode === "base") openEdit(t); }}
                onRangeSelect={(start, end) => { if (viewMode === "base") openCreate(start, end); }}
            />

            {/* MODALE D'ÉDITION/CRÉATION */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10 border border-slate-100">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                                    <Tag className="w-4 h-4 text-slate-700" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                                        {editingTarif
                                            ? "Modifier le tarif"
                                            : "Nouveau Tarif"}
                                    </h2>
                                    {data.date_debut && data.date_fin && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {data.date_debut === data.date_fin
                                                ? data.date_debut
                                                : `${data.date_debut} → ${data.date_fin}`}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submit}
                            className="p-7 flex flex-col gap-5"
                        >
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Type de chambre{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.id_type}
                                        onChange={(e) => {
                                            setData((prev: any) => ({
                                                ...prev,
                                                id_type: e.target.value,
                                                id_capacity: "",
                                            }));
                                        }}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white font-medium text-slate-800 outline-none shadow-sm appearance-none"
                                    >
                                        {types.length === 0 && (
                                            <option value="" disabled>
                                                Créer un type d'abord.
                                            </option>
                                        )}
                                        {types.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                {t.nom}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_type && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.id_type}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Configuration (Label)
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.id_capacity}
                                        onChange={(e) =>
                                            setData("id_capacity", e.target.value)
                                        }
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white font-medium text-slate-800 outline-none shadow-sm appearance-none"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {hotel.type_capacities
                                            ?.filter((c: any) => c.id_type.toString() === data.id_type.toString())
                                            .map((c: any) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.label || `${c.capacite_adultes} Ad. + ${c.capacite_enfants} Enf.`}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.id_capacity && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.id_capacity}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Prix / Nuit (MAD){" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-400 font-semibold sm:text-sm">
                                                MAD
                                            </span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.prix}
                                            onChange={(e) =>
                                                setData("prix", e.target.value)
                                            }
                                            required
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white outline-none font-bold text-slate-800 shadow-sm"
                                        />
                                    </div>
                                    {errors.prix && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.prix}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Début Période{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_debut}
                                        onChange={(e) =>
                                            setData(
                                                "date_debut",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white outline-none font-medium text-slate-700 shadow-sm"
                                    />
                                    {errors.date_debut && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.date_debut}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Fin Période{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_fin}
                                        onChange={(e) =>
                                            setData("date_fin", e.target.value)
                                        }
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white outline-none font-medium text-slate-700 shadow-sm"
                                    />
                                    {errors.date_fin && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.date_fin}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-2">
                                {editingTarif && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setConfirmDelete(editingTarif.id)
                                        }
                                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors shadow-sm"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing || types.length === 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm shadow-slate-300"
                                >
                                    <Check className="w-4 h-4" />{" "}
                                    {processing
                                        ? "Enregistrement..."
                                        : "Confirmer Tarif"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleConfirmDelete}
                isLoading={deleting}
                title="Supprimer le tarif"
                description="Êtes-vous sûr de vouloir supprimer définitivement ce tarif ? Cette action est irréversible."
                confirmLabel="Supprimer définitivement"
                variant="danger"
            />
        </div>
        </div>
    );
}
