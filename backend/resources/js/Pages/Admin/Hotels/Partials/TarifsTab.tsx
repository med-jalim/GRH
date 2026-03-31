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
import { useState } from "react";
import { format } from "date-fns";
import { PricingCalendar } from "@/components/Calendar/PricingCalendar";

function dateForInput(d: string) {
    return new Date(d).toISOString().split("T")[0];
}

export function TarifsTab({ hotel, types }: { hotel: any; types: any[] }) {
    const [showModal, setShowModal] = useState(false);
    const [editingTarif, setEditingTarif] = useState<any>(null);
    const [selectedTypeId, setSelectedTypeId] = useState<string>(
        types.length > 0 ? types[0].id.toString() : "all",
    );

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_type: types.length > 0 ? types[0].id.toString() : "",
        id_hotel: hotel.id.toString(),
        prix: "",
        date_debut: "",
        date_fin: "",
    });

    function openCreate(startDate?: Date, endDate?: Date) {
        setEditingTarif(null);
        setData({
            id_type:
                selectedTypeId === "all" && types.length > 0
                    ? types[0].id.toString()
                    : selectedTypeId,
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

    function handleDelete(id?: number) {
        const targetId = id ?? editingTarif?.id;
        if (!targetId) return;

        if (confirm("Supprimer ce tarif définitivement ?")) {
            router.delete(`/admin/tarifs/${targetId}`, {
                onSuccess: () => setShowModal(false),
            });
        }
    }

    return (
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

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={selectedTypeId}
                            onChange={(e) => setSelectedTypeId(e.target.value)}
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

                    <button
                        onClick={() => openCreate()}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Ajouter Tarif
                    </button>
                </div>
            </div>

            {/* LE CALENDRIER — Composant Indépendant */}
            <PricingCalendar
                tarifs={hotel.tarifs ?? []}
                selectedTypeId={selectedTypeId}
                onTarifClick={openEdit}
                onRangeSelect={(start, end) => openCreate(start, end)}
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
                                        onChange={(e) =>
                                            setData("id_type", e.target.value)
                                        }
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
                                        Prix / Nuit (MAD){" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-slate-400 font-semibold sm:text-sm">
                                                DH
                                            </span>
                                        </div>
                                        <input
                                            type="number"
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
                                        onClick={() => handleDelete()}
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
        </div>
    );
}
