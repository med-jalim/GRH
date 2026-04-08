import { AdminLayout } from "@/Layouts/AdminLayout";
import {
    GrapesEmailEditor,
    GrapesEmailEditorRef,
} from "@/components/GrapesEmailEditor";
import { Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    Save,
    Send,
    Clock,
    Wand2,
    X,
    Mail,
    RotateCcw,
    MonitorSmartphone,
    Smartphone,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import axios from "axios";

/* ──────────────────────────── Types ───────────────────────────────────── */

interface Variable {
    key: string;
    label: string;
    example: string;
}
interface Template {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    published_subject: string;
    draft_subject: string | null;
    published_content: string;
    draft_content: string | null;
    gjs_data: string | null;
    draft_gjs_data: string | null;
    variables: Variable[];
    has_draft: boolean;
}
interface Props {
    template: Template;
}

/* ──────────────────────────── Edit Page ───────────────────────────────── */

export default function EmailTemplateEdit({ template }: Props) {
    const [subject, setSubject] = useState(
        template.draft_subject ?? template.published_subject,
    );
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [showTest, setShowTest] = useState(false);
    const [testEmail, setTestEmail] = useState("");
    const [testStatus, setTestStatus] = useState<null | {
        ok: boolean;
        msg: string;
    }>(null);
    const [testSending, setTestSending] = useState(false);

    const editorRef = useRef<GrapesEmailEditorRef>(null);

    const handleEditorDirty = useCallback(() => {
        setIsDirty(true);
    }, []);

    /* ── Save Draft ──────────────────────────────────────────────────── */
    const handleSave = () => {
        const data = editorRef.current?.getData();
        if (!data) return;

        setSaving(true);
        router.patch(
            `/admin/email-templates/${template.id}/draft`,
            {
                draft_subject: subject,
                draft_content: data.html,
                draft_gjs_data: data.gjsData,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSaving(false);
                    setIsDirty(false);
                },
            },
        );
    };

    /* ── Publish ─────────────────────────────────────────────────────── */
    const handlePublish = () => {
        if (
            !confirm(
                "Publier ce brouillon ? Les prochains e-mails utiliseront immédiatement cette version.",
            )
        )
            return;

        const data = editorRef.current?.getData();
        if (!data) return;

        setPublishing(true);

        // Save then publish
        router.patch(
            `/admin/email-templates/${template.id}/draft`,
            {
                draft_subject: subject,
                draft_content: data.html,
                draft_gjs_data: data.gjsData,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    router.post(
                        `/admin/email-templates/${template.id}/publish`,
                        {},
                        {
                            preserveScroll: true,
                            onFinish: () => {
                                setPublishing(false);
                                setIsDirty(false);
                            },
                        },
                    );
                },
            },
        );
    };

    /* ── Discard Draft ───────────────────────────────────────────────── */
    const handleDiscard = () => {
        if (
            !confirm(
                "Annuler le brouillon ? La version publiée sera restaurée.",
            )
        )
            return;
        router.post(
            `/admin/email-templates/${template.id}/discard`,
            {},
            { preserveScroll: true },
        );
    };

    /* ── Send Test ───────────────────────────────────────────────────── */
    const handleTest = async () => {
        setTestSending(true);
        setTestStatus(null);
        try {
            await axios.post(`/admin/email-templates/${template.id}/test`, {
                email: testEmail,
            });
            setTestStatus({ ok: true, msg: `E-mail envoyé à ${testEmail}` });
        } catch (e: any) {
            setTestStatus({
                ok: false,
                msg: e.response?.data?.error ?? "Erreur inconnue",
            });
        } finally {
            setTestSending(false);
        }
    };

    return (
        <AdminLayout fullScreen>
            {/* ── Top Bar ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-slate-100 shadow-sm z-30 relative flex-shrink-0">
                {/* Back */}
                <Link
                    href="/admin/email-templates"
                    className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium flex-shrink-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </Link>
                <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

                {/* Template name */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-bold text-slate-900 text-sm">
                        {template.name}
                    </span>
                    {template.has_draft && !isDirty && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200">
                            Brouillon
                        </span>
                    )}
                    {isDirty && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-500 border border-blue-100 animate-pulse">
                            Non sauvegardé
                        </span>
                    )}
                </div>

                {/* Subject input — expands to fill space */}
                <div className="flex-1 mx-2">
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 gap-2 h-9 focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-200 transition-all">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex-shrink-0">
                            Objet :
                        </span>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => {
                                setSubject(e.target.value);
                                setIsDirty(true);
                            }}
                            className="flex-1 text-sm bg-transparent focus:outline-none text-slate-800"
                            placeholder="Objet de l'e-mail..."
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {template.has_draft && !isDirty && (
                        <button
                            onClick={handleDiscard}
                            className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all border border-transparent hover:border-red-100"
                            title="Annuler le brouillon"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Annuler
                        </button>
                    )}
                    <button
                        onClick={() => setShowTest(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-xl text-xs font-bold transition-all"
                    >
                        <Send className="w-3.5 h-3.5" /> Test
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                    >
                        <Save className="w-3.5 h-3.5" />{" "}
                        {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
                    >
                        <Wand2 className="w-3.5 h-3.5" />{" "}
                        {publishing ? "Publication..." : "Publier"}
                    </button>
                </div>
            </div>

            {/* ── GrapesJS Canvas ─────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden">
                <GrapesEmailEditor
                    ref={editorRef}
                    initialGjsData={
                        template.draft_gjs_data ?? template.gjs_data
                    }
                    initialHtml={
                        template.draft_content ?? template.published_content
                    }
                    variables={template.variables}
                    onDirty={handleEditorDirty}
                />
            </div>

            {/* ── Draft Banner ─────────────────────────────────────────── */}
            {template.has_draft && !isDirty && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-t border-amber-200 flex-shrink-0 z-20">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <p className="text-xs text-amber-700 flex-1">
                        <strong>Brouillon en cours</strong> — Cliquez sur{" "}
                        <strong>Publier</strong> pour le mettre en ligne.
                    </p>
                </div>
            )}

            {/* ── Test Modal ───────────────────────────────────────────── */}
            {showTest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Envoyer un e-mail de test
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Avec des données d'exemple réalistes
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowTest(false);
                                    setTestStatus(null);
                                }}
                                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) =>
                                        setTestEmail(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleTest()
                                    }
                                    placeholder="votre@email.com"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                                />
                            </div>
                            {testStatus && (
                                <div
                                    className={`p-3 rounded-xl text-xs font-medium ${
                                        testStatus.ok
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                            : "bg-rose-50 text-rose-700 border border-rose-200"
                                    }`}
                                >
                                    {testStatus.msg}
                                </div>
                            )}
                            <button
                                onClick={handleTest}
                                disabled={testSending || !testEmail}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                {testSending
                                    ? "Envoi en cours..."
                                    : "Envoyer le test"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
