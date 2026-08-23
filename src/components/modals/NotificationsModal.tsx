import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Wrench, Sparkles, Trash2 } from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotifications
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'service':
        return <Sparkles className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] w-full max-w-lg p-6 sm:p-7 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-[#0f172a]">Centro Notifiche</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#dc2626] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {unreadCount} nuove
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748b]">Avvisi su tagliandi, scadenze e consigli predittivi AI</p>
            </div>
          </div>
          <button 
            id="btn-close-notifications-modal"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-[#2563eb] hover:text-[#1d4ed8] font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:underline"
          >
            ✓ Segna tutte come lette
          </button>

          <button
            type="button"
            onClick={onClearNotifications}
            className="text-slate-400 hover:text-red-600 font-semibold transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Svuota registro</span>
          </button>
        </div>

        {/* NOTIFICATIONS LIST */}
        <div className="flex flex-col gap-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center gap-2 text-[#64748b]">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 stroke-[1.5]" />
              <p className="text-sm font-bold text-[#0f172a]">Nessuna notifica in sospeso</p>
              <p className="text-xs max-w-xs">Il tuo garage è in perfetto ordine. Riceverai avvisi in prossimità delle scadenze chilometriche o temporali.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => onMarkAsRead(item.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex gap-3.5 ${
                  item.read
                    ? 'bg-white border-[#e2e8f0] opacity-80'
                    : 'bg-blue-50/40 border-[#2563eb]/40 shadow-xs'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">{item.title}</h4>
                    <span className="text-[10px] text-[#64748b] font-medium whitespace-nowrap">{item.date}</span>
                  </div>

                  <p className="text-xs text-[#64748b] leading-relaxed">{item.message}</p>

                  {item.carPlate && (
                    <div className="mt-1 self-start">
                      <span className="bg-slate-100 text-[#0f172a] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-[#e2e8f0] uppercase tracking-wider">
                        {item.carPlate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-3 border-t border-[#e2e8f0] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-xs"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
