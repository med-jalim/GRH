import { AdminLayout } from "@/Layouts/AdminLayout";
import React, { useEffect, useRef, useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Info, Braces, Copy, Check, X } from 'lucide-react';
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

    const AVAILABLE_VARIABLES: Record<string, { var: string, desc: string }[]> = {
        common: [
            // Hôtel
            { var: '{{HOTEL_NOM}}', desc: 'Nom de l\'établissement' },
            { var: '{{HOTEL_EMAIL}}', desc: 'Email de l\'hôtel' },
            { var: '{{HOTEL_TELEPHONE}}', desc: 'Téléphone de l\'hôtel' },
            { var: '{{HOTEL_ADRESSE}}', desc: 'Adresse de l\'hôtel' },
            { var: '{{HOTEL_VILLE}}', desc: 'Ville de l\'hôtel' },
            { var: '{{HOTEL_DESCRIPTION}}', desc: 'Description de l\'hôtel' },
            
            // Client
            { var: '{{NOM_CLIENT}}', desc: 'Nom complet du client' },
            { var: '{{EMAIL_CLIENT}}', desc: 'Email du client' },
            { var: '{{TELEPHONE_CLIENT}}', desc: 'Téléphone du client' },

            // Réservation
            { var: '{{CODE_REF}}', desc: 'Code de référence (ex: RES-XXXX)' },
            { var: '{{DATE_RESERVATION}}', desc: 'Date de création de la réservation' },
            { var: '{{DATE_ARRIVEE}}', desc: 'Date d\'arrivée' },
            { var: '{{DATE_DEPART}}', desc: 'Date de départ' },
            { var: '{{DATES_SEJOUR}}', desc: 'Période (ex: 01/01/2026 au 05/01/2026)' },
            { var: '{{NB_PERSONNES}}', desc: 'Nombre total de personnes' },
            { var: '{{PRIX_TOTAL}}', desc: 'Montant total du séjour' },
            { var: '{{STATUT_RESERVATION}}', desc: 'Statut de la réservation' },
            { var: '{{REMARQUES_SPECIALES}}', desc: 'Remarques du client' },

            // Liens & Tableaux
            { var: '{{PORTAL_URL}}', desc: 'Lien vers le portail client' },
            { var: '{{PAYMENT_LINK}}', desc: 'Lien de paiement sécurisé' },
            { var: '{{TABLEAU_DEVIS}}', desc: 'Tableau détaillé : Récapitulatif avec dates et prix' },
            { var: '{{TABLEAU_DEVIS_SIMPLIFIE}}', desc: 'Tableau simplifié : Total global uniquement' },
        ],
        payment_received: [
            { var: '{{MONTANT_PAYE}}', desc: 'Montant du paiement actuel' },
            { var: '{{TOTAL_PAYE}}', desc: 'Montant total déjà réglé' },
            { var: '{{SOLDE_RESTANT}}', desc: 'Reste à payer' },
        ],
        payment_rejected: [
            { var: '{{MONTANT}}', desc: 'Montant du transfert/paiement refusé' },
            { var: '{{RAISON}}', desc: 'Raison du refus du paiement' },
        ],
        reservation_cancelled: [
            { var: '{{RAISON_ANNULATION}}', desc: 'Raison de l\'annulation' },
        ],
        reservation_status_updated: [
            { var: '{{STATUT_LABEL}}', desc: 'Libellé humain du nouveau statut (ex: Confirmée)' },
        ],
    };

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
                styleManager: {
                    sectors: [
                        {
                            name: 'Général',
                            open: false,
                            buildProps: ['display', 'float', 'position', 'top', 'right', 'bottom', 'left']
                        },
                        {
                            name: 'Dimensions & Marges',
                            open: true,
                            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding']
                        },
                        {
                            name: 'Typographie',
                            open: false,
                            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow']
                        },
                        {
                            name: 'Décorations (Fond, Bordures)',
                            open: false,
                            buildProps: ['background-color', 'background', 'border', 'border-radius', 'box-shadow', 'opacity']
                        },
                        {
                            name: 'Extra',
                            open: false,
                            buildProps: ['transition', 'transform', 'cursor']
                        }
                    ]
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

            // Register dynamic variable blocks
            const bm = editor.BlockManager;

            AVAILABLE_VARIABLES.common.forEach((v, index) => {
                bm.add(`var-common-${index}`, {
                    label: `<div class="gjs-block-label" style="font-size: 11px; margin-bottom: 5px; font-weight: bold; color: #4f46e5;">${v.var}</div><div style="font-size: 9px; color: #64748b; font-weight: normal; text-transform: none; line-height: 1.2;">${v.desc}</div>`,
                    content: {
                        type: 'text',
                        content: v.var,
                    },
                    category: 'Variables Communes',
                });
            });

            const currentVars = AVAILABLE_VARIABLES[template.slug] || [];
            currentVars.forEach((v, index) => {
                bm.add(`var-spec-${index}`, {
                    label: `<div class="gjs-block-label" style="font-size: 11px; margin-bottom: 5px; font-weight: bold; color: #4f46e5;">${v.var}</div><div style="font-size: 9px; color: #64748b; font-weight: normal; text-transform: none; line-height: 1.2;">${v.desc}</div>`,
                    content: {
                        type: 'text',
                        content: v.var,
                    },
                    category: 'Variables Spécifiques',
                });
            });

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
                        className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl text-slate-700 font-bold  tracking-tight leading-tight">{template.name}</h1>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                            Éditeur Visuel <span className="w-1 h-1 bg-slate-600 rounded-full"></span> {template.slug}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-800 p-2 rounded-2xl border border-slate-700 shadow-sm">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            placeholder="Objet de l'email..."
                            className="w-64 lg:w-96 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                        />
                        <span className="absolute -top-2 left-3 px-1.5 py-0.5 bg-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-700 rounded">Objet</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                        {/* <button
                            onClick={() => setShowVariables(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-slate-200 text-sm font-bold rounded-xl hover:bg-slate-600 transition-all"
                        >
                            <Braces size={16} />
                            <span className="hidden sm:inline">Variables</span>
                        </button> */}
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
            </div>

            {/* Editor Canvas Container */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                <div id="editor" className="h-[700px] w-full"></div>
                
                {/* Float Hint */}
                <div className="absolute bottom-6 left-6 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 shadow-xl z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-w-xs">
                    <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                        <Info size={12} /> Conseil d'utilisation
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        Glissez les blocs (droite) sur la zone de travail. Utilisez le bouton <span className="text-white font-bold">Variables</span> pour voir les données dynamiques disponibles.
                    </p>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .gjs-one-bg { background-color: #1e1e24 !important; }
                .gjs-two-bg { background-color: #2d2d35 !important; }
                .gjs-three-bg { background-color: #353540 !important; }
                .gjs-four-bg { background-color: #444450 !important; }
                
                /* Text colors */
                .gjs-one-color { color: #f1f5f9 !important; }
                .gjs-two-color { color: #cbd5e1 !important; }
                .gjs-three-color { color: #94a3b8 !important; }
                .gjs-four-color { color: #64748b !important; }
                
                .gjs-block { 
                    border: 1px solid #353540 !important; 
                    background-color: #2d2d35 !important;
                    transition: all 0.2s;
                    width: 45% !important;
                    color: #cbd5e1 !important;
                    border-radius: 12px !important;
                    margin: 2% !important;
                }
                .gjs-block:hover { 
                    border-color: #6366f1 !important; 
                    color: #ffffff !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
                }
                
                .gjs-pn-panels { background-color: #1e1e24 !important; border-bottom: 1px solid #353540; }
                .gjs-pn-views-container { background-color: #1e1e24 !important; border-left: 1px solid #353540 !important; }
                .gjs-cv-canvas { background-color: #0f172a !important; }
                
                .gjs-sm-sector-title { background-color: #2d2d35 !important; color: #f1f5f9 !important; font-weight: 700 !important; text-transform: uppercase !important; font-size: 10px !important; letter-spacing: 0.05em !important; }
                .gjs-sm-properties { background-color: #1e1e24 !important; }
                
                .gjs-field { background-color: #2d2d35 !important; color: #f1f5f9 !important; border: 1px solid #444450 !important; border-radius: 8px !important; }
                .gjs-field input, .gjs-field select { color: #f1f5f9 !important; }
                
                /* Icon colors */
                .gjs-pn-btn { color: #94a3b8 !important; }
                .gjs-pn-btn.gjs-pn-active { color: #6366f1 !important; background-color: rgba(99, 102, 241, 0.1) !important; }
                
                .gjs-sm-label { color: #cbd5e1 !important; }
                .gjs-clm-label { color: #cbd5e1 !important; }
            `}} />
        </AdminLayout>
    );
}
