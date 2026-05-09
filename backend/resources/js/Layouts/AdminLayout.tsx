import { useState, ReactNode } from "react";
import { Link, usePage, router } from "@inertiajs/react";
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
  LogOut,
  Eye,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { ToastProvider } from "@/components/ui/Toast";
import { useFlash } from "@/lib/hooks";
import NotificationDropdown from "@/components/NotificationDropdown";

interface Props {
  children: ReactNode;
}

function FlashListener() {
  useFlash();
  return null;
}

export function AdminLayout({ children }: Props) {
  const { url, props } = usePage();
  const { auth } = props as any;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
      router.post('/admin/logout');
    }
  };

  const primaryNav = [
    { name: "Tableau de bord", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Réservations", href: "/admin/reservations", icon: CalendarCheck },
    { name: "Hôtels", href: "/admin/hotels", icon: Building2 },
    { name: "Emails", href: "/admin/email-templates", icon: Mail },
    { name: "Paramètres", href: "/admin/settings", icon: Settings },
  ];

  return (
    <ToastProvider>
      <FlashListener />
      <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
        {/* Sidebar */}
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-100 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out`}>
          <div className="p-4 overflow-hidden">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-black/10">
                G
              </div>
              {!isCollapsed && (
                <span className="text-gray-900 font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                  GRH Hôtels
                </span>
              )}
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
                    title={isCollapsed ? item.name : ""}
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-2xl transition-all font-semibold text-sm ${
                      isActive
                        ? "bg-[#54b172] text-white shadow-lg shadow-green-500/25"
                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap overflow-hidden animate-in fade-in slide-in-from-left-1">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-100 space-y-1">
            <button
              onClick={handleLogout}
              title={isCollapsed ? "Déconnexion" : ""}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 text-red-400 hover:text-red-700 transition-colors rounded-xl hover:bg-red-50 w-full text-left`}
            >
              <LogOut className="w-6 h-6" />
              {!isCollapsed && <span className="font-semibold text-sm">Déconnexion</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa]">
          {/* Top Header */}
          <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2.5 bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all active:scale-95 border border-gray-100 shadow-sm"
                title={isCollapsed ? "Développer" : "Réduire"}
              >
                {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
              </button>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 tracking-tight">Espace Administration</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">Gestion GRH Hôtels</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              
              
              <div className="flex items-center gap-4">
                <NotificationDropdown />
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 group">
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${auth?.user?.name || 'Admin'}&background=random`} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover" 
                  />
                  <div className="hidden sm:block text-sm">
                    <span className="font-semibold text-gray-900 block leading-tight">{auth?.user?.name || 'Admin'}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{auth?.user?.email}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
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
    </ToastProvider>
  );
}
