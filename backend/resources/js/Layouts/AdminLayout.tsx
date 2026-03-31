import { ReactNode } from "react";
import { Link, usePage } from "@inertiajs/react";
import { 
  Building2, 
  CalendarCheck, 
  LayoutDashboard, 
  Settings, 
  Users, 
  LogOut,
  BedDouble
} from "lucide-react";

interface Props {
  children: ReactNode;
}

export function AdminLayout({ children }: Props) {
  const { url } = usePage();

  const navigation = [
    { name: "Tableau de Bord", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Réservations", href: "/admin/reservations", icon: CalendarCheck },
    { name: "Hôtels", href: "/admin/hotels", icon: Building2 },
    { name: "Chambres", href: "/admin/chambres", icon: BedDouble },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-all">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xs">GRH</span>
            </div>
            <span className="text-white font-bold text-lg">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navigation.map((item) => {
            const isActive = url.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-amber-500/10 text-amber-500 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 isolate">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Vue Client</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
