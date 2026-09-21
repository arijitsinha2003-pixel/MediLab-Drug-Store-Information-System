import React, { useState } from 'react';
import {
  Users,
  KeyRound,
  Shield,
  Stethoscope,
  Microscope,
  Pill,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  Search,
  RefreshCw,
  Ban,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  User,
  UserRole,
  Patient,
  Medicine,
  UniqueLoginCode,
  ActivityLog,
  LabTestCatalogItem,
} from '../../types';
import { MediLabStore } from '../../services/storage';

interface AdminDashboardProps {
  currentUser: User;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onViewPatient: (patient: Patient) => void;
  searchQuery: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  activeTab,
  onNavigateTab,
  onViewPatient,
  searchQuery,
}) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [logSeverityFilter, setLogSeverityFilter] = useState<string>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const stats = MediLabStore.getSystemStats();
  const users = MediLabStore.getUsers();
  const codes = MediLabStore.getUniqueCodes();
  const patients = MediLabStore.getPatients();
  const medicines = MediLabStore.getMedicines();
  const labCatalog = MediLabStore.getLabCatalog();
  const logs = MediLabStore.getActivityLogs();

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleToggleUserActive = (userId: string) => {
    try {
      const isNowActive = MediLabStore.toggleUserStatus(userId, currentUser.fullName);
      setFeedbackMsg({
        text: `User account has been ${isNowActive ? 'activated' : 'deactivated'} successfully.`,
        type: 'success',
      });
      handleRefresh();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err: any) {
      setFeedbackMsg({ text: err.message, type: 'error' });
    }
  };

  const handleRevokeCode = (userId: string) => {
    if (confirm('Are you sure you want to revoke this unique login code? The staff member will not be able to log in until re-issued.')) {
      try {
        MediLabStore.revokeUserCode(userId, currentUser.fullName);
        setFeedbackMsg({ text: 'Unique security code successfully revoked.', type: 'success' });
        handleRefresh();
        setTimeout(() => setFeedbackMsg(null), 3500);
      } catch (err: any) {
        setFeedbackMsg({ text: err.message, type: 'error' });
      }
    }
  };

  const handleReissueCode = (userId: string) => {
    try {
      const newCode = MediLabStore.regenerateUserCode(userId, currentUser.fullName);
      setFeedbackMsg({ text: `New unique code generated and issued: ${newCode}`, type: 'success' });
      handleRefresh();
      setTimeout(() => setFeedbackMsg(null), 6000);
    } catch (err: any) {
      setFeedbackMsg({ text: err.message, type: 'error' });
    }
  };

  const handleResetData = () => {
    if (confirm('Reset all demo data back to clean factory default state? Any added demo records will be restored.')) {
      MediLabStore.resetToFactoryDefaults();
      window.location.reload();
    }
  };

  // Chart Data
  const monthlyActivityData = [
    { month: 'Apr', consultations: 42, labOrders: 28, prescriptions: 35 },
    { month: 'May', consultations: 58, labOrders: 40, prescriptions: 49 },
    { month: 'Jun', consultations: 74, labOrders: 52, prescriptions: 68 },
    { month: 'Jul', consultations: 86, labOrders: 65, prescriptions: 77 },
    { month: 'Aug', consultations: 104, labOrders: 82, prescriptions: 94 },
    { month: 'Sep', consultations: 128, labOrders: 96, prescriptions: 115 },
  ];

  const stockBreakdownData = [
    { name: 'Optimal Stock', value: medicines.filter((m) => m.quantity > m.reorderLevel).length, color: '#0d9488' },
    { name: 'Low Stock', value: stats.lowStockCount, color: '#f59e0b' },
    { name: 'Near Expiry', value: stats.nearExpiryCount, color: '#3b82f6' },
    { name: 'Out / Expired', value: stats.outOfStockCount + stats.expiredCount, color: '#ef4444' },
  ];

  // Filtering
  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchSearch =
      !searchQuery ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  const filteredCodes = codes.filter((c) => {
    return (
      !searchQuery ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userRole.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredPatients = patients.filter((p) => {
    return (
      !searchQuery ||
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredStaff = users.filter((u) => {
    return (
      (u.role === 'doctor' || u.role === 'pathologist' || u.role === 'dispensary') &&
      (!searchQuery ||
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.departmentOrSpecialty?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const filteredMedicines = medicines.filter((m) => {
    return (
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredLabCatalog = labCatalog.filter((l) => {
    return (
      !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredLogs = logs.filter((l) => {
    const matchSeverity = logSeverityFilter === 'all' || l.severity === logSeverityFilter;
    const matchSearch =
      !searchQuery ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSeverity && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW: OVERVIEW */}
      {(activeTab === 'overview' || !activeTab) && (
        <>
          {/* Top Metric Cards (Fulfilling prompt #5: Total Patients, Total Doctors, Laboratory Tests, Available Medicines, Low Stock, Pending Reports) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Total Patients */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Patients</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.totalPatients}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +12% this month
              </div>
            </div>

            {/* Total Doctors */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Doctors</span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.totalDoctors}</div>
              <div className="text-[10px] text-slate-400 mt-1">Active staff clinicians</div>
            </div>

            {/* Laboratory Tests */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Lab Tests</span>
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Microscope className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.totalLabTests}</div>
              <div className="text-[10px] text-teal-600 font-semibold mt-1">
                {stats.verifiedLabReports} Verified
              </div>
            </div>

            {/* Available Medicines */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Medicines</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Pill className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.totalMedicines}</div>
              <div className="text-[10px] text-slate-400 mt-1">Active formulary items</div>
            </div>

            {/* Low Stock Medicines */}
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs bg-amber-50/20">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock</span>
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-amber-900">{stats.lowStockCount}</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-1">Needs reordering</div>
            </div>

            {/* Pending Reports */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Reports</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{stats.pendingLabReports}</div>
              <div className="text-[10px] text-rose-600 font-semibold mt-1">In diagnostics queue</div>
            </div>
          </div>

          {/* Graphical Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clinical & Lab Activity Trends */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hospital Department Volume Trends</h3>
                  <p className="text-xs text-slate-400">Monthly consultation, lab orders &amp; prescription trends</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-teal-600"></span> Consults
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Lab Orders
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400"></span> Rx Fulfilled
                  </span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="consultations" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="labOrders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="prescriptions" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory Health Pie */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Drug Store Inventory Health</h3>
                <p className="text-xs text-slate-400">Stock thresholds and expiry status overview</p>
              </div>
              <div className="h-52 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockBreakdownData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {stockBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '8px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                {stockBreakdownData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate text-[11px]">{item.name}:</span>
                    <span className="font-bold text-slate-900 text-[11px]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Recent Security Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Administrator Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigateTab('users')}
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Manage Staff Accounts</div>
                    <div className="text-[10px] text-slate-400">Activate or change roles</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigateTab('unique-codes')}
                  className="p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 text-left transition flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Unique Code Security</div>
                    <div className="text-[10px] text-slate-400">Audit &amp; revoke credentials</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigateTab('pharmacy-inventory')}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Drug Store Control</div>
                    <div className="text-[10px] text-slate-400">Formulary &amp; restock alerts</div>
                  </div>
                </button>

                <button
                  onClick={() => onNavigateTab('activity-logs')}
                  className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Audit &amp; Access Logs</div>
                    <div className="text-[10px] text-slate-400">HIPAA compliance trail</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Audit Logs Preview */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Security Activity</h3>
                <button
                  onClick={() => onNavigateTab('activity-logs')}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All Logs &rarr;
                </button>
              </div>
              <div className="space-y-2.5">
                {logs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{log.action}</div>
                      <div className="text-slate-500 text-[11px] leading-tight mt-0.5">{log.details}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        By <span className="font-semibold">{log.userName}</span> • {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        log.severity === 'critical'
                          ? 'bg-rose-100 text-rose-700'
                          : log.severity === 'warn'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-teal-100 text-teal-700'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">User Account Management</h3>
              <p className="text-xs text-slate-400">Review staff accounts, toggle activation, and inspect credentials</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Staff Roles</option>
                <option value="admin">Administrators</option>
                <option value="doctor">Doctors</option>
                <option value="pathologist">Pathologists</option>
                <option value="dispensary">Dispensary Staff</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Staff Member</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Department / Specialty</th>
                  <th className="p-3.5">Unique Login Code</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=64&q=80'}
                          alt={u.fullName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.fullName}</div>
                          <div className="text-slate-400 text-[11px]">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{u.departmentOrSpecialty || 'General Staff'}</td>
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {u.uniqueCode}
                      </span>
                      {u.isCodeRevoked && (
                        <span className="ml-1 text-[10px] text-rose-600 font-bold">(REVOKED)</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-600' : 'bg-slate-500'}`} />
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleToggleUserActive(u.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            u.isActive
                              ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: UNIQUE-CODE MANAGEMENT */}
      {activeTab === 'unique-codes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Unique Login Code Authority</h3>
              <p className="text-xs text-slate-400">
                Hospital-wide unique credential ledger. Revoke compromised codes or re-issue randomized keys.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Total Issued: <span className="font-bold text-slate-900">{codes.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Credential Code</th>
                  <th className="p-3.5">Assigned Staff</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Usage Count</th>
                  <th className="p-3.5">Last Authenticated</th>
                  <th className="p-3.5 text-right">Security Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCodes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5">
                      <span className="font-mono text-sm font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 select-all">
                        {c.code}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{c.userName}</td>
                    <td className="p-3.5">
                      <span className="capitalize text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {c.userRole}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isRevoked
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {c.isRevoked ? 'Revoked / Disabled' : 'Active & Valid'}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{c.usageCount || 0} logins</td>
                    <td className="p-3.5 text-slate-500">
                      {c.lastUsedAt ? new Date(c.lastUsedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {!c.isRevoked ? (
                        <button
                          onClick={() => handleRevokeCode(c.userId)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-50 transition"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReissueCode(c.userId)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-700 border border-teal-200 hover:bg-teal-50 transition"
                        >
                          Re-issue Fresh Code
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: PATIENTS LIST */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Registry Master</h3>
              <p className="text-xs text-slate-400">Total registered patients across MediLab clinical network</p>
            </div>
            <span className="text-xs text-slate-500 font-semibold">{filteredPatients.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Patient ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Age / Sex</th>
                  <th className="p-3.5">Blood Group</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Attending Doctor</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono font-bold text-teal-700">{p.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{p.fullName}</td>
                    <td className="p-3.5 text-slate-600">{p.age}y • {p.gender}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{p.contact}</td>
                    <td className="p-3.5 text-slate-700 font-medium">{p.assignedDoctorName || 'General OPD'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onViewPatient(p)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: AUDIT & ACTIVITY LOGS */}
      {activeTab === 'activity-logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Security &amp; Activity Audit Logs</h3>
              <p className="text-xs text-slate-400">Timestamped tamper-evident record of all system operations</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={logSeverityFilter}
                onChange={(e) => setLogSeverityFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warn">Warnings</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Action Event</th>
                  <th className="p-3.5">Actor &amp; Role</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">IP Address</th>
                  <th className="p-3.5 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{l.action}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800">{l.userName}</span>
                      <span className="text-[10px] text-slate-400 block uppercase">{l.userRole}</span>
                    </td>
                    <td className="p-3.5 text-slate-600 max-w-sm leading-relaxed">{l.details}</td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">{l.ipAddress}</td>
                    <td className="p-3.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          l.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800 font-bold'
                            : l.severity === 'warn'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {l.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: DOCTOR & STAFF DIRECTORY */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Doctor & Staff Medical Directory</h3>
            <p className="text-xs text-slate-400">Professional profiles of clinical and laboratory personnel</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {filteredStaff.map((staff) => (
              <div key={staff.id} className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 transition-colors bg-slate-50/30">
                <div className="flex items-start gap-3">
                  <img src={staff.avatarUrl} alt={staff.fullName} className="w-12 h-12 rounded-lg object-cover border border-slate-200" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{staff.fullName}</h4>
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tight">{staff.role}</p>
                    <p className="text-xs text-slate-500 mt-1">{staff.departmentOrSpecialty}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Employee ID</span>
                    <span className="font-mono text-slate-700">{staff.id}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Phone</span>
                    <span className="text-slate-700">{staff.phone}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Email</span>
                    <span className="text-slate-700">{staff.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: LABORATORY MANAGEMENT */}
      {activeTab === 'lab-management' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Diagnostic Laboratory Catalog</h3>
            <p className="text-xs text-slate-400">Standard test profiles, pricing, and reference ranges</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Test Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Sample Type</th>
                  <th className="p-3.5">TAT</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5">Normal Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLabCatalog.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{test.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{test.id}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">{test.category}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{test.sampleType}</td>
                    <td className="p-3.5 text-slate-600 font-medium">{test.turnaroundHours} hrs</td>
                    <td className="p-3.5 font-bold text-slate-900">₹{test.price}</td>
                    <td className="p-3.5 text-[11px] text-slate-500 italic max-w-xs">{test.normalRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: PHARMACY INVENTORY */}
      {activeTab === 'pharmacy-inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Central Pharmacy Drug Inventory</h3>
            <p className="text-xs text-slate-400">Real-time stock levels, expiry tracking, and manufacturer details</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Drug Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">In Stock</th>
                  <th className="p-3.5">Expiry</th>
                  <th className="p-3.5">Unit Price</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Manufacturer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((med) => {
                  const isLow = med.quantity <= med.reorderLevel;
                  const isExpired = new Date(med.expiryDate) < new Date();
                  return (
                    <tr key={med.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{med.name}</div>
                        <div className="text-[10px] text-slate-400 italic">{med.genericName}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">{med.category}</span>
                      </td>
                      <td className="p-3.5">
                        <div className={`font-bold ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                          {med.quantity} {med.dosageForm}s
                        </div>
                        {isLow && <div className="text-[9px] font-bold text-amber-500 uppercase mt-0.5">Low Stock</div>}
                      </td>
                      <td className="p-3.5">
                        <div className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-600'}>{med.expiryDate}</div>
                        {isExpired && <div className="text-[9px] font-bold text-rose-500 uppercase mt-0.5">Expired</div>}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">₹{med.unitPrice}</td>
                      <td className="p-3.5 text-slate-500">{med.locationRack}</td>
                      <td className="p-3.5 text-slate-500">{med.manufacturer}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital &amp; System Configuration</h3>
            <p className="text-xs text-slate-400">Global parameters for MediLab &amp; Drug Store Information System</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  disabled
                  value="MediLab Central Hospital & Diagnostic Center"
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Operating Currency</label>
                <input
                  type="text"
                  disabled
                  value="Indian Rupee (₹)"
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Default Pharmacy Stock Reorder Threshold
                </label>
                <input
                  type="text"
                  disabled
                  value="30 Units"
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Database className="w-4 h-4 text-teal-600" />
                <span>Demo Storage &amp; Factory Reset</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The application state is actively stored and synced in real-time. If you wish to restore the clean initial demo database with all original doctors, pathologists, patients, and sample medicines, click below.
              </p>
              <button
                onClick={handleResetData}
                className="py-2.5 px-4 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition"
              >
                Reset Database to Factory Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
