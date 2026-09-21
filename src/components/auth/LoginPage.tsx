import React, { useState } from 'react';
import {
  Shield,
  Stethoscope,
  Microscope,
  Pill,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Activity,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Building2,
  Lock,
} from 'lucide-react';
import { UserRole, User } from '../../types';
import { MediLabStore } from '../../services/storage';
import { SignUpForm } from './SignUpForm';
import { CodeConfirmationModal } from './CodeConfirmationModal';
import { RecoverCodeModal } from './RecoverCodeModal';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [uniqueCodeInput, setUniqueCodeInput] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [newlyRegistered, setNewlyRegistered] = useState<{
    fullName: string;
    role: UserRole;
    code: string;
  } | null>(null);

  // Demo accounts quick-fill helper
  const demoAccounts: { role: UserRole; label: string; code: string; name: string }[] = [
    { role: 'admin', label: 'Admin', code: 'MED-ADMN-2026', name: 'Dr. Arjun Sharma' },
    { role: 'doctor', label: 'Doctor', code: 'MED-DOC1-8842', name: 'Dr. Priya Nair, MD' },
    { role: 'pathologist', label: 'Pathologist', code: 'MED-PATH-4419', name: 'Dr. Vikram Malhotra, MD' },
    { role: 'dispensary', label: 'Dispensary', code: 'MED-DISP-9130', name: 'Sangeeta Gupta, B.Pharm' },
  ];

  const handleApplyDemo = (demo: typeof demoAccounts[0]) => {
    setSelectedRole(demo.role);
    setUniqueCodeInput(demo.code);
    setErrorMessage('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!uniqueCodeInput.trim()) {
      setErrorMessage('Please enter your unique login code (e.g. MED-XXXX-XXXX).');
      return;
    }

    try {
      setLoading(true);
      const { user } = MediLabStore.loginWithUniqueCode(selectedRole, uniqueCodeInput);
      onLoginSuccess(user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify role and code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    // Allow user to type easily, auto format if needed or keep text clean
    setUniqueCodeInput(val);
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-3 sm:p-6 md:p-8">
      {/* Outer Card / Split Container */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] border border-slate-200">
        
        {/* ================= LEFT SIDE: Medical Hero Illustration / Brand Story ================= */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-slate-900 via-teal-950 to-blue-950 text-white p-8 md:p-10 flex flex-col justify-between overflow-hidden">
          {/* Background Medical Visual Elements & High-Quality Photo */}
          <div className="absolute inset-0 opacity-25 mix-blend-luminosity">
            <img
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"
              alt="Medical and Laboratory Environment"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-teal-900/40"></div>

          {/* Top Branding on Left */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-6">
              <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
              <span>Next-Gen Clinical Healthcare</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Smart Healthcare Management Starts Here.
            </h1>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-sm">
              Connecting doctors, clinical diagnostic laboratories, and pharmacy dispensaries in one real-time, HIPAA-compliant ecosystem.
            </p>
          </div>

          {/* Feature Highlights on Left */}
          <div className="relative z-10 my-8 space-y-3.5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Doctor Clinical Workspace</h4>
                <p className="text-[11px] text-slate-300">Instant EMR, e-prescriptions & live test ordering</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <Microscope className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Pathology & Lab Diagnostics</h4>
                <p className="text-[11px] text-slate-300">Specimen tracking, reference ranges & digital sign-off</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Pill className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Drug Store & Automated Alerts</h4>
                <p className="text-[11px] text-slate-300">Batch tracking, near-expiry & low stock warnings</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Cryptographic Unique-Code Auth</h4>
                <p className="text-[11px] text-slate-300">Unguessable high-entropy staff credentials</p>
              </div>
            </div>
          </div>

          {/* Left Footer Badges */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-400">
            <span>MediLab Core v2.6.4</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              All Services Operational
            </span>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Authentication Engine ================= */}
        <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white overflow-y-auto max-h-[90vh]">
          <div>
            {/* System Title Header */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                    MediLab
                    <span className="text-teal-600 font-semibold ml-1.5 text-base">&amp; Drug Store</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Integrated Healthcare, Laboratory &amp; Pharmacy Management System
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Selector: Sign In vs Sign Up */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200/80">
              <button
                type="button"
                id="tab-login"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'login'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4 text-teal-600" />
                <span>Sign In / Login</span>
              </button>

              <button
                type="button"
                id="tab-signup"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Sign Up / First-Time Registration</span>
              </button>
            </div>

            {/* TAB 1: UNIQUE-CODE LOGIN */}
            {activeTab === 'login' ? (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Login to MediLab</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your authorized staff role and enter your unique security credential code.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                    <span className="font-medium">{errorMessage}</span>
                  </div>
                )}

                {/* Role Selector Cards */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Login As <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Admin */}
                    <button
                      type="button"
                      id="login-role-admin"
                      onClick={() => setSelectedRole('admin')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        selectedRole === 'admin'
                          ? 'border-purple-500 bg-purple-50/70 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold">Admin</span>
                    </button>

                    {/* Doctor */}
                    <button
                      type="button"
                      id="login-role-doctor"
                      onClick={() => setSelectedRole('doctor')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        selectedRole === 'doctor'
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedRole === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold">Doctor</span>
                    </button>

                    {/* Pathologist */}
                    <button
                      type="button"
                      id="login-role-pathologist"
                      onClick={() => setSelectedRole('pathologist')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        selectedRole === 'pathologist'
                          ? 'border-teal-500 bg-teal-50/70 text-teal-900 ring-2 ring-teal-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedRole === 'pathologist' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Microscope className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold">Pathologist</span>
                    </button>

                    {/* Dispensary Staff */}
                    <button
                      type="button"
                      id="login-role-dispensary"
                      onClick={() => setSelectedRole('dispensary')}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        selectedRole === 'dispensary'
                          ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedRole === 'dispensary' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        <Pill className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold">Dispensary</span>
                    </button>
                  </div>
                </div>

                {/* Unique Code Input Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Enter Your Unique Login Code <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">Format: MED-XXXX-XXXX</span>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-5 h-5 text-teal-600" />
                      </div>
                      <input
                        type={showCode ? 'text' : 'password'}
                        id="unique-code-input"
                        required
                        value={uniqueCodeInput}
                        onChange={handleCodeInputChange}
                        placeholder="MED-7K4P-92XZ"
                        autoComplete="off"
                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-base font-bold tracking-wider text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition uppercase shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCode(!showCode)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        title={showCode ? 'Hide code' : 'Show code'}
                      >
                        {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Login Button */}
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={loading}
                    className="w-full py-3 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 via-teal-700 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    <span>{loading ? 'Authenticating Unique Code...' : 'Login to System'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Quick Helper Links */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRecoverModal(true)}
                    className="text-teal-700 hover:text-teal-800 font-medium flex items-center gap-1 hover:underline"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Need help recovering your code?</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('signup')}
                    className="text-slate-600 hover:text-slate-900 font-medium"
                  >
                    New user? <span className="font-bold text-blue-600">Sign Up</span>
                  </button>
                </div>

                {/* Demo Accounts Bar (Convenience for testing all 4 roles) */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Instant Demo Role Access (1-Click Fill)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {demoAccounts.map((demo) => (
                      <button
                        key={demo.role}
                        type="button"
                        onClick={() => handleApplyDemo(demo)}
                        className="py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-teal-400 bg-slate-50/80 hover:bg-teal-50/50 text-left transition-all text-xs group"
                      >
                        <div className="font-bold text-slate-800 group-hover:text-teal-700 flex items-center justify-between">
                          <span>{demo.label}</span>
                          <span className="text-[10px] text-teal-600 font-mono">Fill</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{demo.code}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: SIGN UP / FIRST TIME REGISTRATION */
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900">First-Time Registration</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Register your staff profile to receive your personalized, unguessable MediLab login code.
                  </p>
                </div>

                <SignUpForm
                  onSuccess={(fullName, role, code) => {
                    setNewlyRegistered({ fullName, role, code });
                  }}
                  onSwitchToLogin={() => setActiveTab('login')}
                />
              </div>
            )}
          </div>

          {/* System Footer Note */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              <span>Protected by RBAC &amp; Unique Cryptographic Credential Code</span>
            </div>
            <div className="text-[11px]">HIPAA &amp; HL7 Standard Aligned</div>
          </div>
        </div>
      </div>

      {/* Code Confirmation Modal on New Registration */}
      {newlyRegistered && (
        <CodeConfirmationModal
          fullName={newlyRegistered.fullName}
          role={newlyRegistered.role}
          uniqueCode={newlyRegistered.code}
          onProceedToLogin={(role, code) => {
            setSelectedRole(role);
            setUniqueCodeInput(code);
            setNewlyRegistered(null);
            setActiveTab('login');
          }}
        />
      )}

      {/* Recover Code Modal */}
      {showRecoverModal && (
        <RecoverCodeModal
          onClose={() => setShowRecoverModal(false)}
          onCodeRecovered={(code) => {
            setUniqueCodeInput(code);
            setShowRecoverModal(false);
          }}
        />
      )}
    </div>
  );
};
