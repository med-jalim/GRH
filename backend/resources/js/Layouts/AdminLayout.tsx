import { ReactNode } from "react";
import { Link, usePage } from "@inertiajs/react";
import { 
  Building2, 
  LayoutDashboard, 
  Search,
  BookOpen,
  CalendarCheck,
  Bell,
  MessageCircle,
  ChevronDown,
  BedDouble,
  HelpCircle,
} from "lucide-react";
import { ToastProvider } from "@/components/ui/Toast";
import { useFlash } from "@/lib/hooks";

interface Props {
  children: ReactNode;
}

function FlashListener() {
  useFlash();
  return null;
}

export function AdminLayout({ children }: Props) {
  const { url } = usePage();

  const primaryNav = [
    { name: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Réservations", href: "/admin/reservations", icon: CalendarCheck },
    { name: "Hôtels", href: "/admin/hotels", icon: Building2 },
    { name: "Chambres", href: "/admin/chambres", icon: BedDouble },
  ];

  return (
    <ToastProvider>
      <FlashListener />
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
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">
              G
            </div>
            <span className="text-gray-900 font-bold text-xl">GRH Hôtels</span>
          </div>

          <div className="mt-8 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Rechercher" 
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 font-medium">
              ⌘K
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <nav className="space-y-1">
            {primaryNav.map((item) => {
              const isActive = url.startsWith(item.href) && item.href !== "#";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? "bg-[#54b172] text-white shadow-sm shadow-green-500/20"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa]">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center text-xl font-bold text-gray-900">
            Tableau de Bord
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative hidden md:flex items-center text-gray-400">
              <Search className="w-4 h-4 absolute left-3" />
              <input 
                type="text" 
                placeholder="Rechercher des réservations..." 
                className="w-64 pl-9 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-gray-700"
              />
            </div>
            
            <div className="flex items-center gap-4 text-gray-500">
              <button className="hover:text-gray-900 transition-colors"><Bell className="w-5 h-5" /></button>
              <button className="hover:text-gray-900 transition-colors"><MessageCircle className="w-5 h-5" /></button>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
              <img 
                src="https://i.pravatar.cc/150?img=32" 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" 
              />
              <div className="hidden sm:block text-sm">
                <span className="font-semibold text-gray-900 block leading-tight">Admin Hotel</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>

      {/* Global CSS for scrollbar hiding/styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #f3f4f6;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
