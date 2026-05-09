import { useState } from "react";
import axios from "axios";
import { Link, Copy, Check, ShieldCheck, Sparkles, Send } from "lucide-react";

export function BookingLinkGenerator() {
    const [clientName, setClientName] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateLink = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/admin/generate-booking-link", {
                client_name: clientName
            });
            setGeneratedLink(response.data.link);
            setCopied(false);
        } catch (error) {
            console.error("Erreur lors de la génération du lien", error);
            alert("Erreur lors de la génération du lien");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
            {/* Background pattern */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60 group-hover:bg-indigo-100 transition-colors duration-500" />
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">Accès Sécurisé</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Générateur de liens privés</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Nom du client (Optionnel)</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Ex: Jean Dupont"
                                className="w-full h-12 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                            />
                            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300" />
                        </div>
                    </div>

                    {!generatedLink ? (
                        <button
                            onClick={generateLink}
                            disabled={loading}
                            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Link className="w-4 h-4" />
                                    Générer le lien d'accès
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="relative">
                                <input
                                    readOnly
                                    value={generatedLink}
                                    className="w-full h-12 bg-emerald-50 border border-emerald-100 rounded-2xl px-5 pr-12 text-xs font-bold text-emerald-700 focus:outline-none"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white rounded-xl shadow-sm text-emerald-600 hover:text-emerald-700 transition-all active:scale-90"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Valable 48 heures
                                </span>
                                <button 
                                    onClick={() => { setGeneratedLink(""); setClientName(""); }}
                                    className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest hover:underline"
                                >
                                    Nouveau lien
                                </button>
                            </div>

                            <button
                                onClick={copyToClipboard}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Copier & Envoyer au client
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                        <Link className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-[10px] leading-relaxed text-gray-400 font-medium">
                        Ce lien permettra au client d'accéder au formulaire de réservation privé. Une fois généré, envoyez-le par email ou message direct.
                    </p>
                </div>
            </div>
        </div>
    );
}
