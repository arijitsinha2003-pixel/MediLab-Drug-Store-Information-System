import React, { useState } from 'react';
import { X, KeyRound, AlertCircle, CheckCircle2, Copy, Check } from 'lucide-react';
import { MediLabStore } from '../../services/storage';

interface RecoverCodeModalProps {
  onClose: () => void;
  onCodeRecovered: (code: string) => void;
}

export const RecoverCodeModal: React.FC<RecoverCodeModalProps> = ({ onClose, onCodeRecovered }) => {
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [error, setError] = useState('');
  const [recoveredCode, setRecoveredCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (!email.trim() || age === '') {
        setError('Please enter both your registered email address and age.');
        return;
      }
      const code = MediLabStore.recoverCode(email, Number(age));
      setRecoveredCode(code);
    } catch (err: any) {
      setError(err.message || 'Could not verify recovery details.');
    }
  };

  const handleCopy = () => {
    if (recoveredCode) {
      navigator.clipboard.writeText(recoveredCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recover Unique Code</h3>
            <p className="text-xs text-slate-500">Verify your identity with registered credentials</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!recoveredCode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. p.nair@medilab.health"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Registered Age (Security Verification)
              </label>
              <input
                type="number"
                required
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 42"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
              >
                Retrieve Code
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-emerald-800 font-medium">Security verification passed!</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Your registered unique code is:</p>
              <div className="font-mono text-2xl font-black text-teal-800 bg-white border border-teal-200 py-2 px-4 rounded-lg my-3 shadow-inner">
                {recoveredCode}
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <button
              onClick={() => {
                onCodeRecovered(recoveredCode);
                onClose();
              }}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition"
            >
              Use this Code to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
