'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/state';
import {
  Store,
  ChefHat,
  Utensils,
  Calculator,
  LayoutGrid,
  Users,
  Package,
  BarChart3,
  Camera,
  Printer,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Receipt,
  CreditCard,
  QrCode,
  ShieldCheck,
  TrendingDown,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  AlertCircle,
  FileCheck,
  Check,
  Loader2,
  Eye,
} from 'lucide-react';
import { BusinessType, ModuleToken } from '@platform/types';

export default function CompleteOnboardingWizard() {
  const router = useRouter();
  const { profile, setProfile, setBusinessType, enabledModules, toggleModule, currentTenant } = useApp();

  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // STEP 01: Business Type
  const [bType, setBType] = useState<BusinessType>('RESTAURANT');

  // STEP 02: Restaurant Information
  const [name, setName] = useState<string>(profile.businessName || '');
  const [phone, setPhone] = useState<string>(profile.phone || '');
  const [email, setEmail] = useState<string>(profile.email || '');
  const [address, setAddress] = useState<string>(profile.address || '');
  const [city, setCity] = useState<string>(profile.city || '');
  const [state, setState] = useState<string>(profile.state || '');
  const [country, setCountry] = useState<string>('India');
  const [currency, setCurrency] = useState<string>('INR');
  const [timezone, setTimezone] = useState<string>('Asia/Kolkata');

  // STEP 03: Restaurant Logo (Supabase Storage)
  const [logoUrl, setLogoUrl] = useState<string>(profile.logoUrl || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // STEP 04: Restaurant Services
  const [services, setServices] = useState<string[]>([
    'Dine In',
    'Takeaway',
    'Delivery',
    'Online Ordering',
    'Counter Ordering',
  ]);

  // STEP 05: Module Selection
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'POS',
    'TABLES',
    'ORDERS',
    'KITCHEN',
    'MENU',
    'BILLING',
    'PAYMENTS',
    'INVENTORY',
    'CUSTOMERS',
    'STAFF',
    'EXPENSES',
    'REPORTS',
    'QR',
    'PRINTERS',
    'AI_MENU_IMPORT',
  ]);

  // STEP 06: Table Configuration
  const [usesTables, setUsesTables] = useState<boolean>(true);
  const [tableCount, setTableCount] = useState<number>(0);
  const [tableSections, setTableSections] = useState<string[]>([]);
  const [newSectionName, setNewSectionName] = useState<string>('');

  // STEP 07: Staff Configuration
  const [hasEmployees, setHasEmployees] = useState<boolean>(false);
  const [staffList, setStaffList] = useState<Array<{ name: string; role: string; phone: string }>>([]);
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<string>('WAITER');

  // STEP 08: Menu Configuration (Manual or Gemini AI)
  const [menuMode, setMenuMode] = useState<'MANUAL' | 'AI'>('AI');
  const [aiMenuRawText, setAiMenuRawText] = useState<string>('');
  const [aiParsing, setAiParsing] = useState<boolean>(false);
  const [aiParsedCategories, setAiParsedCategories] = useState<any[]>([]);

  // STEP 09: Billing Configuration
  const [taxRate, setTaxRate] = useState<number>(5);
  const [serviceCharge, setServiceCharge] = useState<number>(0);
  const [roundOff, setRoundOff] = useState<boolean>(true);
  const [invoicePrefix, setInvoicePrefix] = useState<string>('INV-2026-');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([
    'Cash',
    'UPI (PhonePe, GPay, Paytm)',
    'Credit/Debit Card',
    'Food Vouchers',
  ]);

  // STEP 10: Printer Configuration
  const [printerType, setPrinterType] = useState<string>('THERMAL_80MM');
  const [kotPrinter, setKotPrinter] = useState<boolean>(true);
  const [networkIp, setNetworkIp] = useState<string>('192.168.1.100');

  // Handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 10MB) and type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size exceeds 10MB limit.');
      return;
    }

    setUploadError(null);
    setUploadingLogo(true);
    setLogoFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logos');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setLogoUrl(data.publicUrl);
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setUploadError(err.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRunAiMenu = async () => {
    if (!aiMenuRawText.trim()) return;
    setAiParsing(true);
    try {
      const res = await fetch('/api/ai/menu-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: aiMenuRawText }),
      });
      const data = await res.json();
      if (res.ok && data.categories) {
        setAiParsedCategories(data.categories);
      }
    } catch (err) {
      console.error('AI OCR error:', err);
    } finally {
      setAiParsing(false);
    }
  };

  const toggleService = (s: string) => {
    setServices((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const toggleModuleSelection = (token: string) => {
    setSelectedModules((prev) =>
      prev.includes(token) ? prev.filter((item) => item !== token) : [...prev, token]
    );
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    setTableSections([...tableSections, newSectionName.trim()]);
    setNewSectionName('');
  };

  const handleAddStaff = () => {
    if (!newStaffName.trim()) return;
    setStaffList([
      ...staffList,
      { name: newStaffName.trim(), role: newStaffRole, phone: '+91 98000 00000' },
    ]);
    setNewStaffName('');
  };

  // STEP 11: Final Review & Save to Database
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        tenantId: profile.tenantId,
        businessType: bType,
        businessName: name,
        phone,
        email,
        address,
        city,
        state,
        country,
        currency,
        timezone,
        logoUrl,
        services,
        modules: selectedModules,
        hasTables: usesTables,
        tableCount: usesTables ? tableCount : 0,
        tableSections: usesTables ? tableSections : [],
        hasEmployees,
        employees: hasEmployees ? staffList : [],
        billingConfig: {
          taxRate,
          serviceCharge,
          roundOff,
          invoicePrefix,
          paymentMethods,
        },
        printerConfig: {
          printerType,
          kotPrinter,
          networkIp,
        },
        initialMenu: menuMode === 'AI' ? aiParsedCategories : [],
      };

      const res = await fetch('/api/tenant/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save onboarding configuration.');
      }

      // Update local state
      setBusinessType(bType);
      setProfile({
        ...profile,
        businessName: name,
        phone,
        email,
        address,
        city,
        country,
        currencyCode: currency,
        currencySymbol: currency === 'USD' ? '$' : '₹',
        timezone,
        logoUrl,
        onboardingCompleted: true,
      });

      if (currentTenant?.slug) {
        router.push(`/${currentTenant.slug}/dashboard`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Onboarding final submit error:', err);
      alert(err.message || 'Failed to save configuration to database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-main flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-button">
              <Store className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-heading">Restaurant Setup Wizard</h1>
              <p className="text-xs text-secondary">Step {step} of 11: Production V1 System</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">
            {Math.round((step / 11) * 100)}% Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surfaceMuted border border-borderLight h-2 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${(step / 11) * 100}%` }}
          />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="card p-6 sm:p-8 space-y-6">

          {/* STEP 01: Business Type */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 01</span>
                <h2 className="text-lg font-bold text-heading mt-1">Select Your Business Model</h2>
                <p className="text-xs text-secondary mt-1">
                  The SaaS platform dynamically tailors its POS, kitchen screens, and menus to your business model.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { type: 'RESTAURANT', name: 'Fine / Casual Dine-in', icon: '🍽️', desc: 'Table service, KOTs, split checks' },
                  { type: 'CAFE', name: 'Cafe & Bistro', icon: '☕', desc: 'Barista stations, pastry counter' },
                  { type: 'BAKERY', name: 'Bakery & Patisserie', icon: '🥐', desc: 'Weight-based sales, retail items' },
                  { type: 'FAST_FOOD', name: 'Fast Food / QSR', icon: '🍔', desc: 'High-speed billing, order tokens' },
                  { type: 'CLOUD_KITCHEN', name: 'Cloud Kitchen', icon: '🛵', desc: 'Zomato/Swiggy dispatch, delivery' },
                  { type: 'FOOD_COURT', name: 'Food Court Outlet', icon: '🏬', desc: 'Rapid counter tokens & buzzer' },
                  { type: 'BAR', name: 'Bar & Lounge', icon: '🍸', desc: 'Open tabs, drink inventory, lounge' },
                  { type: 'CUSTOM', name: 'Other Food Venture', icon: '✨', desc: 'Fully configurable workflows' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      const newType = item.type as BusinessType;
                      setBType(newType);
                      if (newType === 'CLOUD_KITCHEN' || newType === 'BAKERY' || newType === 'FOOD_COURT') {
                        setUsesTables(false);
                        setSelectedModules((prev) => prev.filter((m) => m !== 'TABLES'));
                      } else {
                        setUsesTables(true);
                        setSelectedModules((prev) => (prev.includes('TABLES') ? prev : [...prev, 'TABLES']));
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      bType === item.type
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                        : 'border-borderLight hover:border-borderDark hover:bg-surfaceMuted'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{item.icon}</span>
                    <span className="text-xs font-bold text-heading block">{item.name}</span>
                    <span className="text-[11px] text-secondary mt-0.5 block leading-tight">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 02: Restaurant Information */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 02</span>
                <h2 className="text-lg font-bold text-heading mt-1">Restaurant Profile & Location</h2>
                <p className="text-xs text-secondary mt-1">
                  Official contact details printed on customer receipts and tax invoices.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-heading block mb-1">Restaurant Legal / Trade Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="e.g. The Spice Symphony"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">Official Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    placeholder="+91 98450 11223"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">Manager / Billing Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="manager@spicesymphony.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-heading block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field"
                    placeholder="42, MG Road, Indiranagar"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field"
                    placeholder="Bengaluru"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">Currency & Region</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input-field"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="AED">AED (د.إ - UAE Dirham)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 03: Restaurant Logo (Supabase Storage) */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 03</span>
                <h2 className="text-lg font-bold text-heading mt-1">Restaurant Brand Logo</h2>
                <p className="text-xs text-secondary mt-1">
                  Uploaded directly to Supabase Storage (<code className="text-primary font-mono text-[11px]">restaurant-assets</code>). Survives refresh, logout, and device reboot.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border-2 border-dashed border-borderLight rounded-2xl bg-surfaceMuted/50 text-center sm:text-left">
                {logoUrl ? (
                  <div className="relative group">
                    <img
                      src={logoUrl}
                      alt="Brand Logo"
                      className="w-28 h-28 object-contain rounded-xl border border-borderLight bg-white p-2 shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs font-medium">Uploaded</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-xl border border-borderLight bg-white flex flex-col items-center justify-center text-secondary">
                    {uploadingLogo ? (
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                      <Store className="w-10 h-10 stroke-[1.5] text-secondaryMuted" />
                    )}
                    <span className="text-[11px] mt-1 text-secondary">No logo</span>
                  </div>
                )}

                <div className="space-y-2 flex-1">
                  <h4 className="text-sm font-semibold text-heading">Upload Logo File</h4>
                  <p className="text-xs text-secondary">
                    Recommended dimensions: 512x512px. Formats: PNG, JPG, WebP or SVG up to 10MB.
                  </p>
                  <label className="inline-flex items-center space-x-2 btn-secondary cursor-pointer text-xs py-2 px-3">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingLogo ? 'Uploading to Supabase...' : 'Choose Logo File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                  {logoUrl && (
                    <p className="text-[11px] text-green-600 font-medium flex items-center mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Logo securely stored on Supabase CDN.
                    </p>
                  )}
                  {uploadError && (
                    <p className="text-[11px] text-rose-600 font-medium flex items-center mt-2">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" />
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 04: Restaurant Services */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 04</span>
                <h2 className="text-lg font-bold text-heading mt-1">Operational Dining Services</h2>
                <p className="text-xs text-secondary mt-1">
                  Select which dining channels your restaurant supports. The POS creates order filters accordingly.
                </p>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: 'Dine In', desc: 'Customers seated at designated tables with waiter service' },
                  { name: 'Takeaway', desc: 'Customers ordering food packed to go at pickup counter' },
                  { name: 'Delivery', desc: 'Direct restaurant delivery or integration with rider fleets' },
                  { name: 'Online Ordering', desc: 'Incoming orders from digital QR menu and website' },
                  { name: 'Counter Ordering', desc: 'Express counter payment with food token slips' },
                ].map((s) => {
                  const active = services.includes(s.name);
                  return (
                    <div
                      key={s.name}
                      onClick={() => toggleService(s.name)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        active
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-borderLight hover:bg-surfaceMuted'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-heading block">{s.name}</span>
                        <span className="text-[11px] text-secondary">{s.desc}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          active ? 'bg-primary border-primary text-white' : 'border-borderLight bg-white'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 05: Module Selection */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 05</span>
                <h2 className="text-lg font-bold text-heading mt-1">Platform Modules Activation</h2>
                <p className="text-xs text-secondary mt-1">
                  Enable only the features required for your staff. Inactive modules will not appear in the sidebar.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {[
                  { token: 'POS', name: 'POS Terminal', icon: <Calculator className="w-4 h-4" /> },
                  { token: 'TABLES', name: 'Table Floor Map', icon: <LayoutGrid className="w-4 h-4" /> },
                  { token: 'ORDERS', name: 'Live Orders', icon: <Utensils className="w-4 h-4" /> },
                  { token: 'KITCHEN', name: 'Kitchen KDS', icon: <ChefHat className="w-4 h-4" /> },
                  { token: 'MENU', name: 'Menu Catalog', icon: <Store className="w-4 h-4" /> },
                  { token: 'BILLING', name: 'Tax Billing', icon: <Receipt className="w-4 h-4" /> },
                  { token: 'PAYMENTS', name: 'Payments & Split', icon: <CreditCard className="w-4 h-4" /> },
                  { token: 'INVENTORY', name: 'Inventory & Stock', icon: <Package className="w-4 h-4" /> },
                  { token: 'CUSTOMERS', name: 'CRM & Loyalty', icon: <Users className="w-4 h-4" /> },
                  { token: 'STAFF', name: 'Staff & Roles', icon: <ShieldCheck className="w-4 h-4" /> },
                  { token: 'EXPENSES', name: 'Petty Cash', icon: <TrendingDown className="w-4 h-4" /> },
                  { token: 'REPORTS', name: 'Sales Analytics', icon: <BarChart3 className="w-4 h-4" /> },
                  { token: 'QR', name: 'Table QR Ordering', icon: <QrCode className="w-4 h-4" /> },
                  { token: 'PRINTERS', name: 'Thermal KOT Printing', icon: <Printer className="w-4 h-4" /> },
                  { token: 'AI_MENU_IMPORT', name: 'Gemini AI OCR', icon: <Sparkles className="w-4 h-4" /> },
                ].map((mod) => {
                  const active = selectedModules.includes(mod.token);
                  return (
                    <button
                      key={mod.token}
                      type="button"
                      onClick={() => toggleModuleSelection(mod.token)}
                      className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                          : 'border-borderLight hover:bg-surfaceMuted text-secondary'
                      }`}
                    >
                      <div className={active ? 'text-primary' : 'text-secondaryMuted'}>{mod.icon}</div>
                      <span className="text-xs truncate">{mod.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 06: Table Configuration */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 06</span>
                <h2 className="text-lg font-bold text-heading mt-1">Table & Seating Layout</h2>
                <p className="text-xs text-secondary mt-1">
                  Does your restaurant operate designated dining tables?
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setUsesTables(true)}
                  className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                    usesTables
                      ? 'border-primary bg-primary/5 font-bold text-primary ring-2 ring-primary/20'
                      : 'border-borderLight hover:bg-surfaceMuted'
                  }`}
                >
                  <LayoutGrid className="w-6 h-6 mx-auto mb-1 stroke-[2]" />
                  <span className="text-xs block">Yes, we have tables</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUsesTables(false)}
                  className={`flex-1 p-4 rounded-xl border text-center transition-all ${
                    !usesTables
                      ? 'border-primary bg-primary/5 font-bold text-primary ring-2 ring-primary/20'
                      : 'border-borderLight hover:bg-surfaceMuted'
                  }`}
                >
                  <Store className="w-6 h-6 mx-auto mb-1 stroke-[2]" />
                  <span className="text-xs block">No, quick counter only</span>
                </button>
              </div>

              {usesTables && (
                <div className="space-y-4 pt-2 border-t border-borderLight">
                  <div>
                    <label className="text-xs font-semibold text-heading block mb-1">
                      Total Seating Tables Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={tableCount}
                      onChange={(e) => setTableCount(Number(e.target.value))}
                      className="input-field max-w-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-heading block mb-1">
                      Table Sections & Dining Areas
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tableSections.map((sec, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center text-xs px-2.5 py-1 bg-surfaceMuted border border-borderLight rounded-lg text-heading"
                        >
                          {sec}
                          <button
                            type="button"
                            onClick={() => setTableSections(tableSections.filter((_, i) => i !== idx))}
                            className="ml-1.5 text-secondary hover:text-rose-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="Add area (e.g. VIP Lounge, Rooftop)"
                        className="input-field text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="btn-secondary text-xs px-3"
                      >
                        Add Area
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 07: Staff Configuration */}
          {step === 7 && (
            <div className="space-y-5">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 07</span>
                <h2 className="text-lg font-bold text-heading mt-1">Staff Team & Employee Roles</h2>
                <p className="text-xs text-secondary mt-1">
                  Configure workers who will be operating the POS terminal, taking orders, and cooking.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-borderLight bg-surfaceMuted/50">
                <div>
                  <span className="text-xs font-bold text-heading block">Do you have employees?</span>
                  <span className="text-[11px] text-secondary">
                    If solo, you can skip creating additional logins.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={hasEmployees}
                  onChange={(e) => setHasEmployees(e.target.checked)}
                  className="w-4 h-4 rounded text-primary"
                />
              </div>

              {hasEmployees && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {staffList.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-borderLight bg-surface"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {s.name[0]}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-heading block">{s.name}</span>
                            <span className="text-[10px] text-secondary">{s.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surfaceMuted border border-borderLight text-secondary">
                            {s.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => setStaffList(staffList.filter((_, i) => i !== idx))}
                            className="text-secondary hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-borderLight">
                    <input
                      type="text"
                      placeholder="Staff Member Name"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="input-field text-xs sm:col-span-2"
                    />
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value)}
                      className="input-field text-xs font-semibold"
                    >
                      <option value="WAITER">🍽️ Waiter (Floor & POS)</option>
                      <option value="KITCHEN">👨‍🍳 Kitchen Staff (KDS)</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStaff}
                    className="btn-secondary w-full text-xs py-2"
                  >
                    + Add Employee
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 08: Menu Configuration (Gemini AI OCR) */}
          {step === 8 && (
            <div className="space-y-5">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 08</span>
                <h2 className="text-lg font-bold text-heading mt-1">Menu Ingestion & Gemini AI</h2>
                <p className="text-xs text-secondary mt-1">
                  Choose how to initialize your catalog. Use Google Gemini 2.5 Flash to automatically detect categories & prices.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setMenuMode('AI')}
                  className={`flex-1 p-3.5 rounded-xl border text-center transition-all ${
                    menuMode === 'AI'
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                      : 'border-borderLight hover:bg-surfaceMuted'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mx-auto mb-1 text-primary" />
                  <span className="text-xs block">AI Instant Ingestion</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuMode('MANUAL')}
                  className={`flex-1 p-3.5 rounded-xl border text-center transition-all ${
                    menuMode === 'MANUAL'
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                      : 'border-borderLight hover:bg-surfaceMuted'
                  }`}
                >
                  <Store className="w-5 h-5 mx-auto mb-1 text-secondary" />
                  <span className="text-xs block">Manual Entry Later</span>
                </button>
              </div>

              {menuMode === 'AI' && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-700 text-xs">
                    💡 Gemini AI automatically normalizes menu items into categories, prices, and dietary tags.
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-heading block mb-1">
                      Menu Text / Paste Raw Items
                    </label>
                    <textarea
                      rows={4}
                      value={aiMenuRawText}
                      onChange={(e) => setAiMenuRawText(e.target.value)}
                      className="input-field text-xs font-mono"
                      placeholder="Paste dish names and prices..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRunAiMenu}
                    disabled={aiParsing}
                    className="btn-primary text-xs py-2 px-4 flex items-center space-x-2"
                  >
                    {aiParsing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Extracting with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extract Menu with Gemini 2.5 Flash</span>
                      </>
                    )}
                  </button>

                  {/* AI Preview */}
                  <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto pr-1">
                    <span className="text-[11px] font-bold text-heading uppercase tracking-wider block">
                      Parsed Catalog Preview ({aiParsedCategories.length} Categories)
                    </span>
                    {aiParsedCategories.map((cat, i) => (
                      <div key={i} className="p-2.5 rounded-lg border border-borderLight bg-surfaceMuted/50">
                        <span className="text-xs font-bold text-primary block">{cat.category}</span>
                        <div className="mt-1 space-y-1">
                          {cat.items?.map((it: any, j: number) => (
                            <div key={j} className="flex justify-between text-xs text-secondary">
                              <span>{it.isVeg ? '🟢' : '🔴'} {it.name}</span>
                              <span className="font-semibold text-heading">₹{it.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 09: Billing Configuration */}
          {step === 9 && (
            <div className="space-y-4">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 09</span>
                <h2 className="text-lg font-bold text-heading mt-1">Taxation, GST & Invoicing</h2>
                <p className="text-xs text-secondary mt-1">
                  Configure government tax rates and invoice numbering applied during checkout.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">Standard Tax / GST Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="input-field"
                    placeholder="5"
                  />
                  <span className="text-[11px] text-secondary mt-1 block">Standard 5% restaurant GST (CGST 2.5% + SGST 2.5%)</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">Service Charge (%)</label>
                  <input
                    type="number"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(Number(e.target.value))}
                    className="input-field"
                    placeholder="0"
                  />
                  <span className="text-[11px] text-secondary mt-1 block">Set 0% if optional or inclusive</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-heading block mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    className="input-field font-mono"
                    placeholder="INV-2026-"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roundOff}
                      onChange={(e) => setRoundOff(e.target.checked)}
                      className="w-4 h-4 rounded text-primary"
                    />
                    <span className="text-xs font-semibold text-heading">Enable Automatic Rupee Round Off</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Printer Configuration */}
          {step === 10 && (
            <div className="space-y-4">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 10</span>
                <h2 className="text-lg font-bold text-heading mt-1">Thermal Receipt & KOT Printers</h2>
                <p className="text-xs text-secondary mt-1">
                  Connect POS receipt printers and Kitchen Order Ticket (KOT) thermal hardware.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'THERMAL_80MM', title: '80mm Thermal Printer (ESC/POS)', desc: 'Standard high-speed receipt roll for billing counter' },
                  { id: 'THERMAL_58MM', title: '58mm Compact Bluetooth/USB Printer', desc: 'Handheld or mobile billing device' },
                  { id: 'NETWORK_LAN', title: 'Ethernet / LAN Kitchen Printer', desc: 'Sends KOT tickets directly to chef station' },
                  { id: 'SKIP', title: 'Skip / Configure Hardware Later', desc: 'Use digital receipts & KDS screens only' },
                ].map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      printerType === p.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-borderLight hover:bg-surfaceMuted'
                    }`}
                  >
                    <input
                      type="radio"
                      name="printerType"
                      checked={printerType === p.id}
                      onChange={() => setPrinterType(p.id)}
                      className="mt-1 text-primary"
                    />
                    <div>
                      <span className="text-xs font-bold text-heading block">{p.title}</span>
                      <span className="text-[11px] text-secondary">{p.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 11: Final Review & Confirmation */}
          {step === 11 && (
            <div className="space-y-5">
              <div className="border-b border-borderLight pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 11 (Final)</span>
                <h2 className="text-lg font-bold text-heading mt-1">Review Configuration & Initialize Workspace</h2>
                <p className="text-xs text-secondary mt-1">
                  All configuration will be persisted in PostgreSQL and dynamic navigation will be generated.
                </p>
              </div>

              <div className="space-y-3 text-xs bg-surfaceMuted/50 p-4 rounded-xl border border-borderLight">
                <div className="flex justify-between py-1 border-b border-borderLight">
                  <span className="text-secondary">Restaurant Name</span>
                  <span className="font-bold text-heading">{name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderLight">
                  <span className="text-secondary">Business Model</span>
                  <span className="font-bold text-heading">{bType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderLight">
                  <span className="text-secondary">Brand Logo</span>
                  <span className="font-bold text-heading">
                    {logoUrl ? 'Stored on Supabase Storage' : 'Default Icon'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderLight">
                  <span className="text-secondary">Table Seating</span>
                  <span className="font-bold text-heading">
                    {usesTables ? `${tableCount} Tables (${tableSections.join(', ')})` : 'Disabled (Counter Service)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderLight">
                  <span className="text-secondary">Active Modules</span>
                  <span className="font-bold text-heading">{selectedModules.length} Modules Enabled</span>
                </div>
                <div className="flex justify-between py-1 border-b border-borderLight">
                  <span className="text-secondary">Staff Members</span>
                  <span className="font-bold text-heading">
                    {hasEmployees ? `${staffList.length} Staff configured` : 'Owner Only'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-secondary">Tax / GST Rate</span>
                  <span className="font-bold text-heading">{taxRate}% GST ({roundOff ? 'Auto Round Off' : 'Exact'})</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ready to create your live restaurant workspace and launch the POS dashboard.</span>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-borderLight">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(1, prev - 1))}
                className="btn-secondary text-xs flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            {step < 11 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.min(11, prev + 1))}
                className="btn-primary text-xs flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="btn-primary text-xs py-2 px-5 flex items-center space-x-2 shadow-button"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Writing to Database...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Launch Restaurant Workspace</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
