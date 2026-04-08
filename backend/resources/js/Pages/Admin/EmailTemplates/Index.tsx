import { AdminLayout } from "@/Layouts/AdminLayout";
import { Link } from "@inertiajs/react";
import {
    Mail,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Edit3,
} from "lucide-react";

interface Template {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    has_draft: boolean;
    updated_at: string;
}

interface Props {
    templates: Template[];
}

const STATUS_SLUGS = [
    // "status_en_attente",
    "status_en_verification",
    // "status_valide",
    "status_en_attente_paiement",
    // "status_paye_partiellement",
    "status_confirme",
    "status_annule",
];

function TemplateCard({ template }: { template: Template }) {
    const hasDraft = template.has_draft;
    const lastUpdate = new Date(template.updated_at).toLocaleDateString(
        "fr-FR",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    );

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group">
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-base">
                                {template.name.split(" ")[0]}
                            </span>
                            <span className="font-bold text-slate-900 text-sm truncate">
                                {template.name.replace(/^[^\s]+\s/, "")}
                            </span>
                        </div>
                        {template.description && (
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                {template.description}
                            </p>
                        )}
                    </div>
                    {hasDraft ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">
                            <Clock className="w-2.5 h-2.5" /> Brouillon
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
                            <CheckCircle className="w-2.5 h-2.5" /> Publié
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] text-slate-400">
                        Modifié le {lastUpdate}
                    </span>
                    <Link
                        href={`/admin/email-templates/${template.id}/edit`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all group-hover:shadow-md group-hover:shadow-indigo-500/20"
                    >
                        <Edit3 className="w-3 h-3" />
                        Modifier
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function EmailTemplatesIndex({ templates }: Props) {
    const statusTemplates = templates.filter((t) =>
        STATUS_SLUGS.includes(t.slug),
    );
    const paymentTemplates = templates.filter((t) =>
        t.slug.startsWith("payment_"),
    );
    const draftCount = templates.filter((t) => t.has_draft).length;

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">
                    Modèles d'e-mails
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Personnalisez visuellement chaque e-mail envoyé
                    automatiquement à vos clients.
                </p>
                {draftCount > 0 && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                            <strong>
                                {draftCount} brouillon
                                {draftCount > 1 ? "s" : ""} non publié
                                {draftCount > 1 ? "s" : ""}
                            </strong>{" "}
                            — Publiez-les pour les mettre en ligne.
                        </p>
                    </div>
                )}
            </div>

            {/* Status Emails Group */}
            <section className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-sm">
                            Mises à jour de réservation
                        </h2>
                        <p className="text-xs text-slate-400">
                            Envoyés automatiquement lors de chaque changement de
                            statut
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {statusTemplates.map((t) => (
                        <TemplateCard key={t.id} template={t} />
                    ))}
                </div>
            </section>

            {/* Payment Emails Group */}
            {paymentTemplates.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <span className="text-base">💳</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 text-sm">
                                Paiements
                            </h2>
                            <p className="text-xs text-slate-400">
                                Envoyés lors de la validation ou du rejet d'un
                                paiement
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paymentTemplates.map((t) => (
                            <TemplateCard key={t.id} template={t} />
                        ))}
                    </div>
                </section>
            )}
        </AdminLayout>
    );
}
