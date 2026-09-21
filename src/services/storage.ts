import {
  User,
  UserRole,
  UniqueLoginCode,
  Patient,
  Appointment,
  Prescription,
  LabTestCatalogItem,
  LabOrder,
  LabStatus,
  LabResultItem,
  Medicine,
  Invoice,
  Notification,
  ActivityLog,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'medilab_users_v3',
  CODES: 'medilab_unique_codes_v3',
  PATIENTS: 'medilab_patients_v3',
  APPOINTMENTS: 'medilab_appointments_v3',
  PRESCRIPTIONS: 'medilab_prescriptions_v3',
  LAB_CATALOG: 'medilab_lab_catalog_v3',
  LAB_REQUESTS: 'medilab_lab_requests_v3',
  MEDICINES: 'medilab_medicines_v3',
  INVOICES: 'medilab_invoices_v3',
  NOTIFICATIONS: 'medilab_notifications_v3',
  LOGS: 'medilab_activity_logs_v3',
  ACTIVE_SESSION: 'medilab_session_v3',
};

// Generate an unguessable high-entropy code formatted as MED-XXXX-XXXX
export function generateUniqueLoginCode(): string {
  // Safe characters (excluding 0, O, 1, I to eliminate human reading confusion)
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const getRandomChars = (len: number) => {
    let result = '';
    const array = new Uint8Array(len);
    crypto.getRandomValues(array);
    for (let i = 0; i < len; i++) {
      result += charset[array[i] % charset.length];
    }
    return result;
  };

  return `MED-${getRandomChars(4)}-${getRandomChars(4)}`;
}

// Simple hash simulation for demo security
export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

// Initial Seed Data
const SEED_USERS: User[] = [
  {
    id: 'USR-ADMIN-01',
    fullName: 'Dr. Arjun Sharma',
    email: 'admin@medilab.health',
    phone: '+91 98765 43210',
    age: 48,
    gender: 'Male',
    address: '452, Medical Enclave, Sector 15, Gurgaon, Haryana',
    role: 'admin',
    departmentOrSpecialty: 'Hospital Administration & Governance',
    passwordHash: hashString('admin123'),
    uniqueCode: 'MED-ADMN-2026',
    uniqueCodeId: 'CODE-ADM-01',
    isActive: true,
    isCodeRevoked: false,
    createdAt: '2025-01-10T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'USR-DOC-01',
    fullName: 'Dr. Priya Nair, MD',
    email: 'p.nair@medilab.health',
    phone: '+91 99887 76655',
    age: 42,
    gender: 'Female',
    address: 'Flat 402, Lotus Residency, Powai, Mumbai',
    role: 'doctor',
    departmentOrSpecialty: 'Cardiology & Internal Medicine',
    passwordHash: hashString('doctor123'),
    uniqueCode: 'MED-DOC1-8842',
    uniqueCodeId: 'CODE-DOC-01',
    isActive: true,
    isCodeRevoked: false,
    createdAt: '2025-01-15T09:30:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'USR-DOC-02',
    fullName: 'Dr. Rahul Verma',
    email: 'r.verma@medilab.health',
    phone: '+91 98221 12233',
    age: 38,
    gender: 'Male',
    address: 'Sector 4, Dwarka, New Delhi',
    role: 'doctor',
    departmentOrSpecialty: 'General Medicine & Family Practice',
    passwordHash: hashString('doctor123'),
    uniqueCode: 'MED-DOC2-1122',
    uniqueCodeId: 'CODE-DOC-02',
    isActive: true,
    isCodeRevoked: false,
    createdAt: '2025-03-01T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'USR-DOC-03',
    fullName: 'Dr. Ananya Iyer',
    email: 'a.iyer@medilab.health',
    phone: '+91 91223 34455',
    age: 35,
    gender: 'Female',
    address: 'Indiranagar, Bangalore, Karnataka',
    role: 'doctor',
    departmentOrSpecialty: 'Pediatrics & Neonatology',
    passwordHash: hashString('doctor123'),
    uniqueCode: 'MED-DOC3-3344',
    uniqueCodeId: 'CODE-DOC-03',
    isActive: true,
    isCodeRevoked: false,
    createdAt: '2025-03-10T09:00:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1594824813573-5802346ed71c?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'USR-DOC-04',
    fullName: 'Dr. Sanjay Dutt',
    email: 's.dutt@medilab.health',
    phone: '+91 94455 66778',
    age: 52,
    gender: 'Male',
    address: 'Jubilee Hills, Hyderabad',
    role: 'doctor',
    departmentOrSpecialty: 'Orthopedics & Sports Medicine',
    passwordHash: hashString('doctor123'),
    uniqueCode: 'MED-DOC4-5566',
    uniqueCodeId: 'CODE-DOC-04',
    isActive: true,
    isCodeRevoked: false,
    createdAt: '2025-04-01T11:00:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'USR-PATH-01',
    fullName: 'Dr. Vikram Malhotra, MD',
    email: 'v.malhotra@medilab.health',
    phone: '+91 91234 56789',
    age: 44,
    gender: 'Male',
    address: '12 Lab Tech Parkway, Whitefield, Bangalore',
    role: 'pathologist',
    departmentOrSpecialty: 'Clinical Hematology & Molecular Diagnostics',
    passwordHash: hashString('path123'),
    uniqueCode: 'MED-PATH-4419',
    uniqueCodeId: 'CODE-PATH-01',
    isActive: true,
    isCodeRevoked: false,
    createdAt: '2025-02-01T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'USR-PATH-02',
    fullName: 'Dr. Zara Ali',
    email: 'z.ali@medilab.health',
    phone: '+91 92233 44556',
    age: 33,
    gender: 'Female',
    address: 'Lab Staff Quarters, MediLab Campus',
    role: 'pathologist',
    departmentOrSpecialty: 'Microbiology & Serology',
    passwordHash: hashString('path123'),
    uniqueCode: 'MED-PATH-2233',
    uniqueCodeId: 'CODE-PATH-02',
    isActive: true,
    isCodeRevoked: false,
    createdAt: '2025-05-15T08:30:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1594824813573-5827555161d0?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'USR-DISP-01',
    fullName: 'Sangeeta Gupta, B.Pharm',
    email: 's.gupta@medilab.health',
    phone: '+91 98989 89898',
    age: 36,
    gender: 'Female',
    address: '74 Apothecary Lane, Karol Bagh, Delhi',
    role: 'dispensary',
    departmentOrSpecialty: 'Chief Clinical Pharmacist & Inventory Lead',
    passwordHash: hashString('disp123'),
    uniqueCode: 'MED-DISP-9130',
    uniqueCodeId: 'CODE-DISP-01',
    isActive: true,
    isCodeRevoked: false,
    createdAt: '2025-02-10T11:15:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1594824813576-2e861595eb93?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'USR-DISP-02',
    fullName: 'Sameer Khan',
    email: 's.khan@medilab.health',
    phone: '+91 93344 55667',
    age: 31,
    gender: 'Male',
    address: 'Laxmi Nagar, Delhi',
    role: 'dispensary',
    departmentOrSpecialty: 'Senior Pharmacist',
    passwordHash: hashString('disp123'),
    uniqueCode: 'MED-DISP-3344',
    uniqueCodeId: 'CODE-DISP-02',
    isActive: true,
    isCodeRevoked: false,
    createdAt: '2025-06-20T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
  },
];

const SEED_CODES: UniqueLoginCode[] = [
  {
    id: 'CODE-ADM-01',
    userId: 'USR-ADMIN-01',
    userName: 'Dr. Arjun Sharma',
    userRole: 'admin',
    code: 'MED-ADMN-2026',
    isRevoked: false,
    createdAt: '2025-01-10T08:00:00Z',
    lastUsedAt: new Date().toISOString(),
    usageCount: 42,
  },
  {
    id: 'CODE-DOC-01',
    userId: 'USR-DOC-01',
    userName: 'Dr. Priya Nair, MD',
    userRole: 'doctor',
    code: 'MED-DOC1-8842',
    isRevoked: false,
    createdAt: '2025-01-15T09:30:00Z',
    lastUsedAt: new Date().toISOString(),
    usageCount: 118,
  },
  {
    id: 'CODE-PATH-01',
    userId: 'USR-PATH-01',
    userName: 'Dr. Vikram Malhotra, MD',
    userRole: 'pathologist',
    code: 'MED-PATH-4419',
    isRevoked: false,
    createdAt: '2025-02-01T10:00:00Z',
    lastUsedAt: new Date().toISOString(),
    usageCount: 89,
  },
  {
    id: 'CODE-DISP-01',
    userId: 'USR-DISP-01',
    userName: 'Sangeeta Gupta, B.Pharm',
    userRole: 'dispensary',
    code: 'MED-DISP-9130',
    isRevoked: false,
    createdAt: '2025-02-10T11:15:00Z',
    lastUsedAt: new Date().toISOString(),
    usageCount: 145,
  },
  {
    id: 'CODE-DOC-02',
    userId: 'USR-DOC-02',
    userName: 'Dr. Rahul Verma',
    userRole: 'doctor',
    code: 'MED-DOC2-1122',
    isRevoked: false,
    createdAt: '2025-03-01T10:00:00Z',
    usageCount: 45,
  },
  {
    id: 'CODE-DOC-03',
    userId: 'USR-DOC-03',
    userName: 'Dr. Ananya Iyer',
    userRole: 'doctor',
    code: 'MED-DOC3-3344',
    isRevoked: false,
    createdAt: '2025-03-10T09:00:00Z',
    usageCount: 32,
  },
  {
    id: 'CODE-PATH-02',
    userId: 'USR-PATH-02',
    userName: 'Dr. Zara Ali',
    userRole: 'pathologist',
    code: 'MED-PATH-2233',
    isRevoked: false,
    createdAt: '2025-05-15T08:30:00Z',
    usageCount: 18,
  },
];

const SEED_PATIENTS: Patient[] = [
  {
    id: 'PAT-2026-001',
    fullName: 'Rajesh Kumar',
    age: 54,
    gender: 'Male',
    contact: '+91 98765 00001',
    email: 'rajesh.k@example.com',
    address: 'Flat 101, Shanti Sadan, Mumbai',
    bloodGroup: 'A+',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    chronicConditions: ['Hypertension', 'Mild Osteoarthritis'],
    currentMedications: ['Amlodipine 5mg OD', 'Acetaminophen PRN'],
    emergencyContact: {
      name: 'Sunita Kumar',
      relation: 'Spouse',
      phone: '+91 98765 00002',
    },
    assignedDoctorId: 'USR-DOC-01',
    assignedDoctorName: 'Dr. Priya Nair, MD',
    registeredAt: '2025-03-01T09:00:00Z',
  },
  {
    id: 'PAT-2026-002',
    fullName: 'Sunita Verma',
    age: 62,
    gender: 'Female',
    contact: '+91 99887 00001',
    email: 'sunita.v@example.com',
    address: '88, Silver Oak Society, Delhi',
    bloodGroup: 'O+',
    allergies: ['Aspirin'],
    chronicConditions: ['Type 2 Diabetes Mellitus', 'Coronary Artery Disease'],
    currentMedications: ['Metformin 850mg BD', 'Atorvastatin 20mg HS'],
    emergencyContact: {
      name: 'Amit Verma',
      relation: 'Son',
      phone: '+91 99887 00002',
    },
    assignedDoctorId: 'USR-DOC-01',
    assignedDoctorName: 'Dr. Priya Nair, MD',
    registeredAt: '2025-03-05T11:20:00Z',
  },
  {
    id: 'PAT-2026-003',
    fullName: 'Amit Shah',
    age: 29,
    gender: 'Male',
    contact: '+91 91234 00001',
    email: 'amit.s@example.com',
    address: 'Flat 502, Sunset Boulevard, Bangalore',
    bloodGroup: 'B+',
    allergies: ['None Reported'],
    chronicConditions: ['Asthma (Mild Persistent)'],
    currentMedications: ['Salbutamol Inhaler as needed'],
    emergencyContact: {
      name: 'Rohan Shah',
      relation: 'Brother',
      phone: '+91 91234 00002',
    },
    assignedDoctorId: 'USR-DOC-01',
    assignedDoctorName: 'Dr. Priya Nair, MD',
    registeredAt: '2025-03-10T14:15:00Z',
  },
  {
    id: 'PAT-2026-004',
    fullName: 'Kavita Reddy',
    age: 41,
    gender: 'Female',
    contact: '+91 90000 00001',
    email: 'k.reddy@example.com',
    address: '310, Riverdale Terrace, Hyderabad',
    bloodGroup: 'AB-',
    allergies: ['Latex'],
    chronicConditions: ['GERD', 'Hyperlipidemia'],
    currentMedications: ['Omeprazole 20mg OD'],
    emergencyContact: {
      name: 'Sneha Reddy',
      relation: 'Sister',
      phone: '+91 90000 00002',
    },
    assignedDoctorId: 'USR-DOC-01',
    assignedDoctorName: 'Dr. Priya Nair, MD',
    registeredAt: '2025-03-12T10:00:00Z',
  },
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-2026-101',
    patientId: 'PAT-2026-001',
    patientName: 'Rajesh Kumar',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    department: 'Cardiology',
    date: '2026-09-21',
    time: '09:30 AM',
    reason: 'Routine blood pressure review & cardiovascular assessment',
    status: 'Waiting',
    vitals: {
      bloodPressure: '138/86 mmHg',
      heartRate: 74,
      temperature: 98.4,
      spo2: 99,
      weightKg: 68.5,
    },
    clinicalNotes: 'Patient notes mild palpitations in evening. Prior ECG showed normal sinus rhythm.',
  },
  {
    id: 'APT-2026-102',
    patientId: 'PAT-2026-002',
    patientName: 'Sunita Verma',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    department: 'Cardiology',
    date: '2026-09-21',
    time: '10:45 AM',
    reason: 'Follow-up for HbA1c & fasting lipid panel results',
    status: 'Scheduled',
    vitals: {
      bloodPressure: '142/90 mmHg',
      heartRate: 78,
      temperature: 98.6,
      spo2: 98,
      weightKg: 84.0,
    },
    clinicalNotes: 'Review statin adherence and evaluate renal profile.',
  },
  {
    id: 'APT-2026-103',
    patientId: 'PAT-2026-003',
    patientName: 'Amit Shah',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    department: 'General Medicine',
    date: '2026-09-21',
    time: '02:15 PM',
    reason: 'Bronchial asthma seasonal exacerbation check',
    status: 'Scheduled',
  },
];

const SEED_LAB_CATALOG: LabTestCatalogItem[] = [
  {
    id: 'LAB-CBC',
    name: 'Complete Blood Count (CBC) with Differential',
    category: 'Hematology',
    sampleType: 'Whole Blood (EDTA tube)',
    price: 32.0,
    turnaroundHours: 3,
    normalRange: 'WBC: 4.5-11.0 K/uL, RBC: 4.2-5.9 M/uL, Hgb: 12-17 g/dL, Plt: 150-450 K/uL',
    unit: 'Standard Hematology units',
    description: 'Measures red blood cells, white blood cells, hemoglobin, hematocrit, and platelet indices.',
  },
  {
    id: 'LAB-LIPID',
    name: 'Comprehensive Lipid Profile',
    category: 'Biochemistry',
    sampleType: 'Serum (SST tube, Fasting 12h)',
    price: 45.0,
    turnaroundHours: 4,
    normalRange: 'Total Chol <200 mg/dL, HDL >40 mg/dL, LDL <100 mg/dL, Triglycerides <150 mg/dL',
    unit: 'mg/dL',
    description: 'Evaluates cardiovascular risk assessing total cholesterol, high and low-density lipoproteins, and triglycerides.',
  },
  {
    id: 'LAB-HBA1C',
    name: 'Hemoglobin A1c (Glycated Hb)',
    category: 'Biochemistry',
    sampleType: 'Whole Blood (EDTA tube)',
    price: 38.0,
    turnaroundHours: 2,
    normalRange: 'Normal: 4.0% - 5.6%, Pre-diabetes: 5.7% - 6.4%, Diabetes: >= 6.5%',
    unit: '%',
    description: 'Gold-standard 3-month glycaemic control diagnostic for diabetic and pre-diabetic patients.',
  },
  {
    id: 'LAB-CMP',
    name: 'Comprehensive Metabolic Panel (CMP-14)',
    category: 'Biochemistry',
    sampleType: 'Serum (SST tube)',
    price: 55.0,
    turnaroundHours: 4,
    normalRange: 'Glucose: 70-99 mg/dL, BUN: 7-20 mg/dL, Creatinine: 0.6-1.3 mg/dL, eGFR >60',
    unit: 'mg/dL, U/L',
    description: 'Assesses kidney and liver function, electrolyte balance, blood sugar, and serum proteins.',
  },
  {
    id: 'LAB-THYROID',
    name: 'Thyroid Function Panel (TSH, Free T4, Free T3)',
    category: 'Immunology',
    sampleType: 'Serum (SST tube)',
    price: 60.0,
    turnaroundHours: 6,
    normalRange: 'TSH: 0.45 - 4.50 uIU/mL, Free T4: 0.82 - 1.77 ng/dL',
    unit: 'uIU/mL',
    description: 'Measures pituitary and thyroid glandular hormonal secretions for metabolic regulation.',
  },
  {
    id: 'LAB-CRP',
    name: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
    category: 'Immunology',
    sampleType: 'Serum (SST tube)',
    price: 28.0,
    turnaroundHours: 3,
    normalRange: '< 1.0 mg/L (Low cardiovascular risk), 1.0-3.0 (Average), > 3.0 (High)',
    unit: 'mg/L',
    description: 'Sensitive biological acute phase reactant indicating systematic inflammation and endothelial stress.',
  },
  {
    id: 'LAB-URINE',
    name: 'Automated Urinalysis & Microscopic Exam',
    category: 'Pathology',
    sampleType: 'Urine (Midstream sterile container)',
    price: 20.0,
    turnaroundHours: 2,
    normalRange: 'Color: Pale Yellow, pH: 5.0-7.5, Protein: Neg, Glucose: Neg, Nitrite: Neg',
    unit: 'Qualitative',
    description: 'Screening examination for urinary tract infections, renal parenchyma disorder, and metabolic excretion.',
  },
  {
    id: 'LAB-RFT',
    name: 'Renal Function Test (RFT/KFT)',
    category: 'Biochemistry',
    sampleType: 'Serum (SST tube)',
    price: 48.0,
    turnaroundHours: 4,
    normalRange: 'BUN: 7-20 mg/dL, Creatinine: 0.6-1.3 mg/dL, eGFR >60 mL/min',
    unit: 'mg/dL',
    description: 'Measures key indicators of kidney health and filtration capability.',
  },
  {
    id: 'LAB-LFT',
    name: 'Liver Function Test (LFT Profile)',
    category: 'Biochemistry',
    sampleType: 'Serum (SST tube)',
    price: 52.0,
    turnaroundHours: 4,
    normalRange: 'ALT <40 U/L, AST <40 U/L, Bilirubin <1.2 mg/dL, ALP: 44-147 U/L',
    unit: 'U/L, mg/dL',
    description: 'Assesses hepatic health by measuring enzymes, proteins, and bilirubin levels.',
  },
  {
    id: 'LAB-VITD',
    name: 'Vitamin D, 25-Hydroxy',
    category: 'Immunology',
    sampleType: 'Serum (SST tube)',
    price: 75.0,
    turnaroundHours: 24,
    normalRange: 'Deficiency: <20 ng/mL, Insufficiency: 20-29, Sufficient: 30-100',
    unit: 'ng/mL',
    description: 'Measures total circulating vitamin D to assess bone health and immune function.',
  },
  {
    id: 'LAB-VITB12',
    name: 'Vitamin B12 (Cobalamin)',
    category: 'Immunology',
    sampleType: 'Serum (SST tube)',
    price: 68.0,
    turnaroundHours: 12,
    normalRange: '200 - 900 pg/mL',
    unit: 'pg/mL',
    description: 'Measures B12 levels essential for nerve health and red blood cell production.',
  },
  {
    id: 'LAB-PSA',
    name: 'Prostate Specific Antigen (PSA) Total',
    category: 'Immunology',
    sampleType: 'Serum (SST tube)',
    price: 85.0,
    turnaroundHours: 8,
    normalRange: '0 - 4.0 ng/mL',
    unit: 'ng/mL',
    description: 'Screening marker for prostate health and early detection of clinical disorders.',
  },
];

const SEED_LAB_REQUESTS: LabOrder[] = [
  {
    id: 'REQ-LAB-8901',
    patientId: 'PAT-2026-002',
    patientName: 'Sunita Verma',
    patientAge: 62,
    patientGender: 'Female',
    patientBloodGroup: 'O+',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-LIPID',
    testName: 'Comprehensive Lipid Profile',
    testCategory: 'Biochemistry',
    sampleType: 'Serum (SST tube, Fasting 12h)',
    priority: 'Routine',
    orderedDate: '2026-09-15T14:20:00Z',
    sampleCollectedDate: '2026-09-16T07:45:00Z',
    status: 'Result Ready',
    pathologistId: 'USR-PATH-01',
    pathologistName: 'Dr. Vikram Malhotra, MD',
    clinicalNotes: 'Evaluate lipid therapy efficacy on current Atorvastatin 20mg regimen.',
    results: [
      { parameter: 'Total Cholesterol', value: '215', unit: 'mg/dL', referenceRange: '< 200', flag: 'High' },
      { parameter: 'Triglycerides', value: '185', unit: 'mg/dL', referenceRange: '< 150', flag: 'High' },
      { parameter: 'HDL Cholesterol', value: '42', unit: 'mg/dL', referenceRange: '> 40', flag: 'Normal' },
      { parameter: 'LDL (Calculated)', value: '136', unit: 'mg/dL', referenceRange: '< 100', flag: 'High' },
      { parameter: 'Chol/HDL Ratio', value: '5.1', unit: 'ratio', referenceRange: '< 4.5', flag: 'High' },
    ],
    pathologistComments: 'Mild dyslipidemia persisting. Consider lifestyle reinforcement and possible dose titration with requesting cardiologist.',
  },
  {
    id: 'REQ-LAB-8902',
    patientId: 'PAT-2026-001',
    patientName: 'Rajesh Kumar',
    patientAge: 54,
    patientGender: 'Male',
    patientBloodGroup: 'A+',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-CBC',
    testName: 'Complete Blood Count (CBC) with Differential',
    testCategory: 'Hematology',
    sampleType: 'Whole Blood (EDTA tube)',
    priority: 'Urgent',
    orderedDate: '2026-09-16T08:30:00Z',
    sampleCollectedDate: '2026-09-16T09:00:00Z',
    status: 'Verified',
    pathologistId: 'USR-PATH-01',
    pathologistName: 'Dr. Vikram Malhotra, MD',
    verifiedDate: '2026-09-16T10:15:00Z',
    clinicalNotes: 'Screen for occult anemia and baseline cell counts.',
    results: [
      { parameter: 'Hemoglobin', value: '13.4', unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'Normal' },
      { parameter: 'RBC Count', value: '4.62', unit: 'M/uL', referenceRange: '4.00 - 5.20', flag: 'Normal' },
      { parameter: 'Hematocrit', value: '41.2', unit: '%', referenceRange: '37.0 - 48.0', flag: 'Normal' },
      { parameter: 'WBC Total', value: '6.8', unit: 'K/uL', referenceRange: '4.5 - 11.0', flag: 'Normal' },
      { parameter: 'Platelets', value: '265', unit: 'K/uL', referenceRange: '150 - 450', flag: 'Normal' },
      { parameter: 'Neutrophils %', value: '62.0', unit: '%', referenceRange: '40.0 - 70.0', flag: 'Normal' },
      { parameter: 'Lymphocytes %', value: '31.2', unit: '%', referenceRange: '20.0 - 40.0', flag: 'Normal' },
    ],
    pathologistComments: 'Normocytic, normochromic RBC morphology. Platelet count and differential leukocyte counts within normal biological limits.',
  },
  {
    id: 'REQ-LAB-8903',
    patientId: 'PAT-2026-004',
    patientName: 'Kavita Reddy',
    patientAge: 41,
    patientGender: 'Female',
    patientBloodGroup: 'AB-',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-CMP',
    testName: 'Comprehensive Metabolic Panel (CMP-14)',
    testCategory: 'Biochemistry',
    sampleType: 'Serum (SST tube)',
    priority: 'Routine',
    orderedDate: '2026-09-16T09:10:00Z',
    status: 'Ordered',
    clinicalNotes: 'Pre-treatment liver and renal baseline panel.',
    results: [],
  },
  {
    id: 'REQ-LAB-8904',
    patientId: 'PAT-2026-003',
    patientName: 'Amit Shah',
    patientAge: 29,
    patientGender: 'Male',
    patientBloodGroup: 'B+',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-CBC',
    testName: 'Complete Blood Count (CBC) with Differential',
    testCategory: 'Hematology',
    sampleType: 'Whole Blood (EDTA tube)',
    priority: 'Urgent',
    orderedDate: '2026-09-16T11:45:00Z',
    sampleCollectedDate: '2026-09-16T12:00:00Z',
    status: 'In Analysis',
    clinicalNotes: 'Screening for viral fever symptoms.',
    results: [],
  },
  {
    id: 'REQ-LAB-8905',
    patientId: 'PAT-2026-002',
    patientName: 'Sunita Verma',
    patientAge: 62,
    patientGender: 'Female',
    patientBloodGroup: 'O+',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-THYROID',
    testName: 'Thyroid Function Panel (TSH, Free T4, Free T3)',
    testCategory: 'Immunology',
    sampleType: 'Serum (SST tube)',
    priority: 'Routine',
    orderedDate: '2026-09-16T14:30:00Z',
    status: 'Ordered',
    clinicalNotes: 'Hypothyroidism follow-up.',
    results: [],
  },
  {
    id: 'REQ-LAB-8906',
    patientId: 'PAT-2026-003',
    patientName: 'Amit Shah',
    patientAge: 29,
    patientGender: 'Male',
    patientBloodGroup: 'B+',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-HBA1C',
    testName: 'Hemoglobin A1c (Glycated Hb)',
    testCategory: 'Biochemistry',
    sampleType: 'Whole Blood (EDTA tube)',
    priority: 'Routine',
    orderedDate: '2026-09-20T10:15:00Z',
    status: 'Ordered',
    clinicalNotes: 'Screening for pre-diabetes due to positive family history.',
    results: [],
  },
  {
    id: 'REQ-LAB-8907',
    patientId: 'PAT-2026-004',
    patientName: 'Kavita Reddy',
    patientAge: 41,
    patientGender: 'Female',
    patientBloodGroup: 'AB-',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-THYROID',
    testName: 'Thyroid Function Panel (TSH, Free T4, Free T3)',
    testCategory: 'Immunology',
    sampleType: 'Serum (SST tube)',
    priority: 'Urgent',
    orderedDate: '2026-09-20T11:45:00Z',
    sampleCollectedDate: '2026-09-21T07:30:00Z',
    status: 'Processing',
    clinicalNotes: 'Evaluate for clinical hypothyroidism symptoms including fatigue and cold intolerance.',
    results: [],
  },
  {
    id: 'REQ-LAB-8908',
    patientId: 'PAT-2026-001',
    patientName: 'Rajesh Kumar',
    patientAge: 54,
    patientGender: 'Male',
    patientBloodGroup: 'A+',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-RFT',
    testName: 'Renal Function Test (RFT/KFT)',
    testCategory: 'Biochemistry',
    sampleType: 'Serum (SST tube)',
    priority: 'Routine',
    orderedDate: '2026-09-21T08:00:00Z',
    status: 'Ordered',
    clinicalNotes: 'Annual renal health monitoring for established hypertensive patient.',
    results: [],
  },
  {
    id: 'REQ-LAB-8909',
    patientId: 'PAT-2026-002',
    patientName: 'Meera Iyer',
    patientAge: 32,
    patientGender: 'Female',
    patientBloodGroup: 'O+',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-LIPID',
    testName: 'Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides)',
    testCategory: 'Biochemistry',
    sampleType: 'Serum (SST tube)',
    priority: 'Routine',
    orderedDate: '2026-09-21T08:15:00Z',
    status: 'Ordered',
    clinicalNotes: 'Follow-up for hyperlipidemia management.',
    results: [],
  },
  {
    id: 'REQ-LAB-8910',
    patientId: 'PAT-2026-005',
    patientName: 'Sanjay Gupta',
    patientAge: 62,
    patientGender: 'Male',
    patientBloodGroup: 'B-',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-CRP',
    testName: 'C-Reactive Protein (CRP), Quantitative',
    testCategory: 'Immunology',
    sampleType: 'Serum (SST tube)',
    priority: 'STAT (Emergency)',
    orderedDate: '2026-09-21T08:45:00Z',
    status: 'Ordered',
    clinicalNotes: 'Rule out acute inflammatory response / infection.',
    results: [],
  },
  {
    id: 'REQ-LAB-8911',
    patientId: 'PAT-2026-003',
    patientName: 'Amit Shah',
    patientAge: 29,
    patientGender: 'Male',
    patientBloodGroup: 'B+',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    testId: 'LAB-CBC',
    testName: 'Complete Blood Count (CBC)',
    testCategory: 'Hematology',
    sampleType: 'Whole Blood (EDTA tube)',
    priority: 'Urgent',
    orderedDate: '2026-09-20T14:30:00Z',
    sampleCollectedDate: '2026-09-21T08:00:00Z',
    status: 'Processing',
    clinicalNotes: 'Fever of unknown origin; rule out leukocytosis.',
    results: [],
  },
];

const SEED_MEDICINES: Medicine[] = [
  {
    id: 'MED-DRUG-001',
    name: 'Amoxicillin Trihydrate',
    genericName: 'Amoxicillin',
    brandName: 'Amoxil-500',
    category: 'Antibiotic',
    dosageForm: 'Capsule',
    strength: '500mg',
    manufacturer: 'Cipla Ltd',
    batchNumber: 'BT-AMX-2025-99',
    quantity: 140,
    reorderLevel: 40,
    unitPrice: 145.5,
    expiryDate: '2027-08-30',
    supplier: 'Apollo Pharmacy Distribution',
    locationRack: 'Aisle 2 - Shelf B3',
  },
  {
    id: 'MED-DRUG-002',
    name: 'Atorvastatin Calcium',
    genericName: 'Atorvastatin',
    brandName: 'Lipitor-20',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    strength: '20mg',
    manufacturer: 'Sun Pharmaceutical',
    batchNumber: 'BT-ATV-2024-12',
    quantity: 8, // LOW STOCK alert
    reorderLevel: 30,
    unitPrice: 240.0,
    expiryDate: '2027-01-15',
    supplier: 'Wellness Forever Supplies',
    locationRack: 'Aisle 1 - Shelf A2',
  },
  {
    id: 'MED-DRUG-003',
    name: 'Metformin Hydrochloride',
    genericName: 'Metformin',
    brandName: 'Glucophage-850',
    category: 'Antidiabetic',
    dosageForm: 'Tablet',
    strength: '850mg',
    manufacturer: 'Dr. Reddy\'s Labs',
    batchNumber: 'BT-MET-2025-04',
    quantity: 210,
    reorderLevel: 50,
    unitPrice: 110.2,
    expiryDate: '2027-11-20',
    supplier: 'MedPlus Pharma',
    locationRack: 'Aisle 3 - Shelf C1',
  },
  {
    id: 'MED-DRUG-004',
    name: 'Azithromycin Monohydrate',
    genericName: 'Azithromycin',
    brandName: 'Zithromax-250',
    category: 'Antibiotic',
    dosageForm: 'Tablet',
    strength: '250mg',
    manufacturer: 'Lupin Pharmaceuticals',
    batchNumber: 'BT-AZI-2024-81',
    quantity: 35,
    reorderLevel: 25,
    unitPrice: 280.0,
    expiryDate: '2026-09-30', // NEAR EXPIRY alert (< 30 days from 2026-09-16)
    supplier: 'Wellness Forever Supplies',
    locationRack: 'Aisle 2 - Shelf B1',
  },
  {
    id: 'MED-DRUG-005',
    name: 'Ceftriaxone Sodium Vial',
    genericName: 'Ceftriaxone',
    brandName: 'Rocephin-1g',
    category: 'Antibiotic',
    dosageForm: 'Injection',
    strength: '1g Vial',
    manufacturer: 'Zydus Cadila',
    batchNumber: 'BT-CEF-2023-45',
    quantity: 12,
    reorderLevel: 15,
    unitPrice: 420.0,
    expiryDate: '2026-08-10', // EXPIRED alert (< 2026-09-16)
    supplier: 'Apollo Pharmacy Distribution',
    locationRack: 'Cold Chain Refrigerator 1',
  },
  {
    id: 'MED-DRUG-006',
    name: 'Salbutamol Sulfate Inhaler',
    genericName: 'Albuterol / Salbutamol',
    brandName: 'Ventolin HFA',
    category: 'Gastrointestinal',
    dosageForm: 'Inhaler',
    strength: '100mcg/actuation',
    manufacturer: 'GlaxoSmithKline India',
    batchNumber: 'BT-SAL-2025-10',
    quantity: 0, // OUT OF STOCK alert
    reorderLevel: 20,
    unitPrice: 350.0,
    expiryDate: '2027-04-15',
    supplier: 'Apollo Pharmacy Distribution',
    locationRack: 'Aisle 4 - Shelf D2',
  },
  {
    id: 'MED-DRUG-007',
    name: 'Omeprazole Delayed-Release',
    genericName: 'Omeprazole',
    brandName: 'Prilosec-20',
    category: 'Gastrointestinal',
    dosageForm: 'Capsule',
    strength: '20mg',
    manufacturer: 'AstraZeneca India',
    batchNumber: 'BT-OMP-2025-66',
    quantity: 95,
    reorderLevel: 30,
    unitPrice: 165.0,
    expiryDate: '2027-10-15',
    supplier: 'Wellness Forever Supplies',
    locationRack: 'Aisle 3 - Shelf C4',
  },
  {
    id: 'MED-DRUG-008',
    name: 'Paracetamol / Acetaminophen',
    genericName: 'Paracetamol',
    brandName: 'Panadol Extra',
    category: 'Analgesic',
    dosageForm: 'Tablet',
    strength: '500mg',
    manufacturer: 'IOL Chemicals',
    batchNumber: 'BT-PCM-2025-77',
    quantity: 350,
    reorderLevel: 60,
    unitPrice: 60.0,
    expiryDate: '2028-02-14',
    supplier: 'Apollo Pharmacy Distribution',
    locationRack: 'Aisle 1 - Shelf A1',
  },
  {
    id: 'MED-DRUG-009',
    name: 'Lantus Solostar Insulin Pen',
    genericName: 'Insulin Glargine',
    brandName: 'Lantus',
    category: 'Antidiabetic',
    dosageForm: 'Injection',
    strength: '100 units/mL',
    manufacturer: 'Sanofi-Aventis',
    batchNumber: 'BT-INS-2025-01',
    quantity: 45,
    reorderLevel: 10,
    unitPrice: 1250.0,
    expiryDate: '2027-05-15',
    supplier: 'Cold Chain Pharma Solutions',
    locationRack: 'Cold Chain Refrigerator 1',
  },
  {
    id: 'MED-DRUG-010',
    name: 'Losartan Potassium',
    genericName: 'Losartan',
    brandName: 'Cozar-50',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    strength: '50mg',
    manufacturer: 'Sun Pharmaceutical',
    batchNumber: 'BT-LOS-2025-12',
    quantity: 180,
    reorderLevel: 50,
    unitPrice: 85.0,
    expiryDate: '2027-12-30',
    supplier: 'Wellness Forever Supplies',
    locationRack: 'Aisle 1 - Shelf A3',
  },
  {
    id: 'MED-DRUG-011',
    name: 'Gabapentin Capsules',
    genericName: 'Gabapentin',
    brandName: 'Neurontin-300',
    category: 'Neurological',
    dosageForm: 'Capsule',
    strength: '300mg',
    manufacturer: 'Pfizer India',
    batchNumber: 'BT-GAB-2025-45',
    quantity: 120,
    reorderLevel: 40,
    unitPrice: 310.0,
    expiryDate: '2027-04-10',
    supplier: 'Apollo Pharmacy Distribution',
    locationRack: 'Aisle 4 - Shelf D1',
  },
  {
    id: 'MED-DRUG-012',
    name: 'Sertraline HCl',
    genericName: 'Sertraline',
    brandName: 'Zoloft-50',
    category: 'Psychiatric',
    dosageForm: 'Tablet',
    strength: '50mg',
    manufacturer: 'Intas Pharma',
    batchNumber: 'BT-SER-2025-99',
    quantity: 65,
    reorderLevel: 20,
    unitPrice: 195.0,
    expiryDate: '2027-09-15',
    supplier: 'MedPlus Pharma',
    locationRack: 'Aisle 4 - Shelf D4',
  },
  {
    id: 'MED-DRUG-013',
    name: 'Amlodipine Besylate',
    genericName: 'Amlodipine',
    brandName: 'Amlong-5',
    category: 'Cardiovascular',
    dosageForm: 'Tablet',
    strength: '5mg',
    manufacturer: 'Micro Labs Ltd',
    batchNumber: 'BT-AML-2026-02',
    quantity: 450,
    reorderLevel: 100,
    unitPrice: 45.0,
    expiryDate: '2028-06-30',
    supplier: 'Apollo Pharmacy Distribution',
    locationRack: 'Aisle 1 - Shelf A2',
  },
];

const SEED_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'RX-2026-0891',
    patientId: 'PAT-2026-001',
    patientName: 'Rajesh Kumar',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    doctorSpecialty: 'Cardiology & Internal Medicine',
    date: '2026-09-16',
    diagnosis: 'Essential Hypertension Stage 1 & Tension Headache',
    items: [
      {
        medicineId: 'MED-DRUG-008',
        medicineName: 'Panadol Extra 500mg',
        dosage: '500mg',
        frequency: 'Every 6-8 hours as needed for pain',
        duration: '5 days',
        quantity: 15,
        instructions: 'Take with full glass of water. Do not exceed 3,000mg in 24 hours.',
      },
      {
        medicineId: 'MED-DRUG-007',
        medicineName: 'Prilosec 20mg',
        dosage: '20mg',
        frequency: 'Once daily before morning breakfast',
        duration: '14 days',
        quantity: 14,
        instructions: 'Swallow whole, do not crush or chew capsule.',
      },
    ],
    status: 'Pending',
    notes: 'Monitor BP weekly. Schedule follow-up in 2 weeks.',
  },
  {
    id: 'RX-2026-0885',
    patientId: 'PAT-2026-002',
    patientName: 'Sunita Verma',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    doctorSpecialty: 'Cardiology & Internal Medicine',
    date: '2026-09-12',
    diagnosis: 'Type 2 Diabetes Mellitus with Dyslipidemia',
    items: [
      {
        medicineId: 'MED-DRUG-003',
        medicineName: 'Glucophage 850mg',
        dosage: '850mg',
        frequency: 'Twice daily with meals',
        duration: '30 days',
        quantity: 60,
        instructions: 'Take during or immediately after meals to minimize GI discomfort.',
      },
    ],
    status: 'Dispensed',
    dispensedAt: '2026-09-12T11:40:00Z',
    dispensedBy: 'Sangeeta Gupta, B.Pharm',
    dispensedById: 'USR-DISP-01',
    notes: 'Prescription successfully fulfilled and counseled.',
  },
  {
    id: 'RX-2026-0895',
    patientId: 'PAT-2026-003',
    patientName: 'Amit Shah',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    doctorSpecialty: 'Cardiology & Internal Medicine',
    date: '2026-09-21',
    diagnosis: 'Acute Bronchitis & Viral Fever',
    items: [
      {
        medicineId: 'MED-DRUG-004',
        medicineName: 'Zithromax 250mg',
        dosage: '250mg',
        frequency: 'Once daily for 5 days',
        duration: '5 days',
        quantity: 5,
        instructions: 'Take 1 hour before or 2 hours after meals.',
      },
      {
        medicineId: 'MED-DRUG-008',
        medicineName: 'Panadol Extra 500mg',
        dosage: '500mg',
        frequency: 'Every 8 hours as needed',
        duration: '3 days',
        quantity: 9,
        instructions: 'Take for fever or body ache.',
      },
    ],
    status: 'Pending',
    notes: 'Patient advised bed rest and increased fluid intake.',
  },
  {
    id: 'RX-2026-0896',
    patientId: 'PAT-2026-004',
    patientName: 'Kavita Reddy',
    doctorId: 'USR-DOC-02',
    doctorName: 'Dr. Rahul Verma',
    doctorSpecialty: 'General Medicine & Family Practice',
    date: '2026-09-21',
    diagnosis: 'Severe Acid Reflux (GERD)',
    items: [
      {
        medicineId: 'MED-DRUG-007',
        medicineName: 'Prilosec 20mg',
        dosage: '20mg',
        frequency: 'Twice daily (30 mins before breakfast and dinner)',
        duration: '14 days',
        quantity: 28,
        instructions: 'Do not skip doses. Complete the full course.',
      },
    ],
    status: 'Pending',
    notes: 'Avoid spicy foods and caffeine for 2 weeks.',
  },
  {
    id: 'RX-2026-0897',
    patientId: 'PAT-2026-001',
    patientName: 'Rajesh Kumar',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    doctorSpecialty: 'Cardiology & Internal Medicine',
    date: '2026-09-21',
    diagnosis: 'Hyperlipidemia Follow-up',
    items: [
      {
        medicineId: 'MED-DRUG-002',
        medicineName: 'Lipitor 20mg',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        duration: '30 days',
        quantity: 30,
        instructions: 'Take at night for maximum efficacy.',
      },
    ],
    status: 'Pending',
    notes: 'Low fat diet recommended.',
  },
  {
    id: 'RX-2026-0898',
    patientId: 'PAT-2026-002',
    patientName: 'Sunita Verma',
    doctorId: 'USR-DOC-01',
    doctorName: 'Dr. Priya Nair, MD',
    doctorSpecialty: 'Cardiology & Internal Medicine',
    date: '2026-09-21',
    diagnosis: 'Type 2 Diabetes Mellitus - Routine Refill',
    items: [
      {
        medicineId: 'MED-DRUG-003',
        medicineName: 'Glucophage 850mg',
        dosage: '850mg',
        frequency: 'Twice daily with meals',
        duration: '60 days',
        quantity: 120,
        instructions: 'Take during or immediately after meals.',
      },
      {
        medicineId: 'MED-DRUG-009',
        medicineName: 'Lantus Solostar Insulin Pen',
        dosage: '10 units',
        frequency: 'Once daily at night',
        duration: '30 days',
        quantity: 2,
        instructions: 'Inject subcutaneously as directed. Keep refrigerated.',
      },
    ],
    status: 'Pending',
    notes: 'Standard diabetic refill.',
  },
  {
    id: 'RX-2026-0899',
    patientId: 'PAT-2026-005',
    patientName: 'Sanjay Gupta',
    doctorId: 'USR-DOC-04',
    doctorName: 'Dr. Sanjay Dutt',
    doctorSpecialty: 'Orthopedics & Sports Medicine',
    date: '2026-09-21',
    diagnosis: 'Post-operative Pain Management',
    items: [
      {
        medicineId: 'MED-DRUG-011',
        medicineName: 'Neurontin 300mg',
        dosage: '300mg',
        frequency: 'Three times daily',
        duration: '10 days',
        quantity: 30,
        instructions: 'May cause drowsiness. Do not drive or operate heavy machinery.',
      },
      {
        medicineId: 'MED-DRUG-008',
        medicineName: 'Panadol Extra 500mg',
        dosage: '500mg',
        frequency: 'Every 6 hours',
        duration: '5 days',
        quantity: 20,
        instructions: 'For pain management.',
      },
    ],
    status: 'Pending',
    notes: 'Patient recovering from knee arthroscopy.',
  },
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-0412',
    patientId: 'PAT-2026-002',
    patientName: 'Sunita Verma',
    prescriptionId: 'RX-2026-0885',
    dispensedBy: 'Sangeeta Gupta, B.Pharm',
    items: [
      {
        medicineId: 'MED-DRUG-003',
        medicineName: 'Glucophage 850mg',
        quantity: 60,
        unitPrice: 110.2,
        total: 6612.0,
      },
    ],
    subtotal: 6612.0,
    tax: 330.6,
    discount: 300.0,
    totalAmount: 6642.6,
    paymentMethod: 'Insurance',
    status: 'Paid',
    createdAt: '2026-09-12T11:42:00Z',
  },
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOTIF-01',
    title: 'Low Stock Alert: Atorvastatin 20mg',
    message: 'Only 8 tablets left in stock. Reorder threshold is 30. Please create replenishment order.',
    type: 'alert',
    targetRole: 'dispensary',
    createdAt: '2026-09-16T06:00:00Z',
    isRead: false,
    linkAction: 'inventory',
  },
  {
    id: 'NOTIF-02',
    title: 'Near Expiry Alert: Azithromycin 250mg',
    message: 'Batch BT-AZI-2024-81 expires on September 30, 2026. Action required.',
    type: 'warning',
    targetRole: 'dispensary',
    createdAt: '2026-09-16T07:15:00Z',
    isRead: false,
    linkAction: 'inventory',
  },
  {
    id: 'NOTIF-03',
    title: 'New Lab Request: Sunita Verma',
    message: 'Lipid Profile requested by Dr. Priya Nair. Sample collected & awaiting processing.',
    type: 'info',
    targetRole: 'pathologist',
    createdAt: '2026-09-16T07:50:00Z',
    isRead: false,
    linkAction: 'lab-orders',
  },
  {
    id: 'NOTIF-04',
    title: 'Lab Results Verified: Rajesh Kumar',
    message: 'Complete Blood Count results verified by Dr. Vikram Malhotra. Ready for clinical review.',
    type: 'success',
    targetRole: 'doctor',
    createdAt: '2026-09-16T10:18:00Z',
    isRead: false,
    linkAction: 'lab-reports',
  },
];

const SEED_LOGS: ActivityLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-09-16T07:45:00Z',
    userName: 'Sangeeta Gupta, B.Pharm',
    userRole: 'dispensary',
    action: 'DISPENSARY_INVENTORY_CHECK',
    details: 'Automated morning inventory audit executed: 1 out-of-stock item, 1 low-stock item flagged.',
    ipAddress: '10.0.4.12',
    severity: 'info',
  },
  {
    id: 'LOG-002',
    timestamp: '2026-09-16T08:00:00Z',
    userName: 'Dr. Arjun Sharma',
    userRole: 'admin',
    action: 'USER_LOGIN_UNIQUE_CODE',
    details: 'Admin logged in via unique credential code MED-ADMN-2026.',
    ipAddress: '10.0.1.5',
    severity: 'info',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-09-16T08:30:00Z',
    userName: 'Dr. Priya Nair, MD',
    userRole: 'doctor',
    action: 'LAB_TEST_ORDERED',
    details: 'Ordered Complete Blood Count (CBC) for Patient Rajesh Kumar (PAT-2026-001).',
    ipAddress: '10.0.2.19',
    severity: 'info',
  },
  {
    id: 'LOG-004',
    timestamp: '2026-09-16T10:15:00Z',
    userName: 'Dr. Vikram Malhotra, MD',
    userRole: 'pathologist',
    action: 'LAB_REPORT_VERIFIED',
    details: 'Digitally verified and released diagnostic laboratory report REQ-LAB-8902.',
    ipAddress: '10.0.3.8',
    severity: 'info',
  },
];

// Local Storage Helper
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Failed to store key ${key}:`, err);
  }
}

// Storage API Class
export const MediLabStore = {
  // Initialize storage with seeds if empty
  init() {
    getStored(STORAGE_KEYS.USERS, SEED_USERS);
    getStored(STORAGE_KEYS.CODES, SEED_CODES);
    getStored(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
    getStored(STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
    getStored(STORAGE_KEYS.LAB_CATALOG, SEED_LAB_CATALOG);
    getStored(STORAGE_KEYS.LAB_REQUESTS, SEED_LAB_REQUESTS);
    getStored(STORAGE_KEYS.MEDICINES, SEED_MEDICINES);
    getStored(STORAGE_KEYS.PRESCRIPTIONS, SEED_PRESCRIPTIONS);
    getStored(STORAGE_KEYS.INVOICES, SEED_INVOICES);
    getStored(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    getStored(STORAGE_KEYS.LOGS, SEED_LOGS);
  },

  // Reset database to initial seed state
  resetToFactoryDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.CODES, JSON.stringify(SEED_CODES));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(SEED_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.LAB_CATALOG, JSON.stringify(SEED_LAB_CATALOG));
    localStorage.setItem(STORAGE_KEYS.LAB_REQUESTS, JSON.stringify(SEED_LAB_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(SEED_MEDICINES));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(SEED_PRESCRIPTIONS));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(SEED_INVOICES));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(SEED_LOGS));
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  },

  // ==================== AUTHENTICATION & USERS ====================

  getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  },

  getUserById(userId: string): User | undefined {
    return this.getUsers().find((u) => u.id === userId);
  },

  getUniqueCodes(): UniqueLoginCode[] {
    return getStored<UniqueLoginCode[]>(STORAGE_KEYS.CODES, SEED_CODES);
  },

  registerUser(data: {
    fullName: string;
    email: string;
    phone: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    address: string;
    password: string;
    role: UserRole;
    departmentOrSpecialty?: string;
  }): { user: User; code: string } {
    const users = this.getUsers();
    const codes = this.getUniqueCodes();

    // Check duplicate email
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('An account with this email address already exists in the system.');
    }

    // Generate unique code and ensure no collision
    let generatedCode = generateUniqueLoginCode();
    while (codes.some((c) => c.code === generatedCode)) {
      generatedCode = generateUniqueLoginCode();
    }

    const userId = `USR-${Date.now()}`;
    const codeId = `CODE-${Date.now()}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      age: data.age,
      gender: data.gender,
      address: data.address.trim(),
      role: data.role,
      departmentOrSpecialty: data.departmentOrSpecialty || undefined,
      passwordHash: hashString(data.password),
      uniqueCode: generatedCode,
      uniqueCodeId: codeId,
      isActive: true,
      isCodeRevoked: false,
      createdAt: now,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.fullName)}`,
    };

    const newCodeObj: UniqueLoginCode = {
      id: codeId,
      userId,
      userName: data.fullName,
      userRole: data.role,
      code: generatedCode,
      isRevoked: false,
      createdAt: now,
      usageCount: 0,
    };

    users.push(newUser);
    codes.push(newCodeObj);

    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.CODES, codes);

    this.logActivity(
      'ACCOUNT_REGISTERED',
      `New user registered: ${data.fullName} as ${(data.role || '').toUpperCase()}. Unique code issued.`,
      newUser.fullName,
      newUser.role,
      'info',
    );

    return { user: newUser, code: generatedCode };
  },

  // Authenticate user with their selected role and unique code
  loginWithUniqueCode(
    selectedRole: UserRole,
    inputCode: string,
  ): { user: User; token: string } {
    const formattedCode = (inputCode || '').trim().toUpperCase();
    const users = this.getUsers();
    const codes = this.getUniqueCodes();

    const codeRecord = codes.find((c) => c.code === formattedCode);

    if (!codeRecord) {
      this.logActivity(
        'LOGIN_FAILED_INVALID_CODE',
        `Failed login attempt with non-existent code ${formattedCode.substring(0, 6)}***`,
        'Anonymous',
        selectedRole,
        'warn',
      );
      throw new Error('Invalid unique login code. Please check your code and try again.');
    }

    if (codeRecord.isRevoked) {
      this.logActivity(
        'LOGIN_FAILED_REVOKED_CODE',
        `Attempted login with revoked code for user ${codeRecord.userName}`,
        codeRecord.userName,
        codeRecord.userRole,
        'critical',
      );
      throw new Error('This unique login code has been revoked by hospital administration. Please contact support.');
    }

    if (codeRecord.userRole !== selectedRole) {
      this.logActivity(
        'LOGIN_FAILED_ROLE_MISMATCH',
        `User ${codeRecord.userName} attempted login as ${(selectedRole || '').toUpperCase()}, but code belongs to ${(codeRecord.userRole || '').toUpperCase()}`,
        codeRecord.userName,
        codeRecord.userRole,
        'warn',
      );
      throw new Error(`This code is registered for the role of ${(codeRecord.userRole || '').toUpperCase()}, not ${(selectedRole || '').toUpperCase()}. Please select the correct role.`);
    }

    const user = users.find((u) => u.id === codeRecord.userId);
    if (!user) {
      throw new Error('User record associated with this login code could not be found.');
    }

    if (!user.isActive) {
      throw new Error('This account is currently deactivated. Please contact the MediLab administrator.');
    }

    if (user.isCodeRevoked) {
      throw new Error('Your security access code has been disabled.');
    }

    // Update login timestamps & usage count
    const now = new Date().toISOString();
    user.lastLoginAt = now;
    codeRecord.lastUsedAt = now;
    codeRecord.usageCount = (codeRecord.usageCount || 0) + 1;

    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.CODES, codes);

    // Create session token
    const token = `mlb_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session = {
      token,
      user,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours session
    };
    setStored(STORAGE_KEYS.ACTIVE_SESSION, session);

    this.logActivity(
      'USER_LOGIN_SUCCESS',
      `Authenticated successfully via unique code as ${(user.role || '').toUpperCase()}`,
      user.fullName,
      user.role,
      'info',
    );

    return { user, token };
  },

  recoverCode(email: string, age: number): string {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.age === age,
    );

    if (!user) {
      throw new Error('No matching account found with the provided email and date of birth combination.');
    }

    if (user.isCodeRevoked) {
      throw new Error('This account code has been revoked. Contact the administrator to re-issue a new code.');
    }

    this.logActivity(
      'CODE_RECOVERY_ATTEMPT',
      `Security code recovered for user: ${user.fullName} (${user.email})`,
      user.fullName,
      user.role,
      'info',
    );

    return user.uniqueCode;
  },

  revokeUserCode(userId: string, adminName: string): UniqueLoginCode {
    const users = this.getUsers();
    const codes = this.getUniqueCodes();

    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found.');

    user.isCodeRevoked = true;

    const codeObj = codes.find((c) => c.userId === userId && !c.isRevoked);
    if (codeObj) {
      codeObj.isRevoked = true;
      codeObj.revokedAt = new Date().toISOString();
      codeObj.revokedBy = adminName;
    }

    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.CODES, codes);

    this.logActivity(
      'SECURITY_CODE_REVOKED',
      `Admin ${adminName} revoked unique code for ${user.fullName}`,
      adminName,
      'admin',
      'warn',
    );

    return codeObj || ({} as UniqueLoginCode);
  },

  regenerateUserCode(userId: string, adminName: string): string {
    const users = this.getUsers();
    const codes = this.getUniqueCodes();

    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found.');

    // Revoke old codes
    codes.forEach((c) => {
      if (c.userId === userId) {
        c.isRevoked = true;
        c.revokedAt = new Date().toISOString();
        c.revokedBy = adminName;
      }
    });

    // Generate fresh code
    let newCode = generateUniqueLoginCode();
    while (codes.some((c) => c.code === newCode)) {
      newCode = generateUniqueLoginCode();
    }

    const newCodeId = `CODE-${Date.now()}`;
    user.uniqueCode = newCode;
    user.uniqueCodeId = newCodeId;
    user.isCodeRevoked = false;

    codes.push({
      id: newCodeId,
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      code: newCode,
      isRevoked: false,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    });

    setStored(STORAGE_KEYS.USERS, users);
    setStored(STORAGE_KEYS.CODES, codes);

    this.logActivity(
      'SECURITY_CODE_REISSUED',
      `Admin ${adminName} re-issued new unique code for ${user.fullName}`,
      adminName,
      'admin',
      'info',
    );

    return newCode;
  },

  toggleUserStatus(userId: string, adminName: string): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found.');

    user.isActive = !user.isActive;
    setStored(STORAGE_KEYS.USERS, users);

    this.logActivity(
      user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      `Admin ${adminName} changed status of ${user.fullName} to ${user.isActive ? 'Active' : 'Deactivated'}`,
      adminName,
      'admin',
      user.isActive ? 'info' : 'warn',
    );

    return user.isActive;
  },

  getCurrentSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (new Date(session.expiresAt) < new Date()) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  logout(userName = 'User', userRole: UserRole = 'admin') {
    this.logActivity('USER_LOGOUT', `Logged out of session`, userName, userRole, 'info');
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  },

  // ==================== PATIENT MANAGEMENT ====================

  getPatients(): Patient[] {
    const stored = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, SEED_PATIENTS);
    const storedIds = new Set(stored.map(p => p.id));
    const newSeeds = SEED_PATIENTS.filter(s => !storedIds.has(s.id));
    
    if (newSeeds.length > 0) {
      const merged = [...stored, ...newSeeds];
      setStored(STORAGE_KEYS.PATIENTS, merged);
      return merged;
    }
    
    return stored;
  },

  getPatientById(patientId: string): Patient | undefined {
    return this.getPatients().find((p) => p.id === patientId);
  },

  addPatient(data: Omit<Patient, 'id' | 'registeredAt'>): Patient {
    const patients = this.getPatients();
    const count = patients.length + 1;
    const newId = `PAT-2026-${count.toString().padStart(3, '0')}`;

    const newPatient: Patient = {
      ...data,
      id: newId,
      registeredAt: new Date().toISOString(),
    };

    patients.unshift(newPatient);
    setStored(STORAGE_KEYS.PATIENTS, patients);

    return newPatient;
  },

  deletePatient(patientId: string): void {
    const patients = this.getPatients();
    const filtered = patients.filter((p) => p.id !== patientId);
    if (filtered.length === patients.length) throw new Error('Patient record not found.');
    setStored(STORAGE_KEYS.PATIENTS, filtered);
  },

  updatePatient(id: string, updates: Partial<Patient>): Patient {
    const patients = this.getPatients();
    const index = patients.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Patient not found.');

    patients[index] = { ...patients[index], ...updates };
    setStored(STORAGE_KEYS.PATIENTS, patients);
    return patients[index];
  },

  // ==================== APPOINTMENTS ====================

  getAppointments(): Appointment[] {
    return getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
  },

  addAppointment(data: Omit<Appointment, 'id'>): Appointment {
    const list = this.getAppointments();
    const newApt: Appointment = {
      ...data,
      id: `APT-2026-${Date.now().toString().slice(-4)}`,
    };
    list.push(newApt);
    setStored(STORAGE_KEYS.APPOINTMENTS, list);
    return newApt;
  },

  updateAppointmentStatus(id: string, status: Appointment['status'], notes?: string): void {
    const list = this.getAppointments();
    const apt = list.find((a) => a.id === id);
    if (apt) {
      apt.status = status;
      if (notes) apt.clinicalNotes = notes;
      setStored(STORAGE_KEYS.APPOINTMENTS, list);
    }
  },

  // ==================== LABORATORY MANAGEMENT ====================

  getLabCatalog(): LabTestCatalogItem[] {
    return getStored<LabTestCatalogItem[]>(STORAGE_KEYS.LAB_CATALOG, SEED_LAB_CATALOG);
  },

  addLabCatalogItem(item: Omit<LabTestCatalogItem, 'id'>): LabTestCatalogItem {
    const catalog = this.getLabCatalog();
    const id = `LAB-${(item.name || '').replace(/[^A-Za-z0-9]/g, '').substring(0, 5).toUpperCase()}-${Date.now().toString().slice(-3)}`;
    const newItem: LabTestCatalogItem = { ...item, id };
    catalog.push(newItem);
    setStored(STORAGE_KEYS.LAB_CATALOG, catalog);
    return newItem;
  },

  getLabOrders(): LabOrder[] {
    const stored = getStored<LabOrder[]>(STORAGE_KEYS.LAB_REQUESTS, SEED_LAB_REQUESTS);
    
    // For demonstration purposes, we ensure newly added seed items are merged if they aren't already in storage
    const storedIds = new Set(stored.map(r => r.id));
    const newSeeds = SEED_LAB_REQUESTS.filter(s => !storedIds.has(s.id));
    
    if (newSeeds.length > 0) {
      const merged = [...stored, ...newSeeds];
      setStored(STORAGE_KEYS.LAB_REQUESTS, merged);
      return merged;
    }
    
    return stored;
  },

  createLabOrder(data: {
    patientId?: string;
    manualPatient?: {
      fullName: string;
      age: number;
      gender: 'Male' | 'Female' | 'Other';
    };
    doctorId: string;
    doctorName: string;
    testId: string;
    priority: 'Routine' | 'Urgent' | 'STAT (Emergency)';
    clinicalNotes?: string;
  }): LabOrder {
    let patientDetails: {
      id: string;
      fullName: string;
      age: number;
      gender: 'Male' | 'Female' | 'Other';
      bloodGroup?: string;
    };

    if (data.patientId) {
      const patient = this.getPatientById(data.patientId);
      if (!patient) throw new Error('Patient not found.');
      patientDetails = {
        id: patient.id,
        fullName: patient.fullName,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
      };
    } else if (data.manualPatient) {
      patientDetails = {
        id: `PAT-WALKIN-${Date.now().toString().slice(-4)}`,
        fullName: data.manualPatient.fullName,
        age: data.manualPatient.age,
        gender: data.manualPatient.gender,
        bloodGroup: 'O+', // Default or optional
      };
    } else {
      throw new Error('Either patientId or manualPatient details must be provided.');
    }

    const catalog = this.getLabCatalog();
    const test = catalog.find((t) => t.id === data.testId);
    if (!test) throw new Error('Test not found in catalog.');

    const requests = this.getLabOrders();
    const newReq: LabOrder = {
      id: `REQ-LAB-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patientDetails.id,
      patientName: patientDetails.fullName,
      patientAge: patientDetails.age,
      patientGender: patientDetails.gender,
      patientBloodGroup: patientDetails.bloodGroup,
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      testId: test.id,
      testName: test.name,
      testCategory: test.category,
      sampleType: test.sampleType,
      priority: data.priority,
      orderedDate: new Date().toISOString(),
      status: 'Ordered',
      clinicalNotes: data.clinicalNotes,
      results: [],
    };

    requests.unshift(newReq);
    setStored(STORAGE_KEYS.LAB_REQUESTS, requests);

    // Create a notification for pathologists
    this.addNotification({
      title: `New Lab Order: ${test.name}`,
      message: `${data.priority} investigation ordered for ${patientDetails.fullName} by ${data.doctorName}`,
      type: data.priority === 'STAT (Emergency)' ? 'alert' : 'info',
      targetRole: 'pathologist',
      linkAction: 'lab-orders',
    });

    this.logActivity(
      'LAB_REQUEST_CREATED',
      `Ordered ${test.name} (${data.priority}) for ${patientDetails.fullName}`,
      data.doctorName,
      'doctor',
      'info',
    );

    return newReq;
  },

  deleteLabOrder(requestId: string): void {
    const requests = this.getLabOrders();
    const filtered = requests.filter((r) => r.id !== requestId);
    if (filtered.length === requests.length) throw new Error('Lab request record not found.');
    setStored(STORAGE_KEYS.LAB_REQUESTS, filtered);
  },

  updateLabStatus(requestId: string, status: LabOrder['status'], sampleCollected = false): void {
    const requests = this.getLabOrders();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    req.status = status;
    if (sampleCollected || status === 'Sample Collected') {
      req.sampleCollectedDate = new Date().toISOString();
    }
    setStored(STORAGE_KEYS.LAB_REQUESTS, requests);
  },

  updateLabOrderStatus(requestId: string, status: LabStatus, staffName?: string): void {
    this.updateLabStatus(requestId, status, status === 'Sample Collected');
    if (staffName) {
      this.logActivity('LAB_STATUS_UPDATE', `Specimen ${requestId} status moved to ${status}`, staffName, 'pathologist', 'info');
    }
  },

  saveLabResults(
    requestId: string,
    results: LabResultItem[],
    comments: string,
    pathologistName: string,
  ): void {
    const requests = this.getLabOrders();
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Lab request not found.');

    req.results = results;
    req.pathologistName = pathologistName;
    req.pathologistComments = comments;
    req.status = 'Verified';
    req.verifiedDate = new Date().toISOString();

    setStored(STORAGE_KEYS.LAB_REQUESTS, requests);

    this.addNotification({
      title: `Lab Report Verified: ${req.testName}`,
      message: `Results for ${req.patientName} have been verified and signed off by ${pathologistName}`,
      type: 'success',
      targetRole: 'doctor',
      linkAction: 'lab-reports',
    });

    this.logActivity(
      'LAB_REPORT_VERIFIED',
      `Verified and signed off lab report ${req.id} for ${req.patientName}`,
      pathologistName,
      'pathologist',
      'info',
    );
  },

  recordLabResults(
    requestId: string,
    results: LabOrder['results'],
    pathologistId: string,
    pathologistName: string,
    comments?: string,
  ): void {
    const requests = this.getLabOrders();
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Lab request not found.');

    req.results = results;
    req.pathologistId = pathologistId;
    req.pathologistName = pathologistName;
    if (comments) req.pathologistComments = comments;
    req.status = 'Result Ready';

    setStored(STORAGE_KEYS.LAB_REQUESTS, requests);
  },

  verifyLabReport(requestId: string, pathologistName: string): void {
    const requests = this.getLabOrders();
    const req = requests.find((r) => r.id === requestId);
    if (!req) throw new Error('Lab request not found.');

    req.status = 'Verified';
    req.verifiedDate = new Date().toISOString();

    setStored(STORAGE_KEYS.LAB_REQUESTS, requests);

    // Notify doctor
    this.addNotification({
      title: `Lab Results Verified: ${req.testName}`,
      message: `Results for ${req.patientName} have been verified by ${pathologistName}`,
      type: 'success',
      targetRole: 'doctor',
      linkAction: 'lab-reports',
    });

    this.logActivity(
      'LAB_REPORT_VERIFIED',
      `Verified lab report ${req.id} for ${req.patientName}`,
      pathologistName,
      'pathologist',
      'info',
    );
  },

  // ==================== PHARMACY & MEDICINES ====================

  getMedicines(): Medicine[] {
    return getStored<Medicine[]>(STORAGE_KEYS.MEDICINES, SEED_MEDICINES);
  },

  addMedicine(data: Omit<Medicine, 'id'>): Medicine {
    const meds = this.getMedicines();
    const newId = `MED-DRUG-${(meds.length + 1).toString().padStart(3, '0')}`;
    const newMed: Medicine = {
      ...data,
      id: newId,
      genericName: data.genericName || data.name,
      supplier: data.supplier || data.manufacturer,
      locationRack: data.locationRack || data.storageLocation || 'Main Pharmacy Rack',
    };

    meds.push(newMed);
    setStored(STORAGE_KEYS.MEDICINES, meds);

    return newMed;
  },

  updateMedicine(medicineId: string, partial: Partial<Medicine>): Medicine {
    const meds = this.getMedicines();
    const index = meds.findIndex((m) => m.id === medicineId);
    if (index === -1) throw new Error('Medicine not found in formulary.');

    meds[index] = { ...meds[index], ...partial };
    setStored(STORAGE_KEYS.MEDICINES, meds);
    return meds[index];
  },

  updateMedicineQuantity(medicineId: string, newQuantity: number, reason: string, staffName: string): Medicine {
    const meds = this.getMedicines();
    const med = meds.find((m) => m.id === medicineId);
    if (!med) throw new Error('Medicine not found in inventory.');

    const oldQty = med.quantity;
    med.quantity = Math.max(0, newQuantity);

    setStored(STORAGE_KEYS.MEDICINES, meds);

    this.logActivity(
      'STOCK_ADJUSTMENT',
      `Stock for ${med.name} adjusted from ${oldQty} to ${med.quantity}. Reason: ${reason}`,
      staffName,
      'dispensary',
      'info',
    );

    return med;
  },

  // ==================== PRESCRIPTIONS ====================

  getPrescriptions(): Prescription[] {
    const stored = getStored<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, SEED_PRESCRIPTIONS);
    const storedIds = new Set(stored.map(p => p.id));
    const newSeeds = SEED_PRESCRIPTIONS.filter(s => !storedIds.has(s.id));
    
    if (newSeeds.length > 0) {
      const merged = [...stored, ...newSeeds];
      setStored(STORAGE_KEYS.PRESCRIPTIONS, merged);
      return merged;
    }
    
    return stored;
  },

  createPrescription(data: Omit<Prescription, 'id' | 'date' | 'status'>): Prescription {
    const list = this.getPrescriptions();
    const newId = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRx: Prescription = {
      ...data,
      id: newId,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    list.unshift(newRx);
    setStored(STORAGE_KEYS.PRESCRIPTIONS, list);

    // Notify dispensary staff
    this.addNotification({
      title: `New Prescription: ${newRx.id}`,
      message: `Prescription issued for ${newRx.patientName} by ${newRx.doctorName}`,
      type: 'info',
      targetRole: 'dispensary',
      linkAction: 'prescriptions',
    });

    this.logActivity(
      'PRESCRIPTION_ISSUED',
      `Issued prescription ${newRx.id} for ${newRx.patientName} with ${newRx.items.length} medications`,
      newRx.doctorName,
      'doctor',
      'info',
    );

    return newRx;
  },

  dispensePrescription(
    prescriptionId: string,
    dispensedBy: string,
    dispensedById = '',
    paymentMethod: Invoice['paymentMethod'] = 'Cash',
    discount = 0,
  ): Invoice {
    const rxList = this.getPrescriptions();
    const rx = rxList.find((r) => r.id === prescriptionId);
    if (!rx) throw new Error('Prescription not found.');

    const medicines = this.getMedicines();

    // Check inventory stock and deduct
    for (const item of rx.items) {
      const med = medicines.find((m) => m.id === item.medicineId || m.name.toLowerCase().includes(item.medicineName.toLowerCase()));
      if (med) {
        if (med.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${med.name}. Available: ${med.quantity}, Requested: ${item.quantity}`,
          );
        }
        med.quantity -= item.quantity;
      }
    }

    setStored(STORAGE_KEYS.MEDICINES, medicines);

    // Update prescription status
    rx.status = 'Dispensed';
    rx.dispensedAt = new Date().toISOString();
    rx.dispensedBy = dispensedBy;
    rx.dispensedById = dispensedById;
    setStored(STORAGE_KEYS.PRESCRIPTIONS, rxList);

    // Generate Invoice
    const invoiceItems = rx.items.map((item) => {
      const med = medicines.find((m) => m.id === item.medicineId || m.name.toLowerCase().includes(item.medicineName.toLowerCase()));
      const unitPrice = med?.unitPrice || 10.0;
      return {
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        quantity: item.quantity,
        unitPrice,
        total: Number((unitPrice * item.quantity).toFixed(2)),
      };
    });

    const subtotal = invoiceItems.reduce((acc, curr) => acc + curr.total, 0);
    const tax = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + tax - discount).toFixed(2));

    const invoice: Invoice = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: rx.patientId,
      patientName: rx.patientName,
      prescriptionId: rx.id,
      dispensedBy,
      items: invoiceItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      status: 'Paid',
      createdAt: new Date().toISOString(),
    };

    const invoices = this.getInvoices();
    invoices.unshift(invoice);
    setStored(STORAGE_KEYS.INVOICES, invoices);

    this.logActivity(
      'PRESCRIPTION_DISPENSED',
      `Dispensed prescription ${rx.id} for ${rx.patientName}. Invoice ${invoice.id} created (₹${totalAmount}).`,
      dispensedBy,
      'dispensary',
      'info',
    );

    return invoice;
  },

  createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'status'>): Invoice {
    const invoices = this.getInvoices();
    const newInvoice: Invoice = {
      ...data,
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Paid',
      createdAt: new Date().toISOString(),
    };

    invoices.unshift(newInvoice);
    setStored(STORAGE_KEYS.INVOICES, invoices);

    this.logActivity(
      'DIRECT_PHARMACY_SALE',
      `Pharmacy invoice ${newInvoice.id} processed for ${newInvoice.patientName} (₹${newInvoice.totalAmount.toFixed(2)})`,
      newInvoice.dispensedBy,
      'dispensary',
      'info',
    );

    return newInvoice;
  },

  // ==================== INVOICES ====================

  getInvoices(): Invoice[] {
    return getStored<Invoice[]>(STORAGE_KEYS.INVOICES, SEED_INVOICES);
  },

  createDirectSale(
    patientName: string,
    items: { medicineId: string; quantity: number }[],
    dispensedBy: string,
    paymentMethod: Invoice['paymentMethod'],
    discount = 0,
  ): Invoice {
    const medicines = this.getMedicines();

    const invoiceItems = items.map((i) => {
      const med = medicines.find((m) => m.id === i.medicineId);
      if (!med) throw new Error(`Medicine ${i.medicineId} not found.`);
      if (med.quantity < i.quantity) {
        throw new Error(`Insufficient stock for ${med.name}. Available: ${med.quantity}`);
      }
      med.quantity -= i.quantity;
      return {
        medicineId: med.id,
        medicineName: `${med.brandName} (${med.name})`,
        quantity: i.quantity,
        unitPrice: med.unitPrice,
        total: Number((med.unitPrice * i.quantity).toFixed(2)),
      };
    });

    setStored(STORAGE_KEYS.MEDICINES, medicines);

    const subtotal = invoiceItems.reduce((acc, curr) => acc + curr.total, 0);
    const tax = Number((subtotal * 0.05).toFixed(2));
    const totalAmount = Number((subtotal + tax - discount).toFixed(2));

    const invoice: Invoice = {
      id: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: patientName || 'Walk-In Customer',
      dispensedBy,
      items: invoiceItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      paymentMethod,
      status: 'Paid',
      createdAt: new Date().toISOString(),
    };

    const invoices = this.getInvoices();
    invoices.unshift(invoice);
    setStored(STORAGE_KEYS.INVOICES, invoices);

    this.logActivity(
      'DIRECT_PHARMACY_SALE',
      `Walk-in OTC pharmacy sale processed: ${invoice.id} (₹${totalAmount})`,
      dispensedBy,
      'dispensary',
      'info',
    );

    return invoice;
  },

  // ==================== NOTIFICATIONS ====================

  getNotifications(role?: UserRole): Notification[] {
    const notifs = getStored<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    if (!role) return notifs;
    return notifs.filter((n) => !n.targetRole || n.targetRole === 'all' || n.targetRole === role);
  },

  addNotification(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): void {
    const notifs = getStored<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const newNotif: Notification = {
      ...data,
      id: `NOTIF-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    notifs.unshift(newNotif);
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  markNotificationAsRead(id: string): void {
    const notifs = getStored<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    const n = notifs.find((item) => item.id === id);
    if (n) {
      n.isRead = true;
      setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  markAllNotificationsAsRead(role?: UserRole): void {
    const notifs = getStored<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    notifs.forEach((n) => {
      if (!role || n.targetRole === 'all' || n.targetRole === role) {
        n.isRead = true;
      }
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  // ==================== ACTIVITY & AUDIT LOGS ====================

  getActivityLogs(): ActivityLog[] {
    return getStored<ActivityLog[]>(STORAGE_KEYS.LOGS, SEED_LOGS);
  },

  logActivity(
    action: string,
    details: string,
    userName: string,
    userRole: UserRole,
    severity: 'info' | 'warn' | 'critical' = 'info',
  ): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userName,
      userRole,
      action,
      details,
      ipAddress: '192.168.1.104',
      severity,
    };
    logs.unshift(newLog);
    // Keep last 300 logs
    if (logs.length > 300) logs.length = 300;
    setStored(STORAGE_KEYS.LOGS, logs);
  },

  // ==================== AGGREGATED STATS ====================

  getSystemStats() {
    const patients = this.getPatients();
    const users = this.getUsers();
    const medicines = this.getMedicines();
    const labRequests = this.getLabOrders();
    const prescriptions = this.getPrescriptions();
    const invoices = this.getInvoices();

    const doctors = users.filter((u) => u.role === 'doctor');
    const pathologists = users.filter((u) => u.role === 'pathologist');
    const dispensaryStaff = users.filter((u) => u.role === 'dispensary');

    const lowStockMedicines = medicines.filter(
      (m) => m.quantity > 0 && m.quantity <= m.reorderLevel,
    );
    const outOfStockMedicines = medicines.filter((m) => m.quantity === 0);

    const now = new Date();
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const expiredMedicines = medicines.filter((m) => new Date(m.expiryDate) < now);
    const nearExpiryMedicines = medicines.filter((m) => {
      const exp = new Date(m.expiryDate);
      return exp >= now && exp <= sixtyDaysFromNow;
    });

    const pendingLabOrders = labRequests.filter(
      (r) => r.status === 'Pending' || r.status === 'Sample Collected' || r.status === 'Processing',
    );
    const verifiedLabReports = labRequests.filter((r) => r.status === 'Verified');
    const readyLabReports = labRequests.filter((r) => r.status === 'Result Ready');

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    return {
      totalPatients: patients.length,
      totalDoctors: doctors.length,
      totalPathologists: pathologists.length,
      totalDispensaryStaff: dispensaryStaff.length,
      totalMedicines: medicines.length,
      lowStockCount: lowStockMedicines.length,
      outOfStockCount: outOfStockMedicines.length,
      expiredCount: expiredMedicines.length,
      nearExpiryCount: nearExpiryMedicines.length,
      totalLabTests: labRequests.length,
      pendingLabReports: pendingLabOrders.length,
      readyLabReports: readyLabReports.length,
      verifiedLabReports: verifiedLabReports.length,
      totalPrescriptions: prescriptions.length,
      pendingPrescriptions: prescriptions.filter((p) => p.status === 'Pending').length,
      totalRevenue,
    };
  },
};

// Auto initialize on load
MediLabStore.init();
