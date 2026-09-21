import React from 'react';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Notification, UserRole } from '../../types';
import { MediLabStore } from '../../services/storage';

interface NotificationPopoverProps {
  notifications: Notification[];
  userRole: UserRole;
  onClose: () => void;
  onRefresh: () => void;
  onNavigate?: (action: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  notifications,
  userRole,
  onClose,
  onRefresh,
  onNavigate,
}) => {
  const handleMarkAllRead = () => {
    MediLabStore.markAllNotificationsAsRead(userRole);
    onRefresh();
  };

  const handleMarkRead = (id: string, action?: string) => {
    MediLabStore.markNotificationAsRead(id);
    onRefresh();
    if (action && onNavigate) {
      onNavigate(action);
      onClose();
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">System Notifications</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            Mark all read
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">No active notifications</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkRead(notif.id, notif.linkAction)}
              className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3 ${
                !notif.isRead ? 'bg-teal-50/40' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{notif.title}</h4>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                <div className="text-[10px] text-slate-400 mt-1">
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
