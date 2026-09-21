import React, { useState } from 'react';
import { X, Copy, Check, Printer, Shield, Sparkles } from 'lucide-react';
import { User } from '../../types';

interface CredentialCardModalProps {
  user: User;
  onClose: () => void;
}

export const CredentialCardModal: React.FC<CredentialCardModalProps> = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex p-2.5 rounded-xl bg-teal-50 text-teal-600 mb-2 border border-teal-100">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Your Staff Credential Pass</h3>
          <p className="text-xs text-slate-500">MediLab &amp; Drug Store Information System</p>
        </div>

        {/* Digital ID Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-xl p-5 border border-slate-700 shadow-md relative overflow-hidden mb-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-teal-400">STAFF IDENTITY</div>
              <div className="text-base font-bold text-white mt-0.5">{user.fullName}</div>
              <div className="text-xs text-slate-300">{user.departmentOrSpecialty || (user.role || '').toUpperCase()}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {user.role}
            </span>
          </div>

          <div className="bg-black/30 p-3 rounded-lg border border-white/10 text-center">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Unique Login Code
            </div>
            <div className="font-mono text-2xl font-black text-white tracking-widest mt-1 select-all">
              {user.uniqueCode}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] text-slate-400">
            <span>ID: {user.id}</span>
            <span>Issued: {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print ID Slip
          </button>
        </div>
      </div>
    </div>
  );
};
