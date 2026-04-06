import { AdminLayout } from "@/Layouts/AdminLayout";
import React, { useEffect, useRef, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Info, ExternalLink } from 'lucide-react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetNewsletter from 'grapesjs-preset-newsletter';
import axios from 'axios';

interface Template {
    id: number;
    slug: string;
    name: string;
    subject: string;
    content_html: string;
    content_json: string | object;
}

interface Props {
    template: Template;
}

export default function Edit({ template }: Props) {
    const editorRef = useRef<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { data, setData } = useForm({
        subject: template.subject,
    });

    useEffect(() => {
        if (!editorRef.current) {
            const editor = grapesjs.init({
                container: '#editor',
                fromElement: true,
                height: '700px',
                width: 'auto',
                storageManager: false,
                plugins: [gjsPresetNewsletter],
                pluginsOpts: {
                    'grapesjs-preset-newsletter': {
                        // Options for the newsletter preset
                    }
                },
                canvas: {
                    styles: [
                        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
                    ]
                }
            });

            // Load existing content
            if (template.content_json) {
                const json = typeof template.content_json === 'string' 
                    ? JSON.parse(template.content_json) 
                    : template.content_json;
                editor.loadProjectData(json);
            } else if (template.content_html) {
                editor.setComponents(template.content_html);
            }

            editorRef.current = editor;
        }

        return () => {
            // cleanup
        };
    }, []);

    const handleSave = async () => {
        if (!editorRef.current) return;
        
        setIsSaving(true);
        const html = editorRef.current.runCommand('gjs-get-inlined-html');
        const json = editorRef.current.getProjectData();

        try {
            await axios.patch(`/admin/email-templates/${template.id}`, {
                subject: data.subject,
                content_html: html,
                content_json: json
            });
            alert('Modèle sauvegardé avec succès !');
        } catch (err) {
            console.error('Save error', err);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AdminLayout>
            <Head title={`Éditeur : ${template.name}`} />

            {/* Header / Toolbar */}
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link 
                        href="/admin/email-templates"
                        className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">{template.name}</h1>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                            Éditeur Visuel <span className="w-1 h-1 bg-slate-300 rounded-full"></span> {template.slug}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            placeholder="Objet de l'email..."
                            className="w-64 lg:w-96 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                        <span className="absolute -top-2 left-3 px-1.5 py-0.5 bg-white text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 rounded">Objet</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`inline-flex items-center gap-2 px-6 py-2.5 bg-[#54b172] text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100`}
                    >
                        <Save size={16} />
                        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            {/* Editor Canvas Container */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] overflow-hidden relative group">
                <div id="editor" className="h-[700px] w-full"></div>
                
                {/* Float Hint */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-xs">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
                        <Info size={12} /> Conseil d'utilisation
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Glissez les blocs (droite) sur la zone de travail. Utilisez les variables <span className="text-indigo-600 font-bold">{"{{...}}"}</span> pour les données dynamiques.
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .gjs-one-bg { background-color: #f8f9fa !important; }
                .gjs-two-bg { background-color: #ffffff !important; }
                .gjs-three-bg { background-color: #f1f5f9 !important; }
                .gjs-four-bg { background-color: #cbd5e1 !important; }
                
                .gjs-block { 
                    border: 1px solid #e2e8f0 !important; 
                    background-color: #ffffff !important;
                    transition: all 0.2s;
                    width: 45% !important;
                    color: #475569 !important;
                    border-radius: 12px !important;
                    margin: 2% !important;
                }
                .gjs-block:hover { 
                    border-color: #6366f1 !important; 
                    color: #6366f1 !important;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
                }
                
                .gjs-pn-panels { background-color: #ffffff !important; border-bottom: 1px solid #f1f5f9; }
                .gjs-pn-views-container { background-color: #ffffff !important; border-left: 1px solid #f1f5f9 !important; }
                .gjs-cv-canvas { background-color: #f8fafc !important; }
                
                .gjs-sm-sector-title { background-color: #f8fafc !important; color: #1e293b !important; font-weight: 700 !important; text-transform: uppercase !important; font-size: 10px !important; letter-spacing: 0.05em !important; }
                .gjs-sm-properties { background-color: #ffffff !important; }
                
                .gjs-field { background-color: #f8fafc !important; color: #1e293b !important; border: 1px solid #e2e8f0 !important; border-radius: 8px !important; }
                
                /* Hide advanced technical tabs if possible via CSS (Quick & Dirty) */
                /* .gjs-pn-views .gjs-pn-btn[title="Settings"] { display: none !important; } */
            `}} />
        </AdminLayout>
    );
}
