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
}

interface TarifsTabProps {
    hotel: any;
    types: any[];
    tarification: TarificationLine[];
    section: "calendrier" | "multiplicateurs";
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
    essentielTypeId,
    types,
}: {
    hotel: any;
    essentielTypeId: number | null;
    types: any[];
}) {
    const [showModal, setShowModal] = useState(false);
    const [editingTarif, setEditingTarif] = useState<any>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<string>(
        essentielTypeId ? String(essentielTypeId) : "all"
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_type: essentielTypeId ? String(essentielTypeId) : "",
        id_hotel: hotel.id.toString(),
        prix: "",
        date_debut: "",
        date_fin: "",
    });

    function openCreate(startDate?: Date, endDate?: Date) {
        setEditingTarif(null);
        setData({
            id_type: selectedTypeId !== "all" ? selectedTypeId : (essentielTypeId ? String(essentielTypeId) : ""),
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
        if (t.is_virtual) {
            setEditingTarif(null);
            setData({
                id_type: t.id_type.toString(),
                id_hotel: hotel.id.toString(),
                prix: t.prix.toString(),
                date_debut: dateForInput(t.date_debut),
                date_fin: dateForInput(t.date_fin),
            });
            setShowModal(true);
            return;
        }

        setEditingTarif(t);
        setData({
            id_type: t.id_type.toString(),
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

    const essentielTarifs = hotel.tarifs?.filter((t: any) => t.id_type === essentielTypeId) ?? [];
    
    // Generate virtual tarifs based on percentages
    const virtualTarifs: any[] = [];
    if (essentielTypeId) {
        essentielTarifs.forEach((et: any) => {
            types.forEach(type => {
                if (type.id === essentielTypeId) return;
                
                // Find percentage
                const typeTarifications = hotel?.type_tarifications || hotel?.typeTarifications || [];
                const config = typeTarifications.find((config: any) => config.id_type === type.id);
                const perc = config ? Number(config.pourcentage) : 100;
                
                // Exclude if there's an exact explicit tarif for this type (simplified override prevention)
                const hasExplicit = hotel.tarifs?.some((t: any) => 
                    t.id_type === type.id && 
                    t.date_debut === et.date_debut && 
                    t.date_fin === et.date_fin
                );
                
                if (!hasExplicit) {
                    virtualTarifs.push({
                        id: `v_${type.id}_${et.id}`,
                        id_type: type.id,
                        prix: Math.round(Number(et.prix) * (perc / 100)),
                        date_debut: et.date_debut,
                        date_fin: et.date_fin,
                        type: type,
                        is_virtual: true
                    });
                }
            });
        });
    }

    const allTarifs = [...(hotel.tarifs || []), ...virtualTarifs];

    const filteredTarifs = allTarifs.filter((t: any) => 
        selectedTypeId === "all" ? true : t.id_type === Number(selectedTypeId)
    );

    const essentielType = types.find((t: any) => t.id === essentielTypeId);

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
                            </span>
                        </p>
                        <p className="text-xs text-amber-700/70 mt-0.5">
                            Cliquez sur un jour ou une période pour définir le prix de référence
                        </p>
                    </div>
                </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedTypeId}
                            onChange={(e) => setSelectedTypeId(e.target.value)}
                            className="h-10 px-3 py-2 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white shadow-sm"
                        >
                            <option value="all">Tous les types</option>
                            {types.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nom} {t.id === essentielTypeId && "(Essentiel)"}
                                </option>
                            ))}
                        </select>
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
                                    <Crown className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        {editingTarif ? "Modifier le tarif" : "Nouveau tarif"} — Chambre Essentielle
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
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Type de chambre <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.id_type}
                                    onChange={(e) => setData("id_type", e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 bg-white outline-none font-medium text-slate-700 shadow-sm"
                                >
                                    <option value="" disabled>-- Sélectionner --</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>{t.nom}</option>
                                    ))}
                                </select>
                                {errors.id_type && (
                                    <p className="text-red-500 text-xs mt-1">{errors.id_type}</p>
                                )}
                            </div>

                            {/* Prix */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                    Prix par Nuit{" "}
                                    <span className="text-red-500">*</span>
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
                                {errors.prix && (
                                    <p className="text-red-500 text-xs mt-1">{errors.prix}</p>
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

// ── Section: Configuration des Pourcentages ───────────────────────────────

function PourcentagesConfig({
    hotel,
    types,
    tarification,
}: {
    hotel: any;
    types: any[];
    tarification: TarificationLine[];
}) {
    // Build initial state from existing tarification
    const essentielLine = tarification.find((t) => t.is_essentiel);
    const [essentielTypeId, setEssentielTypeId] = useState<number | null>(
        essentielLine?.id_type ?? null
    );

    // Track percentages per type
    const [percentages, setPercentages] = useState<Record<number, number>>(() => {
        const init: Record<number, number> = {};
        tarification.forEach((t) => {
            init[t.id_type] = t.pourcentage;
        });
        // Init missing types to 100%
        types.forEach((t) => {
            if (!(t.id in init)) init[t.id] = 100;
        });
        return init;
    });

    const [saving, setSaving] = useState(false);

    // Preview prices from latest essentiel tarif (today or latest)
    const essentielTarifs = hotel.tarifs?.filter(
        (t: any) => t.id_type === essentielTypeId
    ) ?? [];
    const today = new Date().toISOString().split("T")[0];
    const activeTarif =
        essentielTarifs.find(
            (t: any) => t.date_debut <= today && t.date_fin >= today
        ) ?? essentielTarifs[essentielTarifs.length - 1];
    const essentielPrice: number | null = activeTarif ? activeTarif.prix : null;

    function calcPrice(typeId: number): number | null {
        if (essentielPrice === null) return null;
        const pct = percentages[typeId] ?? 100;
        return Math.round(essentielPrice * (pct / 100));
    }

    function handleSave() {
        if (!essentielTypeId) {
            alert("Veuillez sélectionner le type de chambre essentiel.");
            return;
        }
        setSaving(true);
        const payload = {
            id_hotel: hotel.id,
            essentiel_type_id: essentielTypeId,
            types: types.map((t) => ({
                id_type: t.id,
                pourcentage: t.id === essentielTypeId ? 100 : (percentages[t.id] ?? 100),
            })),
        };

        router.post(`/admin/hotels/${hotel.id}/tarification`, payload, {
            onFinish: () => setSaving(false),
        });
    }

    return (
        <div className="p-6 flex flex-col gap-6">
            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                    Définissez le <strong>type essentiel</strong> (chambre de référence) et son prix via le calendrier ci-dessus.{" "}
                    Ensuite, assignez un <strong>pourcentage</strong> à chaque autre type.
                    Le prix se calcule automatiquement : <em>prix essentiel × pourcentage / 100</em>.
                </p>
            </div>

            {/* Type Essentiel selector */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                        Chambre Essentielle (Référence)
                    </h3>
                </div>
                <p className="text-xs text-amber-700/80 mb-3">
                    Ce type définit le prix de base. Tous les autres types sont calculés en % de ce prix.
                </p>
                <select
                    value={essentielTypeId ?? ""}
                    onChange={(e) => {
                        const id = Number(e.target.value);
                        setEssentielTypeId(id || null);
                        if (id) setPercentages((prev) => ({ ...prev, [id]: 100 }));
                    }}
                    className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400/40 shadow-sm appearance-none"
                >
                    <option value="">-- Sélectionner le type essentiel --</option>
                    {types.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.nom}
                        </option>
                    ))}
                </select>

                {essentielPrice !== null && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-bold text-amber-800">
                            Prix actuel : {formatPrice(essentielPrice)} / nuit
                        </span>
                    </div>
                )}
                {essentielTypeId && essentielPrice === null && (
                    <p className="mt-2 text-xs text-amber-600 italic">
                        Aucun tarif actif pour cette chambre. Ajoutez une période dans le calendrier.
                    </p>
                )}
            </div>

            {/* Percentages Table */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                        Multiplicateurs des autres types
                    </h3>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="text-left px-5 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                                    Type de chambre
                                </th>
                                <th className="text-center px-5 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                                    Rôle
                                </th>
                                <th className="text-center px-5 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                                    Pourcentage
                                </th>
                                <th className="text-right px-5 py-3 text-xs text-slate-400 font-semibold uppercase tracking-wide">
                                    Prix calculé / nuit
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {types.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400 text-sm">
                                        Aucun type de chambre. Créez-en un dans l'onglet "Types".
                                    </td>
                                </tr>
                            ) : (
                                types.map((t) => {
                                    const isEssentiel = t.id === essentielTypeId;
                                    const price = calcPrice(t.id);

                                    return (
                                        <tr
                                            key={t.id}
                                            className={`transition-colors ${isEssentiel ? "bg-amber-50/40" : "hover:bg-slate-50/60"}`}
                                        >
                                            {/* Nom du type */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: t.color ?? "#94a3b8" }}
                                                    />
                                                    <span className="font-semibold text-slate-800">{t.nom}</span>
                                                </div>
                                            </td>

                                            {/* Badge rôle */}
                                            <td className="px-5 py-3.5 text-center">
                                                {isEssentiel ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                                                        <Crown className="w-3 h-3" />
                                                        Essentielle
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full border border-slate-200">
                                                        <Percent className="w-3 h-3" />
                                                        Relative
                                                    </span>
                                                )}
                                            </td>

                                            {/* Pourcentage input */}
                                            <td className="px-5 py-3.5 text-center">
                                                {isEssentiel ? (
                                                    <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                                                        100%
                                                    </span>
                                                ) : (
                                                    <div className="relative inline-flex items-center">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="10000"
                                                            step="1"
                                                            value={percentages[t.id] ?? 100}
                                                            onChange={(e) =>
                                                                setPercentages((prev) => ({
                                                                    ...prev,
                                                                    [t.id]: Number(e.target.value),
                                                                }))
                                                            }
                                                            className="w-24 text-center pr-7 pl-3 py-1.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white shadow-sm"
                                                        />
                                                        <span className="absolute right-2.5 text-slate-400 font-bold text-xs">%</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Prix calculé */}
                                            <td className="px-5 py-3.5 text-right">
                                                {price !== null ? (
                                                    <span className={`font-bold text-sm ${isEssentiel ? "text-amber-700" : "text-emerald-700"}`}>
                                                        {formatPrice(price)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 text-xs italic">
                                                        {essentielTypeId ? "— pas de tarif actif" : "—"}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving || !essentielTypeId || types.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-40"
                >
                    <Check className="w-4 h-4" />
                    {saving ? "Enregistrement..." : "Sauvegarder la configuration"}
                </button>
            </div>
        </div>
    );
}

// ── Main TarifsTab Component ───────────────────────────────────────────────

export function TarifsTab({ hotel, types, tarification, section }: TarifsTabProps) {
    const essentielLine = tarification.find((t) => t.is_essentiel);
    const essentielTypeId = essentielLine?.id_type ?? null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* ── HEADER ── */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                    <Settings2 className="w-4.5 h-4.5 text-slate-700" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900">
                        {section === "calendrier" ? "Tarif Essentiel" : "Multiplicateurs des Prix"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {section === "calendrier" ? "Gérez le prix de votre chambre essentielle dans le calendrier." : "Définissez le type essentiel et les pourcentages des autres types de chambres."}
                    </p>
                </div>
            </div>

            {section === "calendrier" && (
                <div className="border-b border-slate-100">
                    <EssentielCalendar
                        hotel={hotel}
                        essentielTypeId={essentielTypeId}
                        types={types}
                    />
                </div>
            )}

            {section === "multiplicateurs" && (
                <PourcentagesConfig
                    hotel={hotel}
                    types={types}
                    tarification={tarification}
                />
            )}
        </div>
    );
}
