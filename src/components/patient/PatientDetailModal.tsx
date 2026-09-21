import React, { useState } from 'react';
import { X, User, HeartPulse, AlertOctagon, Pill, FileText, Microscope, Calendar, Phone, MapPin } from 'lucide-react';
import { Patient, Prescription, LabOrder } from '../../types';
import { MediLabStore } from '../../services/storage';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
  onViewPrescription?: (rx: Prescription) => void;
  onViewLabReport?: (lab: LabOrder) => void;
  onNewPrescription?: (patient: Patient) => void;
  onOrderLabTest?: (patient: Patient) => void;
  canEdit?: boolean;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onViewPrescription,
  onViewLabReport,
  onNewPrescription,
  onOrderLabTest,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'prescriptions' | 'labs'>('overview');

  const allPrescriptions = MediLabStore.getPrescriptions().filter((p) => p.patientId === patient.id);
  const allLabOrders = MediLabStore.getLabOrders().filter((l) => l.patientId === patient.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-lg border border-teal-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{patient.fullName}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {patient.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {patient.bloodGroup}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {patient.age} years old • {patient.gender}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Clinical Overview &amp; History
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'prescriptions'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Prescriptions ({allPrescriptions.length})
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'labs'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lab History ({allLabOrders.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 flex-1">
          {activeTab === 'overview' && (
            <>
              {/* Vitals & Critical Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Allergies Box */}
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase mb-2">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    Known Allergies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(patient.allergies || []).map((allergy, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300"
                      >
                        ⚠️ {allergy}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase mb-2">
                    <HeartPulse className="w-4 h-4 text-amber-600" />
                    Chronic Conditions
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(patient.chronicConditions || []).map((cond, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300"
                      >
                        {cond}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current Medications */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase mb-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  Current Active Medications
                </div>
                <div className="flex flex-wrap gap-2">
                  {(patient.currentMedications || []).map((med, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact & Emergency Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 uppercase block mb-1">Contact Details</span>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.contact}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patient.address}</span>
                  </div>
                  {patient.email && (
                    <div className="text-slate-600">Email: {patient.email}</div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 uppercase block mb-1">Emergency Contact</span>
                  <div className="text-slate-700 font-semibold">{patient.emergencyContact.name} ({patient.emergencyContact.relation})</div>
                  <div className="text-slate-600">{patient.emergencyContact.phone}</div>
                  <div className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                    Assigned Doctor: {patient.assignedDoctorName || 'General OPD'}
                  </div>
                </div>
              </div>

              {/* Clinical Actions */}
              <div className="flex gap-3 pt-2">
                {onNewPrescription && (
                  <button
                    onClick={() => onNewPrescription(patient)}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-xs flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Write Digital Prescription</span>
                  </button>
                )}
                {onOrderLabTest && (
                  <button
                    onClick={() => onOrderLabTest(patient)}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center justify-center gap-2"
                  >
                    <Microscope className="w-4 h-4" />
                    <span>Order Laboratory Test</span>
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-3">
              {allPrescriptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No prescriptions recorded for this patient.</div>
              ) : (
                allPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{rx.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rx.status === 'Dispensed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rx.status}
                        </span>
                        <span className="text-xs text-slate-400">{rx.date}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 mt-1">
                        Diagnosis: {rx.diagnosis}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {rx.items.length} item(s) • Dr: {rx.doctorName}
                      </div>
                    </div>
                    {onViewPrescription && (
                      <button
                        onClick={() => onViewPrescription(rx)}
                        className="py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                      >
                        View Slip
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'labs' && (
            <div className="space-y-3">
              {allLabOrders.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No lab tests on record for this patient.</div>
              ) : (
                allLabOrders.map((lab) => (
                  <div
                    key={lab.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{lab.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lab.status === 'Verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lab.status === 'Result Ready'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {lab.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(lab.orderedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">{lab.testName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Category: {lab.testCategory} • Priority: {lab.priority}
                      </div>
                    </div>
                    {onViewLabReport && (
                      <button
                        onClick={() => onViewLabReport(lab)}
                        className="py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                      >
                        View Report
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
