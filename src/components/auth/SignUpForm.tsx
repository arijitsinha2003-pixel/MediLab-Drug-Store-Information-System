import React, { useState } from 'react';
import { Shield, Stethoscope, Microscope, Pill, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';
import { MediLabStore } from '../../services/storage';

interface SignUpFormProps {
  onSuccess: (fullName: string, role: UserRole, code: string) => void;
  onSwitchToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: 25,
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    address: '',
    role: 'doctor' as UserRole,
    departmentOrSpecialty: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleOptions: { role: UserRole; title: string; icon: React.ReactNode; desc: string; sampleDept: string }[] = [
    {
      role: 'admin',
      title: 'Admin',
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      desc: 'System governance, user audits & hospital config',
      sampleDept: 'Administration & Governance',
    },
    {
      role: 'doctor',
      title: 'Doctor',
      icon: <Stethoscope className="w-5 h-5 text-blue-600" />,
      desc: 'Clinical consults, diagnosis, prescriptions & lab orders',
      sampleDept: 'Cardiology, Pediatrics, General Medicine',
    },
    {
      role: 'pathologist',
      title: 'Pathologist',
      icon: <Microscope className="w-5 h-5 text-teal-600" />,
      desc: 'Specimen processing, diagnostic analysis & report sign-off',
      sampleDept: 'Hematology, Biochemistry, Molecular',
    },
    {
      role: 'dispensary',
      title: 'Dispensary Staff',
      icon: <Pill className="w-5 h-5 text-emerald-600" />,
      desc: 'Prescription dispensing, drug inventory & expiry tracking',
      sampleDept: 'Outpatient Pharmacy, Central Drug Store',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Field Validations
    if (!formData.fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid official healthcare email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (formData.age < 18) {
      setError('Staff must be at least 18 years old.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    try {
      setLoading(true);
      const res = MediLabStore.registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
        address: formData.address,
        password: formData.password,
        role: formData.role,
        departmentOrSpecialty: formData.departmentOrSpecialty,
      });

      onSuccess(formData.fullName, formData.role, res.code);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fadeIn">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selection (Mandatory 4 roles) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Select Staff Role <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {roleOptions.map((opt) => {
            const isSelected = formData.role === opt.role;
            return (
              <button
                key={opt.role}
                type="button"
                id={`role-select-${opt.role}`}
                onClick={() => setFormData({ ...formData, role: opt.role })}
                className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-100'}`}>
                  {opt.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {opt.title}
                    {isSelected && <span className="w-2 h-2 rounded-full bg-teal-500"></span>}
                  </div>
                  <div className="text-xs text-slate-500 leading-tight mt-0.5">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Personal Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Dr. Rajesh Khanna"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Official Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="c.lee@medilab.health"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 019-2834"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Current Age <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            required
            min="18"
            max="100"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Department / Specialty
          </label>
          <input
            type="text"
            value={formData.departmentOrSpecialty}
            onChange={(e) => setFormData({ ...formData, departmentOrSpecialty: e.target.value })}
            placeholder="e.g. Clinical Pathology"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Workstation / Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Main Hospital Wing, Medical Center Plaza"
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        />
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Min 6 characters"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Confirm password"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Notice about unique code generation */}
      <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-start gap-2">
        <UserCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Automated Unique-Code Generation:</span> Upon registration, MediLab will generate your private cryptographic access code (e.g. <span className="font-mono font-bold">MED-7K4P-92XZ</span>). This will be your primary credential for logging into your role dashboard.
        </div>
      </div>

      {/* Submit button */}
      <div className="pt-2">
        <button
          type="submit"
          id="submit-register-btn"
          disabled={loading}
          className="w-full py-3 px-5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
        >
          <span>{loading ? 'Creating Account & Generating Code...' : 'Complete Registration & Get Unique Code'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Already registered?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-teal-600 hover:text-teal-700 underline underline-offset-2"
          >
            Sign in with your Unique Code
          </button>
        </p>
      </div>
    </form>
  );
};
