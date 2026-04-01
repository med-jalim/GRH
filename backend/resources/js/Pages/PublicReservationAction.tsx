import { CheckCircle2, XCircle, Home, Mail } from "lucide-react";
import { Link } from "@inertiajs/react";

interface Props {
  success: boolean;
  message: string;
  reservation?: any;
}

export default function PublicReservationAction({ success, message, reservation }: Props) {
  console.log({ success, message, reservation })
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 p-8 md:p-12 text-center animate-in fade-in zoom-in duration-500">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 ${success ? 'bg-emerald-50 text-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-red-50 text-red-500 shadow-lg shadow-red-500/20'}`}>
          {success ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          {success ? 'Opération réussie' : 'Erreur'}
        </h1>
        
        <p className="text-slate-600 font-medium leading-relaxed mb-10">
          {message}
        </p>

        {reservation && (
          <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Référence</p>
            <p className="font-mono font-bold text-slate-900">{reservation.code_reference}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          
          <p className="text-xs text-slate-400 pt-4">
            Pour toute question, contactez-nous à <span className="text-slate-600 font-bold">contact@grh-hotels.com</span>
          </p>
        </div>
      </div>
      
      <p className="text-slate-400 text-xs mt-8">
        © 2026 Groupe Résidences Hôtelières · Système de Réservation
      </p>
    </div>
  );
}
