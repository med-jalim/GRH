import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

interface Variable {
    key: string;
    label: string;
    example: string;
}

interface GrapesEditorProps {
    initialGjsData?: string | null;
    initialHtml?: string | null;
    variables?: Variable[];
    onDirty?: () => void;
    onReady?: () => void;
}

export interface GrapesEmailEditorRef {
    getData: () => { gjsData: string; html: string };
}

export const GrapesEmailEditor = forwardRef<GrapesEmailEditorRef, GrapesEditorProps>(({
    initialGjsData,
    initialHtml,
    variables = [],
    onDirty,
    onReady,
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef    = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);

    // ── Expose data getter to parent ───────────────────────────
    useImperativeHandle(ref, () => ({
        getData: () => {
            if (!editorRef.current) return { gjsData: "", html: "" };
            try {
                return {
                    gjsData: JSON.stringify(editorRef.current.getProjectData()),
                    html:    editorRef.current.runCommand("gjs-get-inlined-html") as string,
                };
            } catch {
                return { gjsData: "", html: "" };
            }
        }
    }), []);

    useEffect(() => {
        if (!containerRef.current) return;
        let destroyed = false;

        const init = async () => {
            try {
                // Lazy-load JS only (CSS imported statically above)
                const [{ default: grapesjs }, { default: newsletterPlugin }] = await Promise.all([
                    import("grapesjs"),
                    import("grapesjs-preset-newsletter"),
                ]);

                if (destroyed || !containerRef.current) return;

                const editor = grapesjs.init({
                    container: containerRef.current,
                    height: "100%",
                    width: "auto",
                    storageManager: false,
                    undoManager: { trackSelection: false },
                    fromElement: false,

                    // Let newsletter preset handle panel placement
                    plugins: [newsletterPlugin],
                    pluginsOpts: {},

                    // Device buttons in the top toolbar
                    deviceManager: {
                        devices: [
                            { name: "Desktop", width: "" },
                            { name: "Mobile",  width: "375px", widthMedia: "480px" },
                        ],
                    },

                    // Keep style manager default — works with preset
                    styleManager: { sectors: [] },
                });

                editorRef.current = editor;

                // ── Add variable blocks in their own category ──────────────
                const bm = editor.BlockManager;

                variables.forEach((v) => {
                    bm.add("var-" + v.key, {
                        label: `<div style="font-size:11px;font-weight:600;margin-bottom:2px;">${v.label}</div><div style="font-size:9px;font-family:monospace;color:#6366f1;">[[${v.key}]]</div>`,
                        category: "🔵 Variables client",
                        content: `<span style="background:#e0e7ff;color:#4338ca;padding:1px 6px;border-radius:4px;font-family:monospace;font-size:13px;font-weight:600;">[[${v.key}]]</span>`,
                        attributes: { title: v.example },
                    });
                });

                // ── Add Groups Table Block ──────────────────────────────
                bm.add("groups-table", {
                    label: `
                        <div style="font-size:11px;font-weight:600;margin-bottom:2px;">📅 Tableau Groupes</div>
                        <div style="font-size:9px;color:#64748b;">(Auto-répétable)</div>
                    `,
                    category: "📦 Blocs dynamiques",
                    content: `
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:20px 0;border-collapse:collapse;">
                            <thead style="background:#f8fafc">
                                <tr>
                                    <th align="left" style="padding:10px 12px;font-size:11px;color:#94a3b8;text-transform:uppercase;">Période</th>
                                    <th align="right" style="padding:10px 12px;font-size:11px;color:#94a3b8;text-transform:uppercase;">Occupants</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr data-repeat="groups">
                                    <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;">
                                        <div style="font-weight:800;color:#1e293b;margin-bottom:2px;">Période [[group_index]]</div>
                                        <div style="color:#64748b;">Du [[group_arrival]] au [[group_departure]]</div>
                                    </td>
                                    <td align="right" style="padding:12px;border-bottom:1px solid #f1f5f9;vertical-align:middle;">
                                        <span style="background:#f1f5f9;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;color:#475569;">[[group_pax]] Pers.</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    `,
                    attributes: { title: "Tableau récapitulatif des périodes du séjour" },
                });

                // ── Add Dynamic Devis Table Block ──────────────────────────
                bm.add("devis-table", {
                    label: `
                        <div style="font-size:11px;font-weight:600;margin-bottom:2px;">📊 Tableau Devis</div>
                        <div style="font-size:9px;color:#64748b;">(Auto-répétable)</div>
                    `,
                    category: "📦 Blocs dynamiques",
                    content: `
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin:20px 0;border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f8fafc">
                                    <th align="left" style="padding:12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #e2e8f0;">Désignation</th>
                                    <th align="center" style="padding:12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #e2e8f0;">Qté</th>
                                    <th align="left" style="padding:12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #e2e8f0;">P.U</th>
                                    <th align="left" style="padding:12px;font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;border-bottom:1px solid #e2e8f0;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr data-repeat="devis">
                                    <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#0f172a;">
                                        [[item_designation]]
                                        <div style="font-size:10px;color:#94a3b8;">[[item_nights]] nuits</div>
                                    </td>
                                    <td align="center" style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">[[item_qty]]</td>
                                    <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">[[item_pu]]</td>
                                    <td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:600;color:#0f172a;">[[item_total]]</td>
                                </tr>
                            </tbody>
                        </table>
                    `,
                    attributes: { title: "Tableau auto-généré des prestations" },
                });

                // ── Add Line Variables ──────────────────────────────────────
                const lineVars = [
                    { key: 'item_designation', label: 'Désignation (Ligne Devis)' },
                    { key: 'item_nights',      label: 'Nuits (Ligne Devis)' },
                    { key: 'item_qty',         label: 'Qté (Ligne Devis)' },
                    { key: 'item_pu',          label: 'P.U (Ligne Devis)' },
                    { key: 'item_total',       label: 'Total (Ligne Devis)' },
                    { key: 'group_index',      label: 'N° Période (Ligne Groupes)' },
                    { key: 'group_arrival',    label: 'Arrivée (Ligne Groupes)' },
                    { key: 'group_departure',  label: 'Départ (Ligne Groupes)' },
                    { key: 'group_pax',        label: 'Pax (Ligne Groupes)' },
                ];

                lineVars.forEach(v => {
                    bm.add("line-var-" + v.key, {
                        label: `<div style="font-size:10px;font-weight:600;">${v.label}</div>`,
                        category: "📋 Variables de ligne",
                        content: `[[${v.key}]]`,
                    });
                });

                // ── Load initial content ───────────────────────────────────
                if (initialGjsData) {
                    try {
                        editor.loadProjectData(JSON.parse(initialGjsData));
                    } catch {
                        if (initialHtml) editor.setComponents(initialHtml);
                    }
                } else if (initialHtml) {
                    editor.setComponents(initialHtml);
                }

                // ── Emit continuous dirty status (without heavy HTML inline) ──
                let timer: ReturnType<typeof setTimeout>;
                const emitChange = () => {
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                        if (destroyed) return;
                        onDirty?.();
                    }, 400);
                };

                editor.on("update",               emitChange);
                editor.on("change:changesCount",  emitChange);

                setLoading(false);
                onReady?.();

            } catch (e: any) {
                console.error("GrapesJS init error:", e);
                setError(e?.message ?? "Impossible d'initialiser l'éditeur.");
                setLoading(false);
            }
        };

        init();

        return () => {
            destroyed = true;
            try { editorRef.current?.destroy(); } catch {}
            editorRef.current = null;
        };
    }, []); // intentionally no deps — init once

    return (
        <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            {loading && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 20,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    background: "#f8fafc",
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        border: "4px solid #c7d2fe", borderTopColor: "#4f46e5",
                        animation: "spin 0.8s linear infinite", marginBottom: 12,
                    }} />
                    <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                        Chargement de l'éditeur...
                    </p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}
            {error && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#fff1f2",
                }}>
                    <p style={{ color: "#be123c", fontSize: 14 }}>{error}</p>
                </div>
            )}
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
});
