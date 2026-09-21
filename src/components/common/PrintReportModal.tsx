import React from 'react';
import { X, Printer, Download, Building2, CheckCircle2 } from 'lucide-react';
import { LabOrder, Prescription, Invoice } from '../../types';

interface PrintReportModalProps {
  type: 'lab' | 'rx' | 'invoice';
  data: LabOrder | Prescription | Invoice;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({ type, data, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Top bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {type === 'lab' && 'Official Diagnostic Laboratory Report'}
              {type === 'rx' && 'Official Digital Prescription Form'}
              {type === 'invoice' && 'Pharmacy Dispensing Bill & Invoice'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content (Formatted like clinical document) */}
        <div className="p-8 overflow-y-auto font-sans text-slate-800 bg-white" id="printable-area">
          {/* Header */}
          <div className="border-b-2 border-teal-600 pb-5 mb-6 flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Aarogya MediLab &amp; Drug Store
                </h1>
                <p className="text-xs text-slate-500">
                  452, Medical Enclave, Sector 15, Gurgaon, Haryana • Phone: +91 98765 43210
                </p>
                <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                  Accredited Clinical Pathology &amp; Pharmacy Department • CAP / CLIA Certified
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {(data as any).id}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* 1. LAB REPORT VIEW */}
          {type === 'lab' && (() => {
            const lab = data as LabOrder;
            return (
              <div className="space-y-6">
                {/* Patient / Specimen Box */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Patient Name</span>
                    <span className="font-bold text-slate-900 text-sm">{lab.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Patient ID / Age / Sex</span>
                    <span className="font-semibold text-slate-800">{lab.patientId} • {lab.patientAge}y • {lab.patientGender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Ordering Physician</span>
                    <span className="font-semibold text-slate-800">{lab.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Specimen Type / Priority</span>
                    <span className="font-semibold text-slate-800">{lab.sampleType} • {lab.priority}</span>
                  </div>
                </div>

                {/* Test details */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">{lab.testName}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      {lab.testCategory}
                    </span>
                  </div>

                  {lab.results && lab.results.length > 0 ? (
                    <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Investigation Parameter</th>
                          <th className="p-2.5">Observed Value</th>
                          <th className="p-2.5">Unit</th>
                          <th className="p-2.5">Biological Reference Interval</th>
                          <th className="p-2.5 text-center">Status Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(lab.results || []).map((r, i) => (
                          <tr key={i} className={r.flag !== 'Normal' ? 'bg-amber-50/40' : ''}>
                            <td className="p-2.5 font-medium text-slate-900">{r.parameter}</td>
                            <td className="p-2.5 font-mono font-bold text-slate-900">{r.value}</td>
                            <td className="p-2.5 text-slate-600">{r.unit}</td>
                            <td className="p-2.5 text-slate-600">{r.referenceRange}</td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  r.flag === 'Normal'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : r.flag === 'Critical'
                                    ? 'bg-rose-100 text-rose-800 font-extrabold animate-pulse'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {r.flag}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                      Sample in process. Quantitative results pending recording.
                    </div>
                  )}
                </div>

                {lab.pathologistComments && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">Pathologist's Clinical Impression:</span>
                    <p className="text-slate-600 leading-relaxed">{lab.pathologistComments}</p>
                  </div>
                )}

                {/* Signature Block */}
                <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                  <div>
                    <p>Status: <span className="font-bold text-teal-700 uppercase">{lab.status}</span></p>
                    <p>Verified: {lab.verifiedDate ? new Date(lab.verifiedDate).toLocaleString() : 'Pending Sign-off'}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic text-base text-slate-800 font-bold mb-1">
                      {lab.pathologistName || 'Dr. Vikram Malhotra, MD'}
                    </div>
                    <div className="border-t border-slate-300 pt-1 text-[11px] text-slate-600">
                      Consultant Clinical Pathologist &amp; Lab Director
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 2. PRESCRIPTION VIEW */}
          {type === 'rx' && (() => {
            const rx = data as Prescription;
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Patient Name</span>
                    <span className="font-bold text-slate-900 text-sm">{rx.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Patient ID</span>
                    <span className="font-semibold text-slate-800">{rx.patientId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Prescribing Doctor</span>
                    <span className="font-semibold text-slate-800">{rx.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Specialty</span>
                    <span className="font-semibold text-slate-800">{rx.doctorSpecialty}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs">
                  <span className="font-bold text-blue-900">Clinical Diagnosis: </span>
                  <span className="text-blue-800">{rx.diagnosis}</span>
                </div>

                <div>
                  <div className="text-2xl font-serif font-black text-slate-800 mb-3">℞</div>
                  <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Medication &amp; Strength</th>
                        <th className="p-2.5">Dosage &amp; Frequency</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Qty</th>
                        <th className="p-2.5">Specific Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(rx.items || []).map((item, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-bold text-slate-900">{item.medicineName}</td>
                          <td className="p-2.5 text-slate-700">{item.dosage} • {item.frequency}</td>
                          <td className="p-2.5 text-slate-700">{item.duration}</td>
                          <td className="p-2.5 font-bold text-slate-800">{item.quantity}</td>
                          <td className="p-2.5 text-slate-600 italic">{item.instructions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rx.notes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700">Doctor Notes: </span>
                    {rx.notes}
                  </div>
                )}

                <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                  <div>
                    <p>Status: <span className="font-bold text-emerald-700">{rx.status}</span></p>
                    {rx.dispensedBy && <p>Dispensed by: {rx.dispensedBy}</p>}
                  </div>
                  <div className="text-right">
                    <div className="font-serif italic text-base text-slate-800 font-bold mb-1">
                      {rx.doctorName}
                    </div>
                    <div className="border-t border-slate-300 pt-1 text-[11px] text-slate-600">
                      Authorized Medical Practitioner Digital Signature
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 3. INVOICE VIEW */}
          {type === 'invoice' && (() => {
            const inv = data as Invoice;
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Billed To</span>
                    <span className="font-bold text-slate-900 text-sm">{inv.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Invoice ID</span>
                    <span className="font-semibold text-slate-800">{inv.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Payment Method</span>
                    <span className="font-semibold text-slate-800">{inv.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Pharmacist</span>
                    <span className="font-semibold text-slate-800">{inv.dispensedBy}</span>
                  </div>
                </div>

                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(inv.items || []).map((item, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-medium text-slate-900">{item.medicineName}</td>
                        <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                        <td className="p-2.5 text-right">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-64 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium text-slate-900">₹{inv.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Healthcare Tax (5%):</span>
                      <span className="font-medium text-slate-900">₹{inv.tax.toFixed(2)}</span>
                    </div>
                    {inv.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Insurance Discount:</span>
                        <span className="font-medium">-₹{inv.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                      <span>Total Paid:</span>
                      <span className="text-teal-700">₹{inv.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                  Thank you for choosing MediLab Dispensary. For drug queries, consult our pharmacist helpline.
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
