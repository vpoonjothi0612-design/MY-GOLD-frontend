import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addPurchase, getEntitlementStatus } from '../services/api';
import { useGoldRate } from '../context/GoldRateContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { FiCheckCircle, FiImage, FiFileText, FiX, FiUploadCloud, FiAward } from 'react-icons/fi';

export const AddGold = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getLiveRate, rate24K, rate22K, rate18K, silverRate, silverRate925 } = useGoldRate();
  const [submitting, setSubmitting] = useState(false);
  const [assetType, setAssetType] = useState('GOLD');

  const todayString = new Date().toLocaleDateString('en-CA');

  const [formData, setFormData] = useState({
    itemName: '',
    purity: '22K',
    weight: '',
    purchaseDate: todayString,
    purchaseRate: '',
  });

  const handleAssetTypeChange = (newType) => {
    if (newType === assetType) return;
    setAssetType(newType);
    setFormData((prev) => ({
      ...prev,
      itemName: '',
      purity: newType === 'SILVER' ? '999' : '22K',
      weight: '',
      purchaseRate: '',
    }));
    setTouched({});
    setErrors({});
  };

  const currentSuggestions = assetType === 'GOLD' 
    ? ['Gold Chain', 'Gold Coin', 'Bullion Bar', 'Gold Ring', 'Gold Bangle']
    : ['Silver Coin', 'Silver Bar', 'Silver Chain', 'Silver Utensil'];

  const [jewelleryFile, setJewelleryFile] = useState(null);
  const [jewelleryPreview, setJewelleryPreview] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null);

  const jewelleryInputRef = useRef(null);
  const invoiceInputRef = useRef(null);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [entitlement, setEntitlement] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    checkEntitlement();
  }, []);

  const checkEntitlement = async () => {
    try {
      const res = await getEntitlementStatus();
      if (res && res.data) {
        setEntitlement(res.data);
        if (!res.data.canCreate) {
          setShowUpgradeModal(true);
        }
      }
    } catch (error) {
      console.error('Failed to check entitlement:', error);
    }
  };

  const sanitizeDecimalInput = (rawVal, maxDecimals = 3) => {
    if (!rawVal) return '';
    let sanitized = rawVal.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = `${parts[0]}.${parts.slice(1).join('')}`;
    }
    const [whole, decimal] = sanitized.split('.');
    if (decimal !== undefined) {
      return `${whole}.${decimal.slice(0, maxDecimals)}`;
    }
    return sanitized;
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'itemName':
        if (!value || !value.trim()) return 'Name is required.';
        return null;
      case 'weight': {
        if (!value || value === '') return 'Weight is required.';
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) return 'Invalid weight.';
        return null;
      }
      case 'purchaseDate': {
        if (!value) return 'Date is required.';
        return null;
      }
      case 'purchaseRate': {
        if (!value || value === '') return 'Rate is required.';
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) return 'Invalid rate.';
        return null;
      }
      default:
        return null;
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'weight') finalValue = sanitizeDecimalInput(value, 3);
    if (name === 'purchaseRate') finalValue = sanitizeDecimalInput(value, 2);

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (touched[name]) {
      const errorMsg = validateField(name, finalValue);
      setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    }
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Re-verify entitlement before submission
    if (entitlement && !entitlement.canCreate) {
      setShowUpgradeModal(true);
      return;
    }

    const newErrors = {};
    ['itemName', 'weight', 'purchaseDate', 'purchaseRate'].forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setTouched({ itemName: true, weight: true, purchaseDate: true, purchaseRate: true });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please resolve errors.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(`Depositing asset...`);

    try {
      const dataPayload = new FormData();
      dataPayload.append('asset_type', assetType);
      dataPayload.append('assetType', assetType);
      dataPayload.append('gold_name', formData.itemName.trim());
      dataPayload.append('itemName', formData.itemName.trim());
      dataPayload.append('gold_purity', formData.purity);
      dataPayload.append('purity', formData.purity);
      dataPayload.append('weight', parseFloat(formData.weight));
      dataPayload.append('purchase_date', formData.purchaseDate);
      dataPayload.append('purchase_rate', parseFloat(formData.purchaseRate));

      if (invoiceFile) dataPayload.append('invoice', invoiceFile);
      if (jewelleryFile) dataPayload.append('jewelleryPhoto', jewelleryFile);

      await addPurchase(dataPayload);
      toast.success(`Asset successfully locked in vault!`, { id: toastId });
      navigate('/my-gold');
    } catch (err) {
      if (err.response?.data?.code === 'FREE_LIMIT_REACHED' || err.response?.status === 402) {
        toast.dismiss(toastId);
        setShowUpgradeModal(true);
      } else {
        toast.error(err.response?.data?.message || `Failed to add asset.`, { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isPaid = entitlement?.status === 'PAID' || user?.plan === 'paid' || user?.subscription_status === 'active' || user?.role === 'admin';
  const entriesCount = entitlement?.entriesUsed ?? (user?.free_entries_used || 0);

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-24 px-4 animate-fade-in">
      {/* 10-Entry Limit Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[var(--bg-card)] dark:bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto text-2xl font-heading">
              👑
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              10 Free Entries Reached
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              You have completed all 10 free Gold and Silver entries. Upgrade to <b>Premium Monthly AutoPay</b> to unlock unlimited asset entries and cloud vault storage.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => navigate('/upgrade')}
                className="w-full py-3.5 rounded-xl bg-gold-metallic text-slate-950 font-black text-sm shadow-md font-heading cursor-pointer hover:bg-gold-metallic-hover transition-colors"
              >
                Upgrade to Premium Monthly
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  navigate('/my-gold');
                }}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-300 font-semibold"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Free Usage Tracker */}
      <div className="flex items-center justify-between">
        <div>
          {isPaid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-metallic text-slate-950 font-black text-[11px] font-heading shadow-xs">
              <span>👑 PREMIUM MONTHLY VAULT</span>
              <span className="text-[10px] opacity-80">• Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-[11px] font-heading">
              <span>{entriesCount} / 10 Free Entries Used</span>
            </span>
          )}
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
          Add Asset Entry
        </h1>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleAssetTypeChange('GOLD')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer font-heading ${
            assetType === 'GOLD' ? 'bg-gold-metallic text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          🪙 Gold Bullion & Jewelry
        </button>
        <button
          type="button"
          onClick={() => handleAssetTypeChange('SILVER')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer font-heading ${
            assetType === 'SILVER' ? 'bg-slate-200 dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          🥈 Silver Bullion & Articles
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Asset Details</h2>
          
          {/* Item Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Item Name</label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleTextChange}
              onBlur={handleBlur}
              placeholder="e.g. Gold Chain"
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none"
            />
            {errors.itemName && <p className="text-xs text-rose-500 mt-1">{errors.itemName}</p>}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {currentSuggestions.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleTextChange({ target: { name: 'itemName', value: label } })}
                  className="px-2.5 py-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Purity */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Purity Standard</label>
            <div className="flex flex-wrap gap-2">
              {(assetType === 'GOLD' ? ['24K', '22K', '18K'] : ['999', '925', '916', '900']).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, purity: p }))}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    formData.purity === p 
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600'
                  }`}
                >
                  {assetType === 'SILVER' && p !== '999' ? `${p} Silver` : p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Weight (grams)</label>
              <input
                type="text"
                name="weight"
                inputMode="decimal"
                value={formData.weight}
                onChange={handleTextChange}
                onBlur={handleBlur}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none"
              />
              {errors.weight && <p className="text-xs text-rose-500 mt-1">{errors.weight}</p>}
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Purchase Rate (₹/g)</label>
              <input
                type="text"
                name="purchaseRate"
                inputMode="decimal"
                value={formData.purchaseRate}
                onChange={handleTextChange}
                onBlur={handleBlur}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none"
              />
              {errors.purchaseRate && <p className="text-xs text-rose-500 mt-1">{errors.purchaseRate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Acquisition Date</label>
            <input
              type="date"
              name="purchaseDate"
              max={todayString}
              value={formData.purchaseDate}
              onChange={handleTextChange}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">Documents</h2>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Invoice</span>
            <input type="file" ref={invoiceInputRef} onChange={(e) => handleFileChange(e, setInvoiceFile, setInvoicePreview)} className="hidden" accept=".pdf,image/*" />
            <button type="button" onClick={() => invoiceInputRef.current?.click()} className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg">
              {invoiceFile ? invoiceFile.name.substring(0,15)+'...' : 'Upload'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Asset Photo</span>
            <input type="file" ref={jewelleryInputRef} onChange={(e) => handleFileChange(e, setJewelleryFile, setJewelleryPreview, true)} className="hidden" accept="image/*" />
            <button type="button" onClick={() => jewelleryInputRef.current?.click()} className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg">
              {jewelleryFile ? jewelleryFile.name.substring(0,15)+'...' : 'Upload'}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm btn-premium gold-glow-sm"
          >
            {submitting ? 'Saving...' : 'Save Asset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddGold;
