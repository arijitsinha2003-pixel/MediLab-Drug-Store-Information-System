import React, { useState, useEffect } from 'react';
import { User, Patient, LabOrder, Prescription, Invoice, Notification } from '../../types';
import { MediLabStore } from '../../services/storage';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AdminDashboard } from '../admin/AdminDashboard';
import { DoctorDashboard } from '../doctor/DoctorDashboard';
import { PathologistDashboard } from '../pathologist/PathologistDashboard';
import { DispensaryDashboard } from '../dispensary/DispensaryDashboard';
import { PatientDetailModal } from '../patient/PatientDetailModal';
import { PrintReportModal } from '../common/PrintReportModal';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modals for inspection & printing across any role
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [printDoc, setPrintDoc] = useState<{
    type: 'lab' | 'rx' | 'invoice';
    data: LabOrder | Prescription | Invoice;
  } | null>(null);

  const refreshNotifications = () => {
    const list = MediLabStore.getNotifications(user.role);
    setNotifications(list);
  };

  useEffect(() => {
    refreshNotifications();
  }, [user.role]);

  // Badges calculation
  const stats = MediLabStore.getSystemStats();
  const badges = {
    lowStock: stats.lowStockCount,
    pendingLab: stats.pendingLabReports,
    waitingApt: 2,
  };

  const handleOpenPrint = (type: 'lab' | 'rx' | 'invoice', data: LabOrder | Prescription | Invoice) => {
    setPrintDoc({ type, data });
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        user={user}
        onLogout={onLogout}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        notifications={notifications}
        onRefreshNotifications={refreshNotifications}
        onNavigateAction={(action) => setCurrentTab(action)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex flex-1 relative">
        {/* Role-Specific Sidebar */}
        <Sidebar
          role={user.role}
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          badges={badges}
        />

        {/* Main Workspace Canvas */}
        <main className="flex-1 min-w-0 overflow-y-auto pb-12">
          {user.role === 'admin' && (
            <AdminDashboard
              currentUser={user}
              activeTab={currentTab}
              onNavigateTab={setCurrentTab}
              onViewPatient={setSelectedPatient}
              searchQuery={searchQuery}
            />
          )}

          {user.role === 'doctor' && (
            <DoctorDashboard
              currentUser={user}
              activeTab={currentTab}
              onNavigateTab={setCurrentTab}
              onViewPatient={setSelectedPatient}
              onPrintReport={handleOpenPrint}
              searchQuery={searchQuery}
            />
          )}

          {user.role === 'pathologist' && (
            <PathologistDashboard
              currentUser={user}
              activeTab={currentTab}
              onNavigateTab={setCurrentTab}
              onPrintReport={handleOpenPrint}
              searchQuery={searchQuery}
            />
          )}

          {user.role === 'dispensary' && (
            <DispensaryDashboard
              currentUser={user}
              activeTab={currentTab}
              onNavigateTab={setCurrentTab}
              onPrintReport={handleOpenPrint}
              searchQuery={searchQuery}
            />
          )}
        </main>
      </div>

      {/* Patient Dossier Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onViewPrescription={(rx) => handleOpenPrint('rx', rx)}
          onViewLabReport={(lab) => handleOpenPrint('lab', lab)}
        />
      )}

      {/* Printable Clinical Report / Invoice Modal */}
      {printDoc && (
        <PrintReportModal
          type={printDoc.type}
          data={printDoc.data}
          onClose={() => setPrintDoc(null)}
        />
      )}
    </div>
  );
};
