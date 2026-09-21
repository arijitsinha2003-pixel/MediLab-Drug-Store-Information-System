import React, { useState } from 'react';
import {
  Users,
  Calendar,
  FileText,
  TestTube2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  HeartPulse,
  Printer,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Stethoscope,
  Activity,
  AlertTriangle,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { User, Patient, Appointment, Prescription, LabOrder, Medicine, LabTestCatalogItem } from '../../types';
import { MediLabStore } from '../../services/storage';

interface DoctorDashboardProps {
  currentUser: User;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onViewPatient: (patient: Patient) => void;
  onPrintReport: (type: 'lab' | 'rx', data: LabOrder | Prescription) => void;
  searchQuery: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentUser,
  activeTab,
  onNavigateTab,
  onViewPatient,
  onPrintReport,
  searchQuery,
}) => {
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals inside Doctor Dashboard
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showNewRxModal, setShowNewRxModal] = useState(false);
  const [showOrderLabModal, setShowOrderLabModal] = useState(false);
  const [showNewAptModal, setShowNewAptModal] = useState(false);

  // Pre-selected patient for Rx or Lab order
  const [selectedPatientForAction, setSelectedPatientForAction] = useState<Patient | null>(null);

  const patients = MediLabStore.getPatients();
  const allAppointments = MediLabStore.getAppointments();
  const prescriptions = MediLabStore.getPrescriptions();
  const labRequests = MediLabStore.getLabOrders();
  const labCatalog = MediLabStore.getLabCatalog();
  const medicines = MediLabStore.getMedicines();

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Filter appointments for THIS doctor
  const appointments = allAppointments.filter(a => a.doctorId === currentUser.id);

  // Forms State
  const [newPatientData, setNewPatientData] = useState({
    fullName: '',
    age: 35,
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    contact: '',
    email: '',
    address: '',
    bloodGroup: 'O+' as Patient['bloodGroup'],
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: 'Spouse',
  });

  const [newAptData, setNewAptData] = useState({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    reason: '',
  });

  const [newRxData, setNewRxData] = useState<{
    patientId: string;
    diagnosis: string;
    notes: string;
    items: {
      medicineId: string;
      medicineName: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: number;
      instructions: string;
    }[];
  }>({
    patientId: patients[0]?.id || '',
    diagnosis: '',
    notes: '',
    items: [
      {
        medicineId: medicines[0]?.id || '',
        medicineName: medicines[0]?.name || '',
        dosage: '500mg',
        frequency: 'Twice daily after meals',
        duration: '7 days',
        quantity: 14,
        instructions: 'Take with plenty of water',
      },
    ],
  });

  const [newLabData, setNewLabData] = useState({
    patientId: patients[0]?.id || '',
    testId: labCatalog[0]?.id || '',
    priority: 'Routine' as LabOrder['priority'],
    clinicalNotes: '',
  });

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newPatientData.fullName.trim()) throw new Error('Patient full name is required');
      const added = MediLabStore.addPatient({
        fullName: newPatientData.fullName.trim(),
        age: Number(newPatientData.age),
        gender: newPatientData.gender,
        contact: newPatientData.contact.trim(),
        email: newPatientData.email.trim(),
        address: newPatientData.address.trim(),
        bloodGroup: newPatientData.bloodGroup,
        allergies: newPatientData.allergies
          ? newPatientData.allergies.split(',').map((s) => s.trim())
          : ['None Reported'],
        chronicConditions: newPatientData.chronicConditions
          ? newPatientData.chronicConditions.split(',').map((s) => s.trim())
          : ['None Reported'],
        currentMedications: newPatientData.currentMedications
          ? newPatientData.currentMedications.split(',').map((s) => s.trim())
          : ['None'],
        emergencyContact: {
          name: newPatientData.emergencyName.trim() || 'Next of Kin',
          phone: newPatientData.emergencyPhone.trim() || newPatientData.contact,
          relation: newPatientData.emergencyRelation,
        },
        assignedDoctorId: currentUser.id,
        assignedDoctorName: currentUser.fullName,
      });

      setFeedback({ text: `Patient registered successfully: ${added.fullName} (${added.id})`, type: 'success' });
      setShowNewPatientModal(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patient = patients.find((p) => p.id === newRxData.patientId);
      if (!patient) throw new Error('Selected patient not found');
      if (!newRxData.diagnosis.trim()) throw new Error('Clinical diagnosis is required');

      // Allergy Check warning!
      const prescribedDrugs = newRxData.items.map((i) => i.medicineName.toLowerCase());
      const allergicConflicts = patient.allergies.filter((a) =>
        prescribedDrugs.some((d) => d.includes(a.toLowerCase())),
      );
      if (allergicConflicts.length > 0) {
        if (
          !confirm(
            `⚠️ ALLERGY WARNING: Patient is recorded as allergic to ${allergicConflicts.join(
              ', ',
            )}. Are you sure you want to proceed?`,
          )
        ) {
          return;
        }
      }

      const rx = MediLabStore.createPrescription({
        patientId: patient.id,
        patientName: patient.fullName,
        doctorId: currentUser.id,
        doctorName: currentUser.fullName,
        doctorSpecialty: currentUser.departmentOrSpecialty || 'Clinical Physician',
        diagnosis: newRxData.diagnosis,
        items: newRxData.items,
        notes: newRxData.notes,
      });

      setFeedback({
        text: `Prescription ${rx.id} generated and sent to dispensary!`,
        type: 'success',
      });
      setShowNewRxModal(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleCreateLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const req = MediLabStore.createLabOrder({
        patientId: newLabData.patientId,
        doctorId: currentUser.id,
        doctorName: currentUser.fullName,
        testId: newLabData.testId,
        priority: newLabData.priority,
        clinicalNotes: newLabData.clinicalNotes,
      });

      setFeedback({
        text: `Laboratory order ${req.id} submitted for ${req.patientName}!`,
        type: 'success',
      });
      setShowOrderLabModal(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleScheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newAptData.patientId) throw new Error('Please select a patient');
      if (!newAptData.reason.trim()) throw new Error('Clinical reason for appointment is required');

      const patient = patients.find(p => p.id === newAptData.patientId);
      if (!patient) throw new Error('Patient not found');

      MediLabStore.addAppointment({
        patientId: patient.id,
        patientName: patient.fullName,
        doctorId: currentUser.id,
        doctorName: currentUser.fullName,
        department: currentUser.departmentOrSpecialty || 'General Medicine',
        date: newAptData.date,
        time: newAptData.time,
        reason: newAptData.reason,
        status: 'Scheduled',
      });

      setFeedback({ text: `Appointment scheduled for ${patient.fullName} on ${newAptData.date}`, type: 'success' });
      setShowNewAptModal(false);
      setNewAptData({
        patientId: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        reason: '',
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleUpdateAppointment = (id: string, status: Appointment['status']) => {
    MediLabStore.updateAppointmentStatus(id, status);
    setFeedback({ text: `Appointment status updated to ${status}.`, type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Filter lists
  const filteredPatients = patients.filter(
    (p) =>
      !searchQuery ||
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredLabReports = labRequests.filter(
    (l) =>
      !searchQuery ||
      l.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const doctorLabReports = filteredLabReports.filter(l => l.doctorId === currentUser.id);

  const handleDeleteLabOrder = (requestId: string) => {
    if (!confirm('Are you sure you want to delete this lab order? This action cannot be undone.')) return;
    try {
      MediLabStore.deleteLabOrder(requestId);
      setFeedback({ text: 'Lab order deleted successfully.', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleDeletePatient = (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) return;
    try {
      MediLabStore.deletePatient(patientId);
      setFeedback({ text: 'Patient record deleted successfully.', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

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

      {/* Doctor Profile Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=128&q=80'}
            alt={currentUser.fullName}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{currentUser.fullName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Staff Physician
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentUser.departmentOrSpecialty || 'Internal Medicine & Cardiology'} • Unique Code: <span className="font-mono text-teal-300 font-bold">{currentUser.uniqueCode}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('new-patient')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            New Patient
          </button>
          <button
            onClick={() => {
              setSelectedPatientForAction(null);
              setShowNewRxModal(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            Write Prescription
          </button>
          <button
            onClick={() => setShowNewAptModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <Calendar className="w-4 h-4" />
            Schedule Appointment
          </button>
          <button
            onClick={() => {
              setSelectedPatientForAction(null);
              setShowOrderLabModal(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <TestTube2 className="w-4 h-4" />
            Order Lab Test
          </button>
        </div>
      </div>

      {/* VIEW: CLINICAL OVERVIEW */}
      {(activeTab === 'overview' || !activeTab) && (
        <>
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Today's Appointments</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{appointments.length}</div>
              <div className="text-[10px] text-blue-600 font-medium mt-1">2 waiting in lobby</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Assigned Patients</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{patients.length}</div>
              <div className="text-[10px] text-slate-400 mt-1">Under clinical care</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Prescriptions Written</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{prescriptions.length}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">Syncing to dispensary</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Verified Lab Reports</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {labRequests.filter((l) => l.status === 'Verified').length}
              </div>
              <div className="text-[10px] text-teal-600 font-medium mt-1">Ready for review</div>
            </div>
          </div>

          {/* Today's Consultations Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Today's Appointment Consultation Queue</h3>
                <p className="text-xs text-slate-400">Scheduled patients for clinical examination</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">{appointments.length} Consultations</span>
            </div>

            <div className="space-y-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{apt.patientName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            apt.status === 'Waiting'
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : apt.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{apt.time}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">{apt.reason}</div>
                      {apt.vitals && (
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span>BP: <strong className="text-slate-700">{apt.vitals.bloodPressure}</strong></span>
                          <span>HR: <strong className="text-slate-700">{apt.vitals.heartRate} bpm</strong></span>
                          <span>SpO2: <strong className="text-slate-700">{apt.vitals.spo2}%</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {apt.status !== 'Completed' && (
                      <button
                        onClick={() => handleUpdateAppointment(apt.id, 'Completed')}
                        className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      >
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const pat = patients.find((p) => p.id === apt.patientId);
                        if (pat) onViewPatient(pat);
                      }}
                      className="py-1 px-2.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700"
                    >
                      Open EMR Dossier
                    </button>
                  </div>
                </div>
              ))}
              {appointments.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">No appointments found in your queue.</p>
                  <p className="text-xs text-slate-400 mt-1">New appointments will appear here once scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* VIEW: PATIENTS LIST */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Directory &amp; Clinical Records</h3>
              <p className="text-xs text-slate-400">Search and access patient histories, vitals, and diagnostics</p>
            </div>
            <button
              onClick={() => onNavigateTab('new-patient')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5 self-start"
            >
              <Plus className="w-4 h-4" />
              Register Patient
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Patient ID</th>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Age / Sex</th>
                  <th className="p-3.5">Blood Group</th>
                  <th className="p-3.5">Known Allergies</th>
                  <th className="p-3.5">Chronic Conditions</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-teal-700">{p.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{p.fullName}</td>
                    <td className="p-3.5 text-slate-600">{p.age}y • {p.gender}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {p.bloodGroup}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-xs truncate">
                      {p.allergies.join(', ')}
                    </td>
                    <td className="p-3.5 text-slate-700 max-w-xs truncate">
                      {p.chronicConditions.join(', ')}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => onViewPatient(p)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        EMR Dossier
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatientForAction(p);
                          setNewRxData({ ...newRxData, patientId: p.id });
                          setShowNewRxModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                      >
                        ℞ Write Rx
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: REGISTER NEW PATIENT */}
      {activeTab === 'new-patient' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">New Patient Registration</h3>
              <p className="text-xs text-slate-400 mb-6">Enter legal demographics and clinical baseline for new hospital intake</p>

              <form onSubmit={handleRegisterPatient} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Full Patient Name *</label>
                    <input
                      type="text"
                      required
                      value={newPatientData.fullName}
                      onChange={(e) => setNewPatientData({ ...newPatientData, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      value={newPatientData.contact}
                      onChange={(e) => setNewPatientData({ ...newPatientData, contact: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden"
                      placeholder="+91 90000 00000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Age *</label>
                    <input
                      type="number"
                      required
                      value={newPatientData.age}
                      onChange={(e) => setNewPatientData({ ...newPatientData, age: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Gender</label>
                    <select
                      value={newPatientData.gender}
                      onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Blood Group</label>
                    <select
                      value={newPatientData.bloodGroup}
                      onChange={(e) => setNewPatientData({ ...newPatientData, bloodGroup: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Current Address</label>
                  <input
                    type="text"
                    value={newPatientData.address}
                    onChange={(e) => setNewPatientData({ ...newPatientData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden"
                    placeholder="Residential address"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
                  >
                    Complete Registration
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recently Registered (By You)</h4>
              </div>
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {patients.filter(p => p.assignedDoctorId === currentUser.id).sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).map((p) => (
                  <div key={p.id} className="p-4 hover:bg-slate-50 transition group">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.id}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600">{p.age}y / {p.gender}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-600">{p.bloodGroup}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePatient(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                        title="Delete Patient Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {patients.filter(p => p.assignedDoctorId === currentUser.id).length === 0 && (
                  <div className="p-8 text-center text-slate-400 italic text-xs">
                    No recent registrations found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Prescription History &amp; Orders</h3>
              <p className="text-xs text-slate-400">Digital prescriptions transmitted to dispensary</p>
            </div>
            <button
              onClick={() => setShowNewRxModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Write New Rx
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Rx ID</th>
                  <th className="p-3.5">Patient</th>
                  <th className="p-3.5">Diagnosis</th>
                  <th className="p-3.5">Medications Prescribed</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{rx.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{rx.patientName}</td>
                    <td className="p-3.5 text-slate-700">{rx.diagnosis}</td>
                    <td className="p-3.5 text-slate-600">
                      {(rx.items || []).map((i) => `${i.medicineName} (${i.dosage})`).join(', ')}
                    </td>
                    <td className="p-3.5 text-slate-500">{rx.date}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rx.status === 'Dispensed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rx.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onPrintReport('rx', rx)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: LAB REPORTS */}
      {activeTab === 'lab-reports' && (
        <div className="space-y-6">
      {/* Section 1: Active Lab Orders */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Clinical Lab Orders</h3>
                <p className="text-xs text-slate-400">Monitor status of investigations you have ordered</p>
              </div>
              <button
                onClick={() => setShowOrderLabModal(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Order Lab Test
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Patient Name</th>
                    <th className="p-3.5">Test</th>
                    <th className="p-3.5">Priority</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorLabReports.filter(l => l.status !== 'Verified').map((lab) => (
                    <tr key={lab.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-teal-700">{lab.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{lab.patientName}</td>
                      <td className="p-3.5 text-slate-800 font-semibold">{lab.testName}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          lab.priority === 'STAT (Emergency)' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {lab.priority}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          lab.status === 'Ordered' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {lab.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {lab.status === 'Ordered' && (
                          <button
                            onClick={() => handleDeleteLabOrder(lab.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition ml-auto block"
                            title="Cancel/Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {doctorLabReports.filter(l => l.status !== 'Verified').length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                        No pending lab orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Verified Reports */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Verified Clinical Reports</h3>
              <p className="text-xs text-slate-400">Reports signed off by clinical pathology department</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Patient Name</th>
                    <th className="p-3.5">Investigation Test</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Pathologist Sign-off</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorLabReports.filter(l => l.status === 'Verified').map((lab) => (
                    <tr key={lab.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-teal-700">{lab.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{lab.patientName}</td>
                      <td className="p-3.5 text-slate-800 font-semibold">{lab.testName}</td>
                      <td className="p-3.5 text-slate-500">{lab.testCategory}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Verified
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {lab.pathologistName}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => onPrintReport('lab', lab)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 flex items-center gap-1 ml-auto"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                  {doctorLabReports.filter(l => l.status === 'Verified').length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                        No verified reports available for review.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: APPOINTMENT SCHEDULE CALENDAR */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Clinical Consultation Schedule</h3>
                <p className="text-xs text-slate-500">Datewise overview of patient appointments</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-2 rounded-xl hover:bg-slate-200 text-slate-600 transition border border-slate-200 bg-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-sm font-bold text-slate-800 min-w-[140px] text-center">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-2 rounded-xl hover:bg-slate-200 text-slate-600 transition border border-slate-200 bg-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
                <button
                  onClick={() => setShowNewAptModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Book Appointment
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="bg-slate-100 p-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
                {(() => {
                  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                  const days = [];
                  
                  // Empty slots before the 1st of the month
                  for (let i = 0; i < firstDayOfMonth; i++) {
                    days.push(<div key={`empty-${i}`} className="bg-white min-h-[100px] p-2"></div>);
                  }

                  // Day slots
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayAppointments = appointments.filter(a => a.date === dateStr);
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    days.push(
                      <div key={day} className={`bg-white min-h-[120px] p-2 hover:bg-slate-50 transition border-t border-l border-slate-100 group relative`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                            {day}
                          </span>
                          {dayAppointments.length > 0 && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100">
                              {dayAppointments.length} Pts
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 3).map((apt, idx) => (
                            <div key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 truncate font-medium border border-slate-200">
                              {apt.time} - {apt.patientName}
                            </div>
                          ))}
                          {dayAppointments.length > 3 && (
                            <div className="text-[9px] text-slate-400 pl-1 font-medium italic">
                              + {dayAppointments.length - 3} more...
                            </div>
                          )}
                        </div>
                        {/* Quick Action Overlay on Hover */}
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors cursor-pointer flex items-end justify-end p-2 opacity-0 group-hover:opacity-100">
                          <button 
                            onClick={() => {
                              setNewAptData({ ...newAptData, date: dateStr });
                              setShowNewAptModal(true);
                            }}
                            className="p-1 rounded-md bg-white shadow-sm text-blue-600 border border-blue-100 hover:scale-110 transition-transform"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-600"></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Today's Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-50 border border-blue-200"></div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Active Appointments</span>
                </div>
                <div className="ml-auto text-[10px] text-slate-400 font-medium">
                  Total Patients this Month: <span className="text-slate-900 font-bold">
                    {appointments.filter(a => {
                      const d = new Date(a.date);
                      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
                    }).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW PATIENT */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Register New Clinical Patient</h3>
            <p className="text-xs text-slate-500 mb-4">Add patient demographics, baseline vitals and known allergies</p>

            <form onSubmit={handleRegisterPatient} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatientData.fullName}
                    onChange={(e) => setNewPatientData({ ...newPatientData, fullName: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="font-semibold text-slate-700 block mb-1">Current Age *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="120"
                    value={newPatientData.age}
                    onChange={(e) => setNewPatientData({ ...newPatientData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={newPatientData.gender}
                    onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={newPatientData.bloodGroup}
                    onChange={(e) => setNewPatientData({ ...newPatientData, bloodGroup: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newPatientData.contact}
                    onChange={(e) => setNewPatientData({ ...newPatientData, contact: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newPatientData.email}
                    onChange={(e) => setNewPatientData({ ...newPatientData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={newPatientData.address}
                  onChange={(e) => setNewPatientData({ ...newPatientData, address: e.target.value })}
                  placeholder="Street Address, City"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Known Drug &amp; Food Allergies (Comma separated)
                </label>
                <input
                  type="text"
                  value={newPatientData.allergies}
                  onChange={(e) => setNewPatientData({ ...newPatientData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa, Aspirin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chronic Medical Conditions (Comma separated)
                </label>
                <input
                  type="text"
                  value={newPatientData.chronicConditions}
                  onChange={(e) => setNewPatientData({ ...newPatientData, chronicConditions: e.target.value })}
                  placeholder="e.g. Hypertension, Type 2 Diabetes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                >
                  Save Patient Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WRITE PRESCRIPTION */}
      {showNewRxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Generate Digital Prescription (℞)</h3>
            <p className="text-xs text-slate-500 mb-4">Transmit authorized medical prescription to MediLab Dispensary</p>

            <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Patient *</label>
                  <select
                    value={newRxData.patientId}
                    onChange={(e) => setNewRxData({ ...newRxData, patientId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.id}) - {p.bloodGroup}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Clinical Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={newRxData.diagnosis}
                    onChange={(e) => setNewRxData({ ...newRxData, diagnosis: e.target.value })}
                    placeholder="e.g. Acute Pharyngitis &amp; Pyrexia"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Medication Items */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs">Prescribed Medication Item</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Select Drug from Inventory</label>
                    <select
                      value={newRxData.items[0]?.medicineId}
                      onChange={(e) => {
                        const med = medicines.find((m) => m.id === e.target.value);
                        if (med) {
                          setNewRxData({
                            ...newRxData,
                            items: [
                              {
                                ...newRxData.items[0],
                                medicineId: med.id,
                                medicineName: `${med.brandName} (${med.name})`,
                                dosage: med.strength,
                              },
                            ],
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    >
                      {medicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.brandName} - {m.name} ({m.strength}) [Stock: {m.quantity}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Dosage &amp; Frequency</label>
                    <input
                      type="text"
                      value={newRxData.items[0]?.frequency}
                      onChange={(e) => {
                        const items = [...newRxData.items];
                        items[0].frequency = e.target.value;
                        setNewRxData({ ...newRxData, items });
                      }}
                      placeholder="e.g. 1 tab twice daily after food"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Duration &amp; Total Quantity</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newRxData.items[0]?.duration}
                        onChange={(e) => {
                          const items = [...newRxData.items];
                          items[0].duration = e.target.value;
                          setNewRxData({ ...newRxData, items });
                        }}
                        placeholder="7 days"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        value={newRxData.items[0]?.quantity}
                        onChange={(e) => {
                          const items = [...newRxData.items];
                          items[0].quantity = Number(e.target.value);
                          setNewRxData({ ...newRxData, items });
                        }}
                        className="w-20 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Patient Instructions</label>
                    <input
                      type="text"
                      value={newRxData.items[0]?.instructions}
                      onChange={(e) => {
                        const items = [...newRxData.items];
                        items[0].instructions = e.target.value;
                        setNewRxData({ ...newRxData, items });
                      }}
                      placeholder="Drink plenty of warm water, take after food"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Physician Clinical Notes</label>
                <textarea
                  rows={2}
                  value={newRxData.notes}
                  onChange={(e) => setNewRxData({ ...newRxData, notes: e.target.value })}
                  placeholder="Additional diagnostic or follow-up notes for the patient..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewRxModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs"
                >
                  Issue &amp; Transmit Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE APPOINTMENT */}
      {showNewAptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Schedule Appointment</h3>
                  <p className="text-xs text-blue-100">Book a new clinical consultation</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewAptModal(false)}
                className="p-2 rounded-full hover:bg-white/10 transition"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleScheduleAppointment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Patient *</label>
                <div className="relative">
                  <select
                    required
                    value={newAptData.patientId}
                    onChange={(e) => setNewAptData({ ...newAptData, patientId: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.id})
                      </option>
                    ))}
                  </select>
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Date *</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={newAptData.date}
                      onChange={(e) => setNewAptData({ ...newAptData, date: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Time *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM"
                      value={newAptData.time}
                      onChange={(e) => setNewAptData({ ...newAptData, time: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Reason for Visit *</label>
                <textarea
                  required
                  rows={3}
                  value={newAptData.reason}
                  onChange={(e) => setNewAptData({ ...newAptData, reason: e.target.value })}
                  placeholder="Clinical symptoms or follow-up reason..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewAptModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition"
                >
                  Schedule Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER LAB TEST */}
      {showOrderLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Place Diagnostic Laboratory Order</h3>
            <p className="text-xs text-slate-500 mb-4">Select investigation parameters for pathology analysis</p>

            <form onSubmit={handleCreateLabOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Patient *</label>
                <select
                  value={newLabData.patientId}
                  onChange={(e) => setNewLabData({ ...newLabData, patientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.id}) - {p.bloodGroup}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Investigation Test *</label>
                <select
                  value={newLabData.testId}
                  onChange={(e) => setNewLabData({ ...newLabData, testId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  {labCatalog.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category}) - ₹{t.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Priority</label>
                <select
                  value={newLabData.priority}
                  onChange={(e) => setNewLabData({ ...newLabData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                >
                  <option value="Routine">Routine (Standard Turnaround)</option>
                  <option value="Urgent">Urgent (Priority Processing)</option>
                  <option value="STAT (Emergency)">STAT (Immediate Emergency Run)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Indications / Notes</label>
                <textarea
                  rows={2}
                  value={newLabData.clinicalNotes}
                  onChange={(e) => setNewLabData({ ...newLabData, clinicalNotes: e.target.value })}
                  placeholder="Suspected anemia, baseline organ profile, therapy response evaluation..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowOrderLabModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs"
                >
                  Send Order to Pathology Lab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
