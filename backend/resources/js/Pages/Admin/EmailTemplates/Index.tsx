import { AdminLayout } from "@/Layouts/AdminLayout";
import { Head, Link } from '@inertiajs/react';
import { Mail, Edit2, ChevronRight, Info, Clock, CheckCircle } from 'lucide-react';

interface Template {
    id: number;
    slug: string;
    name: string;
    subject: string;
    updated_at: string;
}

interface Props {
    templates: Template[];
}

export default function Index({ templates }: Props) {
    return (
        <AdminLayout>
            <Head title="Modèles d'Emails" />
            
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Modèles d'Emails
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        {templates.length} modèle{templates.length !== 1 ? "s" : ""} disponible{templates.length !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {/* Help / Info Bar */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-8 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm text-indigo-500">
                    <Info size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-indigo-900 tracking-tight uppercase">Variables Dynamiques</h4>
                    <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">
                        Utilisez des balises comme <code className="bg-white/50 px-1 rounded font-bold text-indigo-800">{"{{NOM_CLIENT}}"}</code> ou <code className="bg-white/50 px-1 rounded font-bold text-indigo-800">{"{{TABLEAU_DEVIS}}"}</code> dans l'éditeur pour personnaliser vos envois.
                    </p>
                </div>
            </div>

            {/* Grid of Templates */}
            <div className="grid gap-6">
                {templates.map((template) => (
                    <div 
                        key={template.id}
                        className="group bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-lg hover:border-indigo-200 transition-all duration-300 overflow-hidden"
                    >
                        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors duration-300">
                                    <Mail className="w-7 h-7 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-900 text-lg tracking-tight capitalize">
                                            {template.name}
                                        </h3>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md tracking-wider">
                                            {template.slug}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm flex items-center gap-1.5">
                                        <span className="font-medium">Sujet:</span> {template.subject}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Dernière modification</p>
                                    <p className="text-sm text-slate-600 font-medium">{new Date(template.updated_at).toLocaleDateString()}</p>
                                </div>
                                <Link
                                    href={`/admin/email-templates/${template.id}/edit`}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#54b172] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all"
                                >
                                    Personnaliser <Edit2 size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">
                            Aucun modèle trouvé
                        </h3>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
