export type UserRole = 'admin' | 'doctor' | 'pathologist' | 'dispensary';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  role: UserRole;
  departmentOrSpecialty?: string;
  passwordHash: string; // simulated secure hash
  uniqueCode: string;
  uniqueCodeId: string;
  isActive: boolean;
  isCodeRevoked: boolean;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface UniqueLoginCode {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  code: string;
  isRevoked: boolean;
  revokedAt?: string;
  revokedBy?: string;
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: string;
}

export interface Patient {
  id: string; // e.g. PAT-2026-001
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  email?: string;
  address: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  assignedDoctorId?: string;
  assignedDoctorName?: string;
  registeredAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  reason: string;
  status: 'Scheduled' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    spo2?: number;
    weightKg?: number;
  };
  clinicalNotes?: string;
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  dosage: string; // e.g. 500mg
  frequency: string; // e.g. Twice daily after meals
  duration: string; // e.g. 7 days
  quantity: number;
  instructions: string;
}

export interface Prescription {
  id: string; // e.g. RX-2026-089
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  diagnosis: string;
  items: PrescriptionItem[];
  status: 'Pending' | 'Dispensed' | 'Partially Dispensed' | 'Cancelled';
  dispensedAt?: string;
  dispensedBy?: string;
  dispensedById?: string;
  notes?: string;
}

export interface LabTestCatalogItem {
  id: string; // e.g. LAB-CBC
  name: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Immunology' | 'Pathology' | 'Radiology' | string;
  sampleType: string;
  price: number;
  turnaroundHours: number;
  normalRange?: string;
  unit?: string;
  description?: string;
  parameters?: { name: string; unit: string; referenceRange: string }[];
}

export type LabStatus = 'Pending' | 'Ordered' | 'Sample Collected' | 'Processing' | 'In Analysis' | 'Result Ready' | 'Verified';

export interface LabResultItem {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  flag: 'Normal' | 'Low' | 'High' | 'Critical' | 'Abnormal';
}

export type LabTestResult = LabResultItem;

export interface LabOrder {
  id: string; // e.g. REQ-LAB-5401
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientBloodGroup?: string;
  doctorId: string;
  doctorName: string;
  testId: string;
  testName: string;
  testCategory: string;
  sampleType: string;
  priority: 'Routine' | 'Urgent' | 'STAT (Emergency)';
  orderedDate: string;
  sampleCollectedDate?: string;
  status: LabStatus;
  pathologistId?: string;
  pathologistName?: string;
  verifiedDate?: string;
  clinicalNotes?: string;
  results: LabResultItem[];
  pathologistComments?: string;
}

export interface Medicine {
  id: string; // e.g. MED-DRUG-001
  name: string;
  genericName?: string;
  brandName: string;
  category: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment' | 'Inhaler';
  strength: string; // e.g. 500mg, 10mg/5ml
  manufacturer: string;
  batchNumber: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  expiryDate: string; // YYYY-MM-DD
  supplier?: string;
  locationRack?: string;
  storageLocation?: string;
  costPrice?: number;
  isPrescriptionRequired?: boolean;
}

export interface InvoiceItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // e.g. INV-2026-1042
  patientId?: string;
  patientName: string;
  prescriptionId?: string;
  dispensedBy: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Credit/Debit Card' | 'Insurance' | 'Net Banking';
  status: 'Paid' | 'Pending';
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  targetRole?: UserRole | 'all';
  createdAt: string;
  isRead: boolean;
  linkAction?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warn' | 'critical';
}
