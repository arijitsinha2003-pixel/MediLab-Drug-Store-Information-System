import React, { useState } from 'react';
import {
  Microscope,
  TestTube2,
  FileCheck,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer,
  Edit3,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  Filter,
  BarChart3,
  TrendingUp,
  Activity,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { User, LabOrder, LabTestResult, LabTestCatalogItem, Patient } from '../../types';
import { MediLabStore } from '../../services/storage';

interface PathologistDashboardProps {
  currentUser: User;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onPrintReport: (type: 'lab', data: LabOrder) => void;
  searchQuery: string;
}

export const PathologistDashboard: React.FC<PathologistDashboardProps> = ({
  currentUser,
  activeTab,
  onNavigateTab,
  onPrintReport,
  searchQuery,
}) => {
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Result entry modal
  const [selectedRequestForResults, setSelectedRequestForResults] = useState<LabOrder | null>(null);
  const [resultParameters, setResultParameters] = useState<LabTestResult[]>([]);
  const [pathologistComments, setPathologistComments] = useState('');
  const [benchFilter, setBenchFilter] = useState<'All' | 'Urgent' | 'Routine'>('All');

  // New Lab Order Modal
  const [showOrderLabModal, setShowOrderLabModal] = useState(false);
  const [isManualPatient, setIsManualPatient] = useState(false);
  const [newLabData, setNewLabData] = useState({
    patientId: '',
    manualPatientName: '',
    manualPatientAge: 30,
    manualPatientGender: 'Male' as LabOrder['patientGender'],
    testId: '',
    priority: 'Routine' as LabOrder['priority'],
    clinicalNotes: '',
  });

  // Catalog item creation
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [newCatalogItem, setNewCatalogItem] = useState<Omit<LabTestCatalogItem, 'id'>>({
    name: '',
    category: 'Hematology',
    sampleType: 'Whole Blood (EDTA)',
    turnaroundHours: 4,
    price: 45.0,
    parameters: [
      { name: 'Primary Analyte', unit: 'mg/dL', referenceRange: '70 - 100' },
    ],
  });

  const labRequests = MediLabStore.getLabOrders();
  const catalog = MediLabStore.getLabCatalog();
  const patients = MediLabStore.getPatients();

  // Handlers
  const handleOpenEnterResults = (request: LabOrder) => {
    setSelectedRequestForResults(request);
    setPathologistComments(request.pathologistComments || 'Specimen processed adhering to CLIA quality standards.');

    // If existing results, prepopulate; else initialize from catalog
    if (request.results && request.results.length > 0) {
      setResultParameters(request.results);
    } else {
      const catalogItem = catalog.find((c) => c.name === request.testName);
      if (catalogItem && catalogItem.parameters) {
        const initial = catalogItem.parameters.map((p) => ({
          parameter: p.name,
          value: '',
          unit: p.unit,
          referenceRange: p.referenceRange,
          flag: 'Normal' as LabTestResult['flag'],
        }));
        setResultParameters(initial);
      } else {
        setResultParameters([
          {
            parameter: 'Primary Diagnostic Value',
            value: '',
            unit: 'units',
            referenceRange: 'Standard',
            flag: 'Normal',
          },
        ]);
      }
    }
  };

  const handleUpdateSampleStatus = (requestId: string, status: LabOrder['status']) => {
    try {
      MediLabStore.updateLabOrderStatus(requestId, status, currentUser.fullName);
      setFeedback({ text: `Specimen status advanced to: ${status}`, type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleSaveAndVerifyResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForResults) return;

    try {
      // Validate that all values are entered
      const hasEmpty = resultParameters.some((r) => !r.value.trim());
      if (hasEmpty) {
        throw new Error('Please enter values for all investigation parameters.');
      }

      MediLabStore.saveLabResults(
        selectedRequestForResults.id,
        resultParameters,
        pathologistComments,
        currentUser.fullName,
      );

      setFeedback({
        text: `Results verified and official diagnostic report generated for ${selectedRequestForResults.patientName}!`,
        type: 'success',
      });
      setSelectedRequestForResults(null);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newCatalogItem.name.trim()) throw new Error('Test name is required');
      MediLabStore.addLabCatalogItem(newCatalogItem);
      setFeedback({ text: `Investigation '${newCatalogItem.name}' added to catalog!`, type: 'success' });
      setShowNewTestModal(false);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleCreateLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!isManualPatient && !newLabData.patientId) {
        throw new Error('Please select a patient.');
      }
      if (isManualPatient && !newLabData.manualPatientName.trim()) {
        throw new Error('Please enter the patient name.');
      }
      if (!newLabData.testId) {
        throw new Error('Please select a laboratory test.');
      }

      MediLabStore.createLabOrder({
        patientId: isManualPatient ? undefined : newLabData.patientId,
        manualPatient: isManualPatient ? {
          fullName: newLabData.manualPatientName,
          age: newLabData.manualPatientAge,
          gender: newLabData.manualPatientGender,
        } : undefined,
        doctorId: currentUser.id, // Using current user as requestor (Pathologist in this case)
        doctorName: `Dr. ${currentUser.fullName} (Pathology)`,
        testId: newLabData.testId,
        priority: newLabData.priority,
        clinicalNotes: newLabData.clinicalNotes,
      });

      setFeedback({ text: 'Laboratory investigation request generated successfully!', type: 'success' });
      setShowOrderLabModal(false);
      setNewLabData({ 
        patientId: '', 
        manualPatientName: '',
        manualPatientAge: 30,
        manualPatientGender: 'Male',
        testId: '', 
        priority: 'Routine', 
        clinicalNotes: '' 
      });
      setIsManualPatient(false);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  // Filter requests
  const filteredRequests = labRequests.filter((r) => {
    return (
      !searchQuery ||
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const pendingRequests = filteredRequests
    .filter((r) => ['Ordered', 'Pending', 'Sample Collected', 'In Analysis', 'Processing'].includes(r.status))
    .filter((r) => {
      if (benchFilter === 'Urgent') return r.priority === 'Urgent' || r.priority === 'STAT (Emergency)';
      if (benchFilter === 'Routine') return r.priority === 'Routine';
      return true;
    })
    .sort((a, b) => {
      const priorityMap: Record<string, number> = { 'STAT (Emergency)': 2, 'Urgent': 1, 'Routine': 0 };
      const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      // Secondary sort by date
      return new Date(a.orderedDate).getTime() - new Date(b.orderedDate).getTime();
    });

  const verifiedReports = filteredRequests.filter((r) => r.status === 'Verified' || r.status === 'Result Ready');

  // Chart Data
  const chartData = [
    {
      name: 'Pending',
      value: labRequests.filter((r) => ['Ordered', 'Pending', 'Sample Collected', 'In Analysis', 'Processing'].includes(r.status)).length,
      color: '#f59e0b', // amber-500
    },
    {
      name: 'Done',
      value: labRequests.filter((r) => r.status === 'Result Ready').length,
      color: '#3b82f6', // blue-500
    },
    {
      name: 'Verified',
      value: labRequests.filter((r) => r.status === 'Verified').length,
      color: '#10b981', // emerald-500
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            Dismiss
          </button>
        </div>
      )}

      {/* Pathologist Header Profile */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=128&q=80'}
            alt={currentUser.fullName}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{currentUser.fullName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Consultant Pathologist
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Clinical Pathology &amp; Diagnostic Core • Credential Code: <span className="font-mono text-teal-300 font-bold">{currentUser.uniqueCode}</span>
            </p>
          </div>
        </div>

        {/* Quick Lab Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowOrderLabModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            New Lab Order
          </button>
          <button
            onClick={() => onNavigateTab('test-catalog')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 flex items-center gap-1.5 shadow-sm transition border border-white/20"
          >
            <Microscope className="w-4 h-4" />
            Test Catalog
          </button>
        </div>
      </div>

      {/* VIEW: LAB OVERVIEW */}
      {(activeTab === 'overview' || !activeTab) && (
        <>
          {/* Diagnostic Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending In Queue</div>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">{pendingRequests.length}</div>
                <div className="flex items-center gap-1 text-[10px] text-amber-600 font-medium mt-1">
                  <Activity className="w-3 h-3" />
                  <span>Specimens awaiting run</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Analysis</div>
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  {labRequests.filter((r) => r.status === 'In Analysis').length}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium mt-1">
                  <Microscope className="w-3 h-3" />
                  <span>On analyzer bench</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Reports</div>
                  <FileCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">
                  {labRequests.filter((r) => r.status === 'Verified').length}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Pathologist approved</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Menu</div>
                  <ClipboardList className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">{catalog.length}</div>
                <div className="flex items-center gap-1 text-[10px] text-teal-600 font-medium mt-1">
                  <Users className="w-3 h-3" />
                  <span>Validated assays</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Analytics Chart */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  Diagnostic Workflow Volume
                </h4>
              </div>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-around text-[10px] font-bold uppercase tracking-tight text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Done</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Diagnostic Bench Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Urgent &amp; Routine Diagnostic Bench Queue</h3>
                <p className="text-xs text-slate-400">Specimens ready for parameter observation, quantification, and sign-off</p>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  onClick={() => setBenchFilter('All')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    benchFilter === 'All' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  All ({labRequests.filter(r => ['Ordered', 'Pending', 'Sample Collected', 'In Analysis', 'Processing'].includes(r.status)).length})
                </button>
                <button
                  onClick={() => setBenchFilter('Urgent')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                    benchFilter === 'Urgent' ? 'bg-white text-rose-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <AlertCircle className="w-3 h-3" />
                  Urgent ({labRequests.filter(r => ['Ordered', 'Pending', 'Sample Collected', 'In Analysis', 'Processing'].includes(r.status) && (r.priority === 'Urgent' || r.priority === 'STAT (Emergency)')).length})
                </button>
                <button
                  onClick={() => setBenchFilter('Routine')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                    benchFilter === 'Routine' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Routine ({labRequests.filter(r => ['Ordered', 'Pending', 'Sample Collected', 'In Analysis', 'Processing'].includes(r.status) && r.priority === 'Routine').length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Patient Details</th>
                    <th className="p-3.5">Investigation</th>
                    <th className="p-3.5">Specimen Type</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Current Stage</th>
                    <th className="p-3.5 text-right">Pathology Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-teal-700">{req.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{req.patientName}</div>
                        <div className="text-[11px] text-slate-400">
                          {req.patientAge}y • {req.patientGender} • Dr: {req.doctorName}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{req.testName}</div>
                        <div className="text-[10px] text-slate-500">{req.testCategory}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">{req.sampleType}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.priority === 'STAT (Emergency)'
                              ? 'bg-rose-100 text-rose-800 animate-pulse font-extrabold'
                              : req.priority === 'Urgent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        {(req.status === 'Ordered' || req.status === 'Pending') && (
                          <button
                            onClick={() => handleUpdateSampleStatus(req.id, 'Sample Collected')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                          >
                            Collect Sample
                          </button>
                        )}
                        {req.status === 'Sample Collected' && (
                          <button
                            onClick={() => handleUpdateSampleStatus(req.id, 'Processing')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                          >
                            Load to Analyzer
                          </button>
                        )}
                        {req.status === 'Processing' && (
                          <button
                            onClick={() => handleUpdateSampleStatus(req.id, 'In Analysis')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                          >
                            Start Analysis
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEnterResults(req)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            req.status === 'In Analysis' 
                              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                          disabled={req.status !== 'In Analysis'}
                        >
                          Enter &amp; Verify Results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW: SAMPLE TRACKING WORKFLOW */}
      {activeTab === 'sample-tracking' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Laboratory Specimen Tracking Pipeline</h3>
            <p className="text-xs text-slate-400">Step-by-step diagnostic chain of custody and lifecycle tracking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1: Ordered */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">1. Order Placed</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {labRequests.filter((r) => r.status === 'Ordered' || r.status === 'Pending').length}
                </span>
              </div>
              <div className="space-y-2">
                {labRequests
                  .filter((r) => r.status === 'Ordered' || r.status === 'Pending')
                  .map((r) => (
                    <div key={r.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{r.patientName}</div>
                      <div className="text-slate-500 text-[11px]">{r.testName}</div>
                      <button
                        onClick={() => handleUpdateSampleStatus(r.id, 'Sample Collected')}
                        className="w-full mt-2 py-1 bg-teal-50 text-teal-700 font-semibold rounded border border-teal-200 hover:bg-teal-100"
                      >
                        Accept Specimen &rarr;
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Step 2: Collected */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">2. Specimen Collected</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {labRequests.filter((r) => r.status === 'Sample Collected').length}
                </span>
              </div>
              <div className="space-y-2">
                {labRequests
                  .filter((r) => r.status === 'Sample Collected')
                  .map((r) => (
                    <div key={r.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{r.patientName}</div>
                      <div className="text-slate-500 text-[11px]">{r.sampleType}</div>
                      <button
                        onClick={() => handleUpdateSampleStatus(r.id, 'In Analysis')}
                        className="w-full mt-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded border border-blue-200 hover:bg-blue-100"
                      >
                        Load onto Analyzer &rarr;
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Step 3: In Analysis */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">3. In Analysis</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {labRequests.filter((r) => r.status === 'In Analysis').length}
                </span>
              </div>
              <div className="space-y-2">
                {labRequests
                  .filter((r) => r.status === 'In Analysis')
                  .map((r) => (
                    <div key={r.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{r.patientName}</div>
                      <div className="text-slate-500 text-[11px]">{r.testName}</div>
                      <button
                        onClick={() => handleOpenEnterResults(r)}
                        className="w-full mt-2 py-1 bg-amber-50 text-amber-800 font-semibold rounded border border-amber-200 hover:bg-amber-100"
                      >
                        Record Results &rarr;
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Step 4: Verified */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase">4. Verified &amp; Signed</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {labRequests.filter((r) => r.status === 'Verified').length}
                </span>
              </div>
              <div className="space-y-2">
                {labRequests
                  .filter((r) => r.status === 'Verified')
                  .slice(0, 5)
                  .map((r) => (
                    <div key={r.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{r.patientName}</div>
                      <div className="text-slate-500 text-[11px]">{r.testName}</div>
                      <button
                        onClick={() => onPrintReport('lab', r)}
                        className="w-full mt-2 py-1 bg-emerald-50 text-emerald-800 font-semibold rounded border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Print Report
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: VERIFIED LAB REPORTS */}
      {activeTab === 'lab-reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Signed Clinical Pathology Reports</h3>
              <p className="text-xs text-slate-400">Official reports available to doctors and printable for patients</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Report ID</th>
                  <th className="p-3.5">Patient</th>
                  <th className="p-3.5">Test Conducted</th>
                  <th className="p-3.5">Parameters Recorded</th>
                  <th className="p-3.5">Sign-off Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verifiedReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-teal-700">{r.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.patientName}</td>
                    <td className="p-3.5 text-slate-800 font-semibold">{r.testName}</td>
                    <td className="p-3.5 text-slate-600">{r.results?.length || 0} Analyte(s)</td>
                    <td className="p-3.5 text-slate-500">
                      {r.verifiedDate ? new Date(r.verifiedDate).toLocaleDateString() : 'Today'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onPrintReport('lab', r)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 flex items-center gap-1 ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Official Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: PENDING LAB ORDERS */}
      {activeTab === 'lab-orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pending Clinical Lab Orders</h3>
              <p className="text-xs text-slate-400">All outstanding diagnostic investigations in the current worklist</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Investigation</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Order Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-teal-700">{r.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{r.patientName}</div>
                      <div className="text-[10px] text-slate-400">{r.patientAge}y • {r.patientGender}</div>
                    </td>
                    <td className="p-3.5 text-slate-800 font-semibold">{r.testName}</td>
                    <td className="p-3.5">
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.priority === 'STAT (Emergency)' ? 'bg-rose-100 text-rose-800' : 
                        r.priority === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(r.orderedDate).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onNavigateTab('overview')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                      >
                        View in Queue
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      No pending laboratory orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: TEST CATALOG */}
      {activeTab === 'test-catalog' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Laboratory Assay Catalog &amp; Reference Ranges</h3>
              <p className="text-xs text-slate-400">Standardized reference intervals, sample vials, and pricing</p>
            </div>
            <button
              onClick={() => setShowNewTestModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Test to Menu
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Assay Name</th>
                  <th className="p-3.5">Discipline Category</th>
                  <th className="p-3.5">Required Specimen</th>
                  <th className="p-3.5">Turnaround Time</th>
                  <th className="p-3.5">Constituent Parameters</th>
                  <th className="p-3.5 text-right">Fee (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catalog.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900">{t.name}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{t.sampleType}</td>
                    <td className="p-3.5 text-slate-600">{t.turnaroundHours} Hours</td>
                    <td className="p-3.5 text-slate-600 max-w-sm">
                      {(t.parameters || []).map((p) => `${p.name} (${p.referenceRange} ${p.unit})`).join(', ')}
                    </td>
                    <td className="p-3.5 text-right font-bold text-teal-800">₹{t.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: NEW LAB ORDER */}
      {showOrderLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Direct Lab Investigation Order</h3>
                <p className="text-xs text-slate-500">Initiate diagnostic tests for patient specimens</p>
              </div>
              <button
                onClick={() => setShowOrderLabModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateLabOrder} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700">Patient Selection *</label>
                  <button
                    type="button"
                    onClick={() => setIsManualPatient(!isManualPatient)}
                    className="text-[10px] font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    {isManualPatient ? 'Switch to Registered List' : 'Manual Patient Entry (Others)'}
                  </button>
                </div>
                
                {!isManualPatient ? (
                  <div className="relative">
                    <select
                      required={!isManualPatient}
                      value={newLabData.patientId}
                      onChange={(e) => setNewLabData({ ...newLabData, patientId: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium appearance-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                    >
                      <option value="">Choose a registered patient...</option>
                      {(patients || []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.fullName} ({p.id} • {p.age}y {p.gender})
                        </option>
                      ))}
                    </select>
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                ) : (
                  <div className="space-y-3 p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                    <div>
                      <label className="block text-[10px] font-bold text-teal-700 mb-1 uppercase tracking-tight">Patient Full Name</label>
                      <input
                        type="text"
                        required={isManualPatient}
                        value={newLabData.manualPatientName}
                        onChange={(e) => setNewLabData({ ...newLabData, manualPatientName: e.target.value })}
                        placeholder="Enter patient's full name"
                        className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-teal-700 mb-1 uppercase tracking-tight">Age (Years)</label>
                        <input
                          type="number"
                          required={isManualPatient}
                          value={newLabData.manualPatientAge}
                          onChange={(e) => setNewLabData({ ...newLabData, manualPatientAge: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-teal-700 mb-1 uppercase tracking-tight">Gender</label>
                        <select
                          required={isManualPatient}
                          value={newLabData.manualPatientGender}
                          onChange={(e) => setNewLabData({ ...newLabData, manualPatientGender: e.target.value as any })}
                          className="w-full px-3 py-2 bg-white border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Investigation / Test *</label>
                <div className="relative">
                  <select
                    required
                    value={newLabData.testId}
                    onChange={(e) => setNewLabData({ ...newLabData, testId: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium appearance-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  >
                    <option value="">Select diagnostic assay...</option>
                    {(catalog || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (₹{t.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  <Microscope className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Priority Level</label>
                  <select
                    value={newLabData.priority}
                    onChange={(e) => setNewLabData({ ...newLabData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="STAT (Emergency)">STAT (Emergency)</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <div className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 italic">
                    TAT: {catalog.find(t => t.id === newLabData.testId)?.turnaroundHours || '--'} hrs
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Clinical Requirements / Notes</label>
                <textarea
                  rows={2}
                  value={newLabData.clinicalNotes}
                  onChange={(e) => setNewLabData({ ...newLabData, clinicalNotes: e.target.value })}
                  placeholder="e.g. Fasting specimen, rule out occult infection..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOrderLabModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-sm shadow-teal-200 transition flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4" />
                  Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENTER TEST RESULTS */}
      {selectedRequestForResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Quantitative Lab Results</h3>
                <p className="text-xs text-slate-500">
                  {selectedRequestForResults.testName} for {selectedRequestForResults.patientName} ({selectedRequestForResults.id})
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestForResults(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAndVerifyResults} className="space-y-4 text-xs">
              <div className="space-y-3">
                {resultParameters.map((param, index) => (
                  <div key={index} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center font-bold text-slate-800">
                      <span>{param.parameter}</span>
                      <span className="text-slate-400 font-normal text-[11px]">
                        Ref: {param.referenceRange} {param.unit}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Observed Value *</label>
                        <input
                          type="text"
                          required
                          value={param.value}
                          onChange={(e) => {
                            const updated = [...resultParameters];
                            updated[index].value = e.target.value;
                            setResultParameters(updated);
                          }}
                          placeholder="e.g. 14.2"
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit</label>
                        <input
                          type="text"
                          value={param.unit}
                          onChange={(e) => {
                            const updated = [...resultParameters];
                            updated[index].unit = e.target.value;
                            setResultParameters(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Clinical Flag</label>
                        <select
                          value={param.flag}
                          onChange={(e) => {
                            const updated = [...resultParameters];
                            updated[index].flag = e.target.value as any;
                            setResultParameters(updated);
                          }}
                          className={`w-full px-3 py-1.5 border rounded-lg font-bold ${
                            param.flag === 'Normal'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                              : param.flag === 'Critical'
                              ? 'border-rose-300 bg-rose-50 text-rose-800'
                              : 'border-amber-300 bg-amber-50 text-amber-800'
                          }`}
                        >
                          <option value="Normal">Normal</option>
                          <option value="High">High</option>
                          <option value="Low">Low</option>
                          <option value="Abnormal">Abnormal</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Consultant Pathologist Impression / Comments</label>
                <textarea
                  rows={3}
                  value={pathologistComments}
                  onChange={(e) => setPathologistComments(e.target.value)}
                  placeholder="Clinical interpretations, follow-up recommendations, or correlation remarks..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequestForResults(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  Sign Off &amp; Verify Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATALOG ITEM */}
      {showNewTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add New Assay to Catalog</h3>
            <p className="text-xs text-slate-500 mb-4">Define test details, sample type, and pricing</p>

            <form onSubmit={handleAddCatalogItem} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={newCatalogItem.name}
                  onChange={(e) => setNewCatalogItem({ ...newCatalogItem, name: e.target.value })}
                  placeholder="e.g. Ferritin &amp; Iron Panel"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCatalogItem.category}
                    onChange={(e) => setNewCatalogItem({ ...newCatalogItem, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Hematology">Hematology</option>
                    <option value="Biochemistry">Biochemistry</option>
                    <option value="Endocrinology">Endocrinology</option>
                    <option value="Microbiology">Microbiology</option>
                    <option value="Immunology">Immunology</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCatalogItem.price}
                    onChange={(e) => setNewCatalogItem({ ...newCatalogItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Specimen Tube Type</label>
                <input
                  type="text"
                  value={newCatalogItem.sampleType}
                  onChange={(e) => setNewCatalogItem({ ...newCatalogItem, sampleType: e.target.value })}
                  placeholder="e.g. Serum (Gold top) or EDTA (Lavender)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewTestModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                >
                  Save to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
