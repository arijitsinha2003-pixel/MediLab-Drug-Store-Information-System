import React, { useState } from 'react';
import { Copy, Check, ShieldAlert, Download, ArrowRight, Printer, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole } from '../../types';

interface CodeConfirmationModalProps {
  fullName: string;
  role: UserRole;
  uniqueCode: string;
  onProceedToLogin: (role: UserRole, code: string) => void;
}

export const CodeConfirmationModal: React.FC<CodeConfirmationModalProps> = ({
  fullName,
  role,
  uniqueCode,
  onProceedToLogin,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(uniqueCode);
    setCopied(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const roleLabels: Record<UserRole, { title: string; color: string; bg: string }> = {
    admin: { title: 'System Administrator', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    doctor: { title: 'Medical Doctor / Physician', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    pathologist: { title: 'Clinical Pathologist', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
    dispensary: { title: 'Dispensary Pharmacist', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  };

  const roleMeta = roleLabels[role] || roleLabels.doctor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 md:p-8 border border-slate-200 overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-teal-100 rounded-full blur-2xl pointer-events-none opacity-60"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-blue-100 rounded-full blur-2xl pointer-events-none opacity-60"></div>

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-3 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Registration Successful!</h2>
            <p className="text-slate-600 text-sm mt-1">
              Your staff credential account has been created for <span className="font-semibold text-slate-800">{fullName}</span>.
            </p>
          </div>

          {/* Role badge */}
          <div className="flex justify-center mb-5">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${roleMeta.bg} ${roleMeta.color}`}>
              Role: {roleMeta.title}
            </span>
          </div>

          {/* Unique Code Display Box */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 text-white rounded-xl p-5 shadow-lg border border-slate-700 mb-5 text-center relative overflow-hidden">
            <div className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-1 flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Your Primary Security Login Code
            </div>
            <div className="font-mono text-3xl md:text-4xl tracking-wider font-extrabold text-white my-3 select-all py-1 px-3 bg-white/10 rounded-lg inline-block border border-white/10">
              {uniqueCode}
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Valid across all MediLab workstations • Unique to your account
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-6 flex items-start gap-3 text-amber-900 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950 mb-0.5">
                “This is your unique login code. Keep it secure and do not share it with anyone.”
              </p>
              <p className="text-xs text-amber-800">
                You will use this unique code every time you sign in to MediLab. You will not need to enter your full registration info again.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              id="copy-code-btn"
              type="button"
              onClick={handleCopy}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all border ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400 shadow-sm'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Code'}
            </button>

            <button
              id="print-code-btn"
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Print / Save ID Slip
            </button>
          </div>

          {/* Primary Proceed Button */}
          <button
            id="proceed-to-login-btn"
            type="button"
            onClick={() => onProceedToLogin(role, uniqueCode)}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all text-base group"
          >
            <span>Proceed to Login with this Code</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
