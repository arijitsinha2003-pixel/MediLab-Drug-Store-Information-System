import React from 'react';
import {
  LayoutDashboard,
  Users,
  KeyRound,
  Stethoscope,
  Microscope,
  Pill,
  FileText,
  Calendar,
  AlertTriangle,
  ClipboardList,
  PlusCircle,
  FileCheck,
  Settings,
  History,
  ShoppingCart,
  Receipt,
  TestTube2,
  UserPlus,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  role: UserRole;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  badges?: {
    lowStock?: number;
    pendingLab?: number;
    pendingRx?: number;
    waitingApt?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  badges,
}) => {
  const badgeCounts = badges || {};
  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
          { id: 'unique-codes', label: 'Unique-Code Security', icon: <KeyRound className="w-4 h-4" /> },
          { id: 'staff', label: 'Doctor & Staff Directory', icon: <Stethoscope className="w-4 h-4" /> },
          { id: 'patients', label: 'Patient Management', icon: <Users className="w-4 h-4" /> },
          {
            id: 'lab-management',
            label: 'Lab Order Management',
            icon: <Microscope className="w-4 h-4" />,
            badge: badgeCounts.pendingLab,
            badgeColor: 'bg-teal-100 text-teal-800',
          },
          {
            id: 'pharmacy-inventory',
            label: 'Pharmacy / Drug Inventory',
            icon: <Pill className="w-4 h-4" />,
            badge: badgeCounts.lowStock,
            badgeColor: 'bg-amber-100 text-amber-800',
          },
          { id: 'activity-logs', label: 'Audit & Activity Logs', icon: <History className="w-4 h-4" /> },
          { id: 'settings', label: 'System Settings', icon: <Settings className="w-4 h-4" /> },
        ];

      case 'doctor':
        return [
          { id: 'overview', label: 'Doctor Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          {
            id: 'appointments',
            label: 'Appointment Queue',
            icon: <Calendar className="w-4 h-4" />,
            badge: badgeCounts.waitingApt,
            badgeColor: 'bg-blue-100 text-blue-800',
          },
          { id: 'patients', label: 'Patient Directory & EMR', icon: <Users className="w-4 h-4" /> },
          { id: 'new-patient', label: 'Register New Patient', icon: <UserPlus className="w-4 h-4" /> },
          {
            id: 'prescriptions',
            label: 'Prescription Management',
            icon: <FileText className="w-4 h-4" />,
          },
          {
            id: 'lab-reports',
            label: 'Diagnostic Lab Reports',
            icon: <FileCheck className="w-4 h-4" />,
          },
        ];

      case 'pathologist':
        return [
          { id: 'overview', label: 'Laboratory Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          {
            id: 'lab-orders',
            label: 'Pending Test Orders',
            icon: <ClipboardList className="w-4 h-4" />,
            badge: badgeCounts.pendingLab,
            badgeColor: 'bg-teal-100 text-teal-800',
          },
          { id: 'sample-tracking', label: 'Sample Tracking Workflow', icon: <TestTube2 className="w-4 h-4" /> },
          { id: 'lab-reports', label: 'Verified Diagnostic Reports', icon: <FileCheck className="w-4 h-4" /> },
          { id: 'test-catalog', label: 'Lab Test Catalog & Ranges', icon: <Microscope className="w-4 h-4" /> },
        ];

      case 'dispensary':
        return [
          { id: 'overview', label: 'Dispensary Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          {
            id: 'prescriptions',
            label: 'Prescription Queue',
            icon: <ClipboardList className="w-4 h-4" />,
            badge: badgeCounts.pendingRx,
            badgeColor: 'bg-emerald-100 text-emerald-800',
          },
          {
            id: 'inventory',
            label: 'Medicine Inventory',
            icon: <Pill className="w-4 h-4" />,
            badge: badgeCounts.lowStock,
            badgeColor: 'bg-amber-100 text-amber-800',
          },
          { id: 'pos', label: 'Walk-In Dispense / Billing', icon: <ShoppingCart className="w-4 h-4" /> },
          { id: 'invoices', label: 'Invoices & Sales History', icon: <Receipt className="w-4 h-4" /> },
          { id: 'alerts', label: 'Expiry & Low-Stock Alerts', icon: <AlertTriangle className="w-4 h-4" /> },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-4 px-3 bg-slate-50/90 border-r border-slate-200">
      <div>
        <div className="px-3 pb-3 mb-2 border-b border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {(role || '').toUpperCase()} WORKSPACE
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-teal-800' : item.badgeColor || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-3 pt-3 border-t border-slate-200 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>MediLab Secure OS</span>
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
