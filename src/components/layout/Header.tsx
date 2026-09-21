import React, { useState } from 'react';
import {
  Building2,
  Bell,
  LogOut,
  KeyRound,
  Search,
  Shield,
  Stethoscope,
  Microscope,
  Pill,
  Menu,
  Activity,
} from 'lucide-react';
import { User, Notification } from '../../types';
import { CredentialCardModal } from '../common/CredentialCardModal';
import { NotificationPopover } from '../common/NotificationPopover';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
  notifications: Notification[];
  onRefreshNotifications: () => void;
  onNavigateAction?: (action: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onToggleMobileSidebar,
  notifications,
  onRefreshNotifications,
  onNavigateAction,
  searchQuery,
  onSearchChange,
}) => {
  const [showCardModal, setShowCardModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleMeta = ({
    admin: {
      label: 'Admin',
      icon: <Shield className="w-3.5 h-3.5" />,
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    doctor: {
      label: 'Doctor',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    pathologist: {
      label: 'Pathologist',
      icon: <Microscope className="w-3.5 h-3.5" />,
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    dispensary: {
      label: 'Dispensary',
      icon: <Pill className="w-3.5 h-3.5" />,
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
  } as Record<string, any>)[user.role] || {
    label: user.role,
    icon: <Activity className="w-3.5 h-3.5" />,
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  Aarogya MediLab
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-teal-600">
                  &amp; Drug Store
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleMeta.badge}`}
                >
                  {roleMeta.icon}
                  {roleMeta.label}
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 mt-0.5">
                Hospital &amp; Laboratory Information System
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Universal Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search patients, medicines, lab tests, prescriptions..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-xs text-slate-800 rounded-xl border border-transparent focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition"
            />
          </div>
        </div>

        {/* Right: Actions & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick View Credential Code Button */}
          <button
            type="button"
            onClick={() => setShowCardModal(true)}
            title="View Your Unique Login Code"
            className="hidden sm:flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/60 text-slate-700 text-xs font-semibold transition"
          >
            <KeyRound className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-mono text-[11px] text-teal-800 font-bold">{user.uniqueCode}</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <NotificationPopover
                notifications={notifications}
                userRole={user.role}
                onClose={() => setShowNotifications(false)}
                onRefresh={onRefreshNotifications}
                onNavigate={onNavigateAction}
              />
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=128&q=80'}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-xl object-cover border border-slate-200"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 truncate max-w-[140px] leading-tight">
                {user.fullName}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                {user.departmentOrSpecialty || user.role}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Logout of MediLab"
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showCardModal && <CredentialCardModal user={user} onClose={() => setShowCardModal(false)} />}
    </header>
  );
};
