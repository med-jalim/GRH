import { AdminLayout } from "@/Layouts/AdminLayout";
import { Users, CalendarDays, TrendingUp, Building } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { name: "Réservations en attente", value: "12", icon: CalendarDays, change: "+20%", color: "text-amber-600", bg: "bg-amber-50" },
    { name: "Nouveaux Clients", value: "45", icon: Users, change: "+12%", color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Taux d'occupation", value: "85%", icon: Building, change: "+5%", color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Revenus (Mensuel)", value: "12,500 د.ج", icon: TrendingUp, change: "+15%", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tableau de Bord</h1>
        <p className="text-slate-500 mt-2 text-sm">Vue d'ensemble de votre activité hôtelière.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{stat.change}</span>
              <span className="text-slate-400 text-xs font-medium">vs mois précédent</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[400px]">
         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-slate-300" />
         </div>
         <h3 className="text-lg font-semibold text-slate-700">Aucune donnée graphique</h3>
         <p className="text-slate-400 mt-2 text-sm text-center max-w-sm">Section réservée pour les futurs graphiques analytiques. Connectez votre base de données pour visualiser les tendances.</p>
      </div>
    </AdminLayout>
  );
}
