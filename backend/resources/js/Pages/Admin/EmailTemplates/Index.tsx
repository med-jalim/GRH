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

            {/* Grid of Templates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((template) => {
                    // Define colors based on slug keywords
                    let iconBg = "bg-slate-50";
                    let iconColor = "text-slate-400";
                    let btnColor = "bg-[#54b172]";

                    if (template.slug.includes('confirmed') || template.slug.includes('validation')) {
                        iconBg = "bg-emerald-50";
                        iconColor = "text-emerald-500";
                    } else if (template.slug.includes('cancelled')) {
                        iconBg = "bg-rose-50";
                        iconColor = "text-rose-500";
                        btnColor = "bg-rose-500";
                    } else if (template.slug.includes('payment')) {
                        iconBg = "bg-indigo-50";
                        iconColor = "text-indigo-500";
                        btnColor = "bg-indigo-600";
                    }

                    return (
                        <div 
                            key={template.id}
                            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col"
                        >
                            <div className="p-5 flex-grow">
                                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <Mail className={`w-6 h-6 ${iconColor}`} />
                                </div>
                                
                                <h3 className="font-bold text-slate-900 text-base tracking-tight mb-1 line-clamp-1 capitalize">
                                    {template.name}
                                </h3>
                                
                                <div className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase rounded-md tracking-wider mb-3">
                                    {template.slug}
                                </div>

                                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                    <span className="font-semibold text-slate-400 uppercase text-[9px] block mb-1">Sujet par défaut</span>
                                    {template.subject}
                                </p>
                            </div>
                            
                            <div className="p-4 pt-0">
                                <Link
                                    href={`/admin/email-templates/${template.id}/edit`}
                                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 ${btnColor} text-white text-xs font-bold rounded-xl shadow-lg transition-all active:scale-95`}
                                >
                                    Personnaliser <Edit2 size={14} />
                                </Link>
                                <div className="mt-3 flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Clock size={10} className="text-slate-400" />
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        Modifié le {new Date(template.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {templates.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">
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
