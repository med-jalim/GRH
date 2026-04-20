import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, X, Info, ExternalLink } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NotificationData {
  title: string;
  message: string;
  url: string;
}

interface Notification {
  id: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
}

export default function NotificationDropdown() {
  const { auth } = usePage().props as any;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = auth?.notifications?.latest || [];
  const unreadCount = auth?.notifications?.unread_count || 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    router.post(`/admin/notifications/${id}/read`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Optional: close if needed or keep open
      },
    });
  };

  const markAllAsRead = () => {
    router.post('/admin/notifications/read-all', {}, {
      preserveScroll: true,
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors bg-white rounded-lg border border-gray-100 hover:border-gray-300"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mr-1 -mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl z-50 overflow-hidden rounded-xl animate-in fade-in zoom-in duration-200">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-[#54b172] hover:text-[#44915d] transition-colors flex items-center gap-1"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 transition-colors group relative",
                      !notification.read_at ? "bg-green-50/30 hover:bg-green-50/50" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "mt-1 w-2 h-2 rounded-full shrink-0",
                        !notification.read_at ? "bg-[#54b172]" : "bg-transparent"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                            {notification.data.title}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {notification.created_at}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {notification.data.message}
                        </p>
                        
                        <div className="mt-3 flex items-center gap-3">
                          {notification.data.url && (
                             <a
                                href={notification.data.url}
                                className="text-[11px] font-semibold text-[#54b172] hover:underline flex items-center gap-1"
                                onClick={(e) => {
                                  // Mark as read when clicking the link if it's unread
                                  if (!notification.read_at) {
                                    markAsRead(notification.id);
                                  }
                                }}
                             >
                               Voir les détails <ExternalLink className="w-3 h-3" />
                             </a>
                          )}
                          {!notification.read_at && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              Marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Aucune notification</p>
                <p className="text-xs text-gray-400 mt-1">Vous êtes à jour !</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/30 text-center">
              <span className="text-[10px] text-gray-400 font-medium">
                Affichage les {notifications.length} dernières notifications
              </span>
            </div>
          )}
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
