import React, { useState } from 'react';
import {
  Pill,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Printer,
  Trash2,
  TrendingDown,
  Clock,
  DollarSign,
  PackageCheck,
  Edit2,
} from 'lucide-react';
import { User, Medicine, Prescription, Invoice } from '../../types';
import { MediLabStore } from '../../services/storage';

interface DispensaryDashboardProps {
  currentUser: User;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onPrintReport: (type: 'invoice' | 'rx', data: Invoice | Prescription) => void;
  searchQuery: string;
}

export const DispensaryDashboard: React.FC<DispensaryDashboardProps> = ({
  currentUser,
  activeTab,
  onNavigateTab,
  onPrintReport,
  searchQuery,
}) => {
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // POS State
  const [posPatientName, setPosPatientName] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'Cash' | 'Credit Card' | 'Insurance'>('Cash');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posCart, setPosCart] = useState<{ medicineId: string; quantity: number }[]>([]);

  // Prescription Dispense Modal
  const [selectedRxForDispense, setSelectedRxForDispense] = useState<Prescription | null>(null);

  const medicines = MediLabStore.getMedicines();
  const prescriptions = MediLabStore.getPrescriptions();
  const invoices = MediLabStore.getInvoices();
  const stats = MediLabStore.getSystemStats();

  // Add Medicine Form
  const [medFormData, setMedFormData] = useState({
    name: '',
    brandName: '',
    category: 'Antibiotics',
    dosageForm: 'Tablet' as Medicine['dosageForm'],
    strength: '',
    quantity: 100,
    reorderLevel: 30,
    unitPrice: 1250.0,
    costPrice: 850.0,
    batchNumber: 'MED-B2025-01',
    expiryDate: '2026-12-31',
    manufacturer: 'Pfizer / MediPharma',
    storageLocation: 'Shelf A-1',
    isPrescriptionRequired: true,
  });

  // Filtered lists
  const filteredMedicines = medicines.filter((m) => {
    return (
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const pendingPrescriptions = prescriptions.filter(
    (p) => p.status === 'Pending' || p.status === 'Partially Dispensed',
  );

  const lowStockMedicines = medicines.filter((m) => m.quantity <= m.reorderLevel);

  const nearExpiryMedicines = medicines.filter((m) => {
    const exp = new Date(m.expiryDate).getTime();
    const now = new Date().getTime();
    const daysUntilExpiry = (exp - now) / (1000 * 3600 * 24);
    return daysUntilExpiry <= 90; // within 90 days
  });

  // Handlers
  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!medFormData.name.trim()) throw new Error('Generic name is required');
      if (editingMedicine) {
        MediLabStore.updateMedicine(editingMedicine.id, medFormData);
        setFeedback({ text: `Medicine ${medFormData.brandName} updated successfully!`, type: 'success' });
      } else {
        MediLabStore.addMedicine(medFormData);
        setFeedback({ text: `Medicine ${medFormData.brandName} added to inventory!`, type: 'success' });
      }
      setShowAddMedModal(false);
      setEditingMedicine(null);
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleDispensePrescription = (prescription: Prescription) => {
    try {
      const inv = MediLabStore.dispensePrescription(prescription.id, currentUser.fullName);
      setFeedback({
        text: `Prescription ${prescription.id} successfully dispensed! Invoice ${inv.id} generated.`,
        type: 'success',
      });
      setSelectedRxForDispense(null);
      setTimeout(() => setFeedback(null), 4500);
      onPrintReport('invoice', inv);
    } catch (err: any) {
      setFeedback({ text: err.message, type: 'error' });
    }
  };

  const handleAddToCart = (medId: string) => {
    const existing = posCart.find((c) => c.medicineId === medId);
    const med = medicines.find((m) => m.id === medId);
    if (!med) return;

    if (existing) {
      if (existing.quantity >= med.quantity) {
        alert('Cannot add more than currently available stock!');
        return;
      }
      setPosCart(posCart.map((c) => (c.medicineId === medId ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      if (med.quantity <= 0) {
        alert('This medicine is currently out of stock!');
        return;
      }
      setPosCart([...posCart, { medicineId: medId, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (medId: string) => {
    setPosCart(posCart.filter((c) => c.medicineId !== medId));
  };

  const handleUpdateCartQty = (medId: string, qty: number) => {
    const med = medicines.find((m) => m.id === medId);
    if (!med) return;
    if (qty > med.quantity) {
      alert(`Only ${med.quantity} units available in inventory.`);
      return;
    }
    if (qty <= 0) {
      handleRemoveFromCart(medId);
      return;
    }
    setPosCart(posCart.map((c) => (c.medicineId === medId ? { ...c, quantity: qty } : c)));
  };

  // Cart Calculations
  const cartSubtotal = posCart.reduce((sum, item) => {
    const med = medicines.find((m) => m.id === item.medicineId);
    return sum + (med ? med.unitPrice * item.quantity : 0);
  }, 0);
  const cartTax = cartSubtotal * 0.05;
  const cartTotal = Math.max(0, cartSubtotal + cartTax - posDiscount);

  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (posCart.length === 0) throw new Error('Cart is empty. Add medicines first.');
      if (!posPatientName.trim()) throw new Error('Please enter customer / patient name.');

      const invoiceItems = posCart.map((c) => {
        const med = medicines.find((m) => m.id === c.medicineId)!;
        return {
          medicineId: med.id,
          medicineName: `${med.brandName} (${med.strength})`,
          quantity: c.quantity,
          unitPrice: med.unitPrice,
          total: med.unitPrice * c.quantity,
        };
      });

      const inv = MediLabStore.createInvoice({
        patientName: posPatientName.trim(),
        items: invoiceItems,
        subtotal: cartSubtotal,
        tax: cartTax,
        discount: posDiscount,
        totalAmount: cartTotal,
        paymentMethod: posPaymentMethod,
        dispensedBy: currentUser.fullName,
      });

      setFeedback({
        text: `Sale finalized! Invoice ${inv.id} generated for ₹${inv.totalAmount.toFixed(2)}.`,
        type: 'success',
      });
      setPosCart([]);
      setPosPatientName('');
      setPosDiscount(0);
      setTimeout(() => setFeedback(null), 4000);
      onPrintReport('invoice', inv);
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

      {/* Dispensary Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1594824813589-fb5ff52b95c3?auto=format&fit=crop&w=128&q=80'}
            alt={currentUser.fullName}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{currentUser.fullName}</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Dispensary Pharmacist
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Central Pharmacy &amp; Drug Formulary • Unique Code: <span className="font-mono text-teal-300 font-bold">{currentUser.uniqueCode}</span>
            </p>
          </div>
        </div>

        {/* Quick Dispensary Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('pos')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 shadow-sm transition"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            Walk-in POS Billing
          </button>
          <button
            onClick={() => {
              setEditingMedicine(null);
              setShowAddMedModal(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add New Medicine
          </button>
        </div>
      </div>

      {/* VIEW: DISPENSARY OVERVIEW */}
      {(activeTab === 'overview' || !activeTab) && (
        <>
          {/* Pharmacy Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Prescriptions in Queue</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{pendingPrescriptions.length}</div>
              <div className="text-[10px] text-teal-600 font-medium mt-1">Awaiting patient pickup</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Available Inventory</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{medicines.length}</div>
              <div className="text-[10px] text-slate-400 mt-1">Active drug items</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs bg-amber-50/20">
              <div className="text-xs font-semibold text-amber-700 uppercase">Low Stock Alert</div>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">{lowStockMedicines.length}</div>
              <div className="text-[10px] text-amber-700 font-medium mt-1">Below minimum threshold</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-400 uppercase">Completed Dispenses</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{invoices.length}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">Invoices issued</div>
            </div>
          </div>

          {/* Pending Prescription Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Doctor Prescriptions Transmitted For Dispensing</h3>
                <p className="text-xs text-slate-400">Review requested items, verify inventory sufficiency, and dispense</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">{pendingPrescriptions.length} Pending</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Rx ID</th>
                    <th className="p-3.5">Patient Details</th>
                    <th className="p-3.5">Prescribing Physician</th>
                    <th className="p-3.5">Medication Items</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingPrescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{rx.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{rx.patientName}</div>
                        <div className="text-[11px] text-slate-400">Diagnosis: {rx.diagnosis}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{rx.doctorName}</div>
                        <div className="text-[10px] text-slate-400">{rx.doctorSpecialty}</div>
                      </td>
                      <td className="p-3.5 text-slate-700">
                        {(rx.items || []).map((i) => `${i.medicineName} x ${i.quantity}`).join(', ')}
                      </td>
                      <td className="p-3.5 text-slate-500">{rx.date}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDispensePrescription(rx)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                          Verify &amp; Dispense
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW: MEDICINE INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Drug Store Medicine Inventory Master</h3>
              <p className="text-xs text-slate-400">Current stock units, batch identifiers, expiry dates, and pricing</p>
            </div>
            <button
              onClick={() => {
                setEditingMedicine(null);
                setShowAddMedModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 self-start"
            >
              <Plus className="w-4 h-4" />
              Add Medicine
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Brand &amp; Generic Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Batch / Expiry</th>
                  <th className="p-3.5">Unit Price (₹)</th>
                  <th className="p-3.5">Stock Level</th>
                  <th className="p-3.5">Storage Bin</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((m) => {
                  const isLow = m.quantity <= m.reorderLevel;
                  const isZero = m.quantity <= 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{m.brandName}</div>
                        <div className="text-[11px] text-slate-500">
                          {m.name} ({m.strength}) • {m.dosageForm}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600">{m.category}</td>
                      <td className="p-3.5 font-mono text-slate-600">
                        <div>{m.batchNumber}</div>
                        <div className="text-[10px] text-slate-400">Exp: {m.expiryDate}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">₹{m.unitPrice.toFixed(2)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              isZero
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {m.quantity} in stock
                          </span>
                          {isLow && !isZero && (
                            <span className="text-[10px] text-amber-600 font-bold">LOW</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500">{m.storageLocation}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setEditingMedicine(m);
                            setMedFormData({
                              name: m.name,
                              brandName: m.brandName,
                              category: m.category,
                              dosageForm: m.dosageForm,
                              strength: m.strength,
                              quantity: m.quantity,
                              reorderLevel: m.reorderLevel,
                              unitPrice: m.unitPrice,
                              costPrice: m.costPrice,
                              batchNumber: m.batchNumber,
                              expiryDate: m.expiryDate,
                              manufacturer: m.manufacturer,
                              storageLocation: m.storageLocation,
                              isPrescriptionRequired: m.isPrescriptionRequired,
                            });
                            setShowAddMedModal(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: POINT OF SALE (POS) BILLING */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medicine Selection Grid */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Walk-In Dispensary Point of Sale</h3>
              <p className="text-xs text-slate-400">Click medicines to add to the customer cart</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredMedicines.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleAddToCart(m.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    m.quantity <= 0
                      ? 'opacity-40 border-slate-200 bg-slate-50 pointer-events-none'
                      : 'border-slate-200 bg-white hover:border-teal-500 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs truncate">{m.brandName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{m.name} ({m.strength})</div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 mt-1">
                      {m.dosageForm}
                    </span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-teal-800 text-xs">₹{m.unitPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">Stock: {m.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart & Checkout Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Customer Cart ({posCart.length})</h3>
                {posCart.length > 0 && (
                  <button
                    onClick={() => setPosCart([])}
                    className="text-[11px] text-rose-600 hover:underline font-semibold"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Patient Name *</label>
                <input
                  type="text"
                  required
                  value={posPatientName}
                  onChange={(e) => setPosPatientName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
                />
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {posCart.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">Cart is empty</div>
                ) : (
                  posCart.map((item) => {
                    const med = medicines.find((m) => m.id === item.medicineId);
                    if (!med) return null;
                    return (
                      <div
                        key={item.medicineId}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-800 truncate">{med.brandName}</div>
                          <div className="text-slate-400 text-[10px]">₹{med.unitPrice.toFixed(2)} / unit</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max={med.quantity}
                            value={item.quantity}
                            onChange={(e) => handleUpdateCartQty(item.medicineId, Number(e.target.value))}
                            className="w-12 px-1.5 py-1 text-center bg-white border border-slate-300 rounded text-xs font-bold"
                          />
                          <button
                            onClick={() => handleRemoveFromCart(item.medicineId)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={posPaymentMethod}
                  onChange={(e) => setPosPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="Credit/Debit Card">Credit / Debit Card</option>
                  <option value="Insurance">Insurance / Third Party</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              {/* Totals */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax (5%):</span>
                  <span>₹{cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount (₹):</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={posDiscount}
                    onChange={(e) => setPosDiscount(Number(e.target.value))}
                    className="w-20 px-2 py-0.5 text-right border border-slate-300 rounded bg-slate-50 font-bold"
                  />
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>Total Amount:</span>
                  <span className="text-teal-700">₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteSale}
              disabled={posCart.length === 0}
              className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white shadow-xs transition flex items-center justify-center gap-2"
            >
              <PackageCheck className="w-4 h-4" />
              Complete Sale &amp; Print Bill
            </button>
          </div>
        </div>
      )}

      {/* VIEW: INVOICES & SALES HISTORY */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pharmacy Invoices &amp; Dispensing Ledger</h3>
              <p className="text-xs text-slate-400">Complete audit trail of sales, prescription fulfillments, and tax</p>
            </div>
            <span className="text-xs font-bold text-slate-700">{invoices.length} Invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Customer / Patient</th>
                  <th className="p-3.5">Items Dispensed</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Total Amount</th>
                  <th className="p-3.5 text-right">Print Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono font-bold text-teal-700">{inv.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{inv.patientName}</td>
                    <td className="p-3.5 text-slate-600">
                      {(inv.items || []).map((i) => `${i.medicineName} x ${i.quantity}`).join(', ')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right font-black text-slate-900">
                      ₹{inv.totalAmount.toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onPrintReport('invoice', inv)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: EXPIRY & LOW-STOCK ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Low Stock Warning */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden">
            <div className="p-5 bg-amber-50/50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                  Critical Low Stock Warning ({lowStockMedicines.length})
                </h3>
              </div>
              <span className="text-xs font-semibold text-amber-800">Immediate supplier reorder required</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Medicine</th>
                    <th className="p-3.5">Remaining Stock</th>
                    <th className="p-3.5">Reorder Level</th>
                    <th className="p-3.5">Supplier / Manufacturer</th>
                    <th className="p-3.5 text-right">Reorder Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lowStockMedicines.map((m) => (
                    <tr key={m.id} className="hover:bg-amber-50/20">
                      <td className="p-3.5 font-bold text-slate-900">
                        {m.brandName} ({m.name})
                      </td>
                      <td className="p-3.5 font-bold text-rose-700">{m.quantity} Units</td>
                      <td className="p-3.5 text-slate-600">{m.reorderLevel} Units</td>
                      <td className="p-3.5 text-slate-600">{m.manufacturer}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            MediLabStore.updateMedicine(m.id, { quantity: m.quantity + 100 });
                            setFeedback({ text: `Restocked 100 units of ${m.brandName}!`, type: 'success' });
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        >
                          +100 Restock Quick
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Near Expiry Alert */}
          <div className="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
            <div className="p-5 bg-rose-50/50 border-b border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-rose-900 uppercase tracking-wider">
                  Upcoming Expiration Alerts (Within 90 Days)
                </h3>
              </div>
              <span className="text-xs font-semibold text-rose-800">{nearExpiryMedicines.length} batches detected</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Medicine</th>
                    <th className="p-3.5">Batch Number</th>
                    <th className="p-3.5">Expiry Date</th>
                    <th className="p-3.5">Units in Storage</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nearExpiryMedicines.map((m) => (
                    <tr key={m.id}>
                      <td className="p-3.5 font-bold text-slate-900">{m.brandName}</td>
                      <td className="p-3.5 font-mono text-slate-600">{m.batchNumber}</td>
                      <td className="p-3.5 font-bold text-rose-700">{m.expiryDate}</td>
                      <td className="p-3.5 font-semibold text-slate-800">{m.quantity}</td>
                      <td className="p-3.5 text-right">
                        <span className="text-xs text-slate-400">Flagged for return</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MEDICINE */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingMedicine ? 'Update Medicine Details' : 'Add New Medicine to Formulary'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Set generic name, strength, batch and stock reorder level</p>

            <form onSubmit={handleSaveMedicine} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={medFormData.brandName}
                    onChange={(e) => setMedFormData({ ...medFormData, brandName: e.target.value })}
                    placeholder="e.g. Augmentin"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Generic Name *</label>
                  <input
                    type="text"
                    required
                    value={medFormData.name}
                    onChange={(e) => setMedFormData({ ...medFormData, name: e.target.value })}
                    placeholder="e.g. Amoxicillin / Clavulanate"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={medFormData.category}
                    onChange={(e) => setMedFormData({ ...medFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Form</label>
                  <select
                    value={medFormData.dosageForm}
                    onChange={(e) => setMedFormData({ ...medFormData, dosageForm: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Ointment">Ointment</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Strength</label>
                  <input
                    type="text"
                    value={medFormData.strength}
                    onChange={(e) => setMedFormData({ ...medFormData, strength: e.target.value })}
                    placeholder="e.g. 625mg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={medFormData.quantity}
                    onChange={(e) => setMedFormData({ ...medFormData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={medFormData.reorderLevel}
                    onChange={(e) => setMedFormData({ ...medFormData, reorderLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Retail Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={medFormData.unitPrice}
                    onChange={(e) => setMedFormData({ ...medFormData, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={medFormData.batchNumber}
                    onChange={(e) => setMedFormData({ ...medFormData, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={medFormData.expiryDate}
                    onChange={(e) => setMedFormData({ ...medFormData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Save Medicine Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
