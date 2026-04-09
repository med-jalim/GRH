import { useForm, router } from "@inertiajs/react";
import {
    Check,
    Crown,
    Plus,
    Tag,
    Trash2,
    X,
    Calendar as CalendarIcon,
    Filter,
    Percent,
    Info,
    Star,
    TrendingUp,
    Settings2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { PricingCalendar } from "@/components/Calendar/PricingCalendar";

// ── Types ──────────────────────────────────────────────────────────────────

interface TarificationLine {
    id_type: number;
    type_nom: string | null;
    is_essentiel: boolean;
    pourcentage: number;
    cap_adultes: number;
    cap_enfants: number;
    cap_bebes: number;
}

interface TarifsTabProps {
    hotel: any;
    types: any[];
    section: "calendrier";
}

// ── Helpers ────────────────────────────────────────────────────────────────

function dateForInput(d: string) {
    return new Date(d).toISOString().split("T")[0];
}

function formatPrice(n: number) {
    return new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        minimumFractionDigits: 0,
    }).format(n);
}

// ── Section: Calendrier de la Chambre Essentielle ─────────────────────────

function EssentielCalendar({
    hotel,
    types,
}: {
    hotel: any;
    types: any[];
}) {
    const [showModal, setShowModal] = useState(false);
    const [editingTarif, setEditingTarif] = useState<any>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<string>("all");
    const [selectedSubTypeId, setSelectedSubTypeId] = useState<string>("all");

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_type: "",
        id_sub_type: "",
        id_hotel: hotel.id.toString(),
        prix: "",
        date_debut: "",
        date_fin: "",
    });

    function openCreate(startDate?: Date, endDate?: Date) {
        setEditingTarif(null);
        setData({
            id_type: selectedTypeId !== "all" ? selectedTypeId : "",
            id_sub_type: selectedSubTypeId !== "all" ? selectedSubTypeId : "",
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
        setEditingTarif(t);
        setData({
            id_type: t.id_type.toString(),
            id_sub_type: t.id_sub_type?.toString() ?? "",
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
                onSuccess: () => { setShowModal(false); reset(); },
            });
        } else {
            post("/admin/tarifs", {
                onSuccess: () => { setShowModal(false); reset(); },
            });
        }
    }

    function handleDelete() {
        if (!editingTarif) return;
        if (confirm("Supprimer ce tarif définitivement ?")) {
            router.delete(`/admin/tarifs/${editingTarif.id}`, {
                onSuccess: () => setShowModal(false),
            });
        }
    }

    const allTarifs = hotel.tarifs || [];

    const filteredTarifs = allTarifs.filter((t: any) => {
        const typeMatch = selectedTypeId === "all" ? true : t.id_type === Number(selectedTypeId);
        const subTypeMatch = selectedSubTypeId === "all" ? true : t.id_sub_type === Number(selectedSubTypeId);
        return typeMatch && subTypeMatch;
    });

    return (
        <div>
            {/* Sub-header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 bg-amber-50/60 border-b border-amber-100 gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center border border-amber-200">
                        <CalendarIcon className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-900">
                            Calendrier tarifaire —{" "}
                            <span className="text-amber-600">
                                {selectedTypeId === "all" ? "Tous les types" : types.find(t => t.id === Number(selectedTypeId))?.nom}
                                {selectedSubTypeId !== "all" && ` (${types.find(t => t.id === Number(selectedTypeId))?.sub_types?.find((st: any) => st.id === Number(selectedSubTypeId))?.nom})`}
                            </span>
                        </p>
                        <p className="text-xs text-amber-700/70 mt-0.5">
                            Cliquez sur un jour ou une période pour définir le prix par occupation
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={selectedTypeId}
                        onChange={(e) => {
                            setSelectedTypeId(e.target.value);
                            setSelectedSubTypeId("all");
                        }}
                        className="h-10 px-3 py-2 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm"
                    >
                        <option value="all">Type: Tous</option>
                        {types.map((t) => (
                            <option key={t.id} value={t.id}>{t.nom}</option>
                        ))}
                    </select>

                    {selectedTypeId !== "all" && (
                        <select
                            value={selectedSubTypeId}
                            onChange={(e) => setSelectedSubTypeId(e.target.value)}
                            className="h-10 px-3 py-2 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm animate-in fade-in slide-in-from-left-2 transition-all"
                        >
                            <option value="all">Occupation: Toutes</option>
                            {types.find(t => t.id === Number(selectedTypeId))?.sub_types?.map((st: any) => (
                                <option key={st.id} value={st.id}>{st.nom}</option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={() => openCreate()}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 h-10 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-40"
                    >
                        <Plus className="w-4 h-4" /> Ajouter période
                    </button>
                </div>
            </div>

            {/* Calendar */}
            <PricingCalendar
                tarifs={filteredTarifs}
                selectedTypeId={selectedTypeId}
                onTarifClick={openEdit}
                onRangeSelect={(start, end) => openCreate(start, end)}
            />

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10 border border-slate-100">
                        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-amber-50/40">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                                    <Tag className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        {editingTarif ? "Modifier le tarif" : "Nouveau tarif"}
                                    </h2>
                                    {data.date_debut && (
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

                        <form onSubmit={submit} className="p-7 flex flex-col gap-5">
                            {/* Type de chambre */}
                            {/* Type & SubType Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-xs uppercase tracking-wider">
                                        Type de chambre <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.id_type}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setData((prev: any) => ({ ...prev, id_type: val, id_sub_type: "" }));
                                        }}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none font-medium text-slate-700 shadow-sm"
                                    >
                                        <option value="" disabled>-- Type --</option>
                                        {types.map((t) => (
                                            <option key={t.id} value={t.id}>{t.nom}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-xs uppercase tracking-wider">
                                        Occupation <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.id_sub_type}
                                        onChange={(e) => setData("id_sub_type", e.target.value)}
                                        required
                                        disabled={!data.id_type}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-slate-50 outline-none font-medium text-slate-700 shadow-sm disabled:opacity-50"
                                    >
                                        <option value="" disabled>-- Sous-type --</option>
                                        {types.find(t => t.id === Number(data.id_type))?.sub_types?.map((st: any) => (
                                            <option key={st.id} value={st.id}>{st.nom}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Prix */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-xs uppercase tracking-wider">
                                    Prix par Nuit <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 font-semibold text-sm">MAD</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.prix}
                                        onChange={(e) => setData("prix", e.target.value)}
                                        required
                                        placeholder="Ex: 400"
                                        className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white outline-none font-bold text-slate-800 shadow-sm"
                                    />
                                </div>
                                {(errors as any).prix && (
                                    <p className="text-red-500 text-xs mt-1">{(errors as any).prix}</p>
                                )}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Début <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_debut}
                                        onChange={(e) => setData("date_debut", e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white outline-none font-medium text-slate-700 shadow-sm"
                                    />
                                    {errors.date_debut && (
                                        <p className="text-red-500 text-xs mt-1">{errors.date_debut}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                        Fin <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_fin}
                                        onChange={(e) => setData("date_fin", e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white outline-none font-medium text-slate-700 shadow-sm"
                                    />
                                    {errors.date_fin && (
                                        <p className="text-red-500 text-xs mt-1">{errors.date_fin}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                {editingTarif && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm"
                                >
                                    <Check className="w-4 h-4" />
                                    {processing ? "Enregistrement..." : "Confirmer le tarif"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main TarifsTab Component ───────────────────────────────────────────────

export function TarifsTab({ hotel, types }: Omit<TarifsTabProps, "section">) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* ── HEADER ── */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                    <Settings2 className="w-4.5 h-4.5 text-slate-700" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900">
                        Gestion des Tarifs
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Gérez les tarifs pour chaque type de chambre et occupation.
                    </p>
                </div>
            </div>

            <div className="border-b border-slate-100">
                <EssentielCalendar
                    hotel={hotel}
                    types={types}
                />
            </div>
        </div>
    );
}
