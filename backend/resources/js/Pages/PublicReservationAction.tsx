import { CheckCircle2, XCircle, Home, Mail } from "lucide-react";
import { Link } from "@inertiajs/react";

interface Props {
  success: boolean;
  message: string;
  reservation?: any;
}

export default function PublicReservationAction({ success, message, reservation }: Props) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 p-10 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 ${success ? 'bg-emerald-50 text-[#54b172] shadow-lg shadow-emerald-500/10' : 'bg-rose-50 text-rose-500 shadow-lg shadow-rose-500/10'}`}>
          {success ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight uppercase">
          {success ? 'Confirmation' : 'Attention'}
        </h1>
        
        <p className="text-slate-500 font-medium leading-relaxed mb-10 text-sm">
          {message}
        </p>

        {reservation && (
          <div className="bg-slate-50 rounded-xl p-5 mb-10 text-left border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dossier N°</p>
                <p className="font-bold text-slate-900 tracking-tight">{reservation.code_reference}</p>
            </div>
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Actif
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Link
            href={`/reservation/${reservation?.token || ''}`}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
          >
            {reservation ? "Accéder à mon espace" : "Retour à l'accueil"}
          </Link>
          
          <div className="pt-6 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Besoin d'aide ?</p>
            <p className="text-xs text-slate-600">
                Contactez notre support : <span className="font-bold text-[#54b172]">contact@grh-hotels.com</span>
            </p>
          </div>
        </div>
      </div>
      
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-10">
        © 2026 Groupe Résidences Hôtelières 
      </p>
    </div>
  );
}
