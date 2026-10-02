'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/state';
import {
  Settings,
  Layers,
  Printer,
  Receipt,
  Shield,
  CreditCard,
  Bell,
  CheckCircle,
  Store,
  Sparkles,
  Info,
  Check,
  RefreshCw,
} from 'lucide-react';
import { SYSTEM_MODULE_REGISTRY } from '@platform/config-engine';
import { BusinessType, ModuleToken } from '@platform/types';

const BUSINESS_MODELS: Array<{ type: BusinessType; name: string; icon: string; desc: string }> = [
  { type: 'RESTAURANT', name: 'Fine / Casual Dine-in', icon: '🍽️', desc: 'Table service, live occupancy, KOTs, and split checks' },
  { type: 'CAFE', name: 'Cafe & Bistro', icon: '☕', desc: 'Fast counter ordering, barista queues, and light seating' },
  { type: 'BAKERY', name: 'Bakery & Patisserie', icon: '🥐', desc: 'Counter parcel checkouts, retail sales, stock tracking' },
  { type: 'FAST_FOOD', name: 'Fast Food / QSR', icon: '🍔', desc: 'Token billing, instant checkout, and high-speed counter' },
  { type: 'CLOUD_KITCHEN', name: 'Cloud Kitchen', icon: '🛵', desc: 'Online delivery dispatch, courier riders, no dining tables' },
  { type: 'FOOD_COURT', name: 'Food Court Outlet', icon: '🏬', desc: 'Customer buzzer tokens, rapid counter checkouts' },
  { type: 'BAR', name: 'Bar & Lounge', icon: '🍸', desc: 'Open bar tabs, drink modifiers, and lounge floor layout' },
  { type: 'HOTEL_RESTAURANT', name: 'Hotel Restaurant', icon: '🏨', desc: 'Table service, room billing, guest folios' },
];

export default function SettingsAndModulesPage() {
  const {
    profile,
    setProfile,
    businessType,
    setBusinessType,
    enabledModules,
    toggleModule,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'MODULES' | 'MODEL' | 'BILLING' | 'PRINTERS'>('MODULES');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [lastToggled, setLastToggled] = useState<string | null>(null);
  const [gstRate, setGstRate] = useState<number>(5);

  const categories = ['ALL', 'POINT_OF_SALE', 'OPERATIONS', 'INVENTORY', 'BILLING', 'MARKETING', 'INTELLIGENCE'];

  const filteredModules = Object.values(SYSTEM_MODULE_REGISTRY).filter((mod) => {
    if (selectedCategory === 'ALL') return true;
    return mod.category === selectedCategory;
  });

  const handleToggle = (token: ModuleToken, name: string) => {
    toggleModule(token);
    setLastToggled(name);
    setTimeout(() => setLastToggled(null), 3000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-[26px] sm:text-[30px] font-semibold text-heading tracking-tight leading-tight">
              Store Settings & System Modules
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              Live Real-Time Sync
            </span>
          </div>
          <p className="text-[13px] text-secondary mt-1">
            Toggle modules and business model preferences. Sidebar navigation and dashboard widgets adapt instantly in real time.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 bg-surface border border-border p-1 rounded-xl">
          {[
            { id: 'MODULES', label: `Active Modules (${enabledModules.length})` },
            { id: 'MODEL', label: 'Business Model' },
            { id: 'BILLING', label: 'Taxes & Billing' },
            { id: 'PRINTERS', label: 'Thermal Printers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === tab.id
                  ? 'bg-primary-light text-primary font-semibold'
                  : 'text-secondary hover:text-main'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time alert toast banner */}
      {lastToggled && (
        <div className="p-3 rounded-xl bg-success-bg border border-success/20 text-success text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <span>
              <strong>{lastToggled}</strong> toggled! Sidebar navigation and dashboard reconfigured in real time.
            </span>
          </div>
          <span className="text-[11px] opacity-80">Synced locally & cloud</span>
        </div>
      )}

      {/* TAB 1: MODULE MANAGEMENT */}
      {activeTab === 'MODULES' && (
        <div className="space-y-5">
          <div className="card space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-heading">Active System Modules Registry</h2>
                <p className="text-xs text-secondary mt-0.5">
                  When a module is toggled OFF, its section is completely removed from the sidebar and dashboard. When toggled ON, it appears instantly.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-surfaceMuted font-semibold text-heading border border-borderLight">
                  {enabledModules.length} of {Object.keys(SYSTEM_MODULE_REGISTRY).length} Enabled
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-borderLight">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-primary text-white font-semibold'
                      : 'bg-surfaceMuted text-secondary hover:text-heading'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((mod) => {
              const isEnabled = enabledModules.includes(mod.token as ModuleToken);
              return (
                <div
                  key={mod.token}
                  className={`card flex flex-col justify-between transition-all duration-150 ${
                    isEnabled
                      ? 'border-primary/40 bg-surface shadow-sm'
                      : 'border-border bg-surfaceMuted/40 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                        {mod.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggle(mod.token as ModuleToken, mod.name)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                          isEnabled ? 'bg-primary' : 'bg-border'
                        }`}
                        title={isEnabled ? `Disable ${mod.name}` : `Enable ${mod.name}`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <h3 className="font-semibold text-[14px] text-heading leading-snug">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-secondary mt-1.5 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-borderLight flex items-center justify-between text-[11px] text-muted">
                    <span className="font-mono text-[10px]">{mod.token}</span>
                    <span className={`font-semibold ${isEnabled ? 'text-primary' : 'text-muted'}`}>
                      {isEnabled ? '● Active in Sidebar' : '○ Hidden from Sidebar'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS MODEL */}
      {activeTab === 'MODEL' && (
        <div className="space-y-4">
          <div className="card space-y-2">
            <h2 className="text-base font-semibold text-heading">Switch Restaurant Business Model</h2>
            <p className="text-xs text-secondary">
              Selecting a business model automatically tailors recommended modules and default layouts for that specific establishment type.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {BUSINESS_MODELS.map((item) => {
              const isCurrent = businessType === item.type;
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setBusinessType(item.type)}
                  className={`card p-4 text-left transition-all ${
                    isCurrent
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-sm text-heading flex items-center justify-between">
                    <span>{item.name}</span>
                    {isCurrent && <Check className="w-4 h-4 text-primary stroke-[2.5]" />}
                  </div>
                  <p className="text-xs text-secondary mt-1 leading-relaxed">{item.desc}</p>
                  <div className="mt-3 pt-2 border-t border-borderLight text-[11px] text-primary font-medium">
                    {isCurrent ? 'Active Model' : 'Switch to this model →'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TAXES & BILLING */}
      {activeTab === 'BILLING' && (
        <div className="card space-y-4 max-w-xl">
          <h2 className="text-base font-semibold text-heading">Tax & Invoice Configuration</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-secondary font-medium mb-1">Business Registered Name</label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-secondary font-medium mb-1">GSTIN Number</label>
              <input
                type="text"
                value={profile.taxNumber || ''}
                placeholder="Enter 15-digit GSTIN (optional)"
                onChange={(e) => setProfile({ ...profile, taxNumber: e.target.value })}
                className="input-field font-mono"
              />
            </div>
            <div>
              <label className="block text-secondary font-medium mb-1">Default GST Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="input-field"
              />
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Tax and billing settings saved!')}
                className="btn-primary"
              >
                Save Tax Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRINTERS */}
      {activeTab === 'PRINTERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card space-y-3">
            <h3 className="font-semibold text-heading text-sm">Cashier Thermal Printer (80mm)</h3>
            <p className="text-xs text-muted">USB / Network ESC/POS thermal printer for bills and invoices.</p>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-success font-semibold">● Ready & Connected</span>
              <button
                type="button"
                onClick={() => alert('Test invoice slip sent to 80mm thermal spooler!')}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Test Print
              </button>
            </div>
          </div>
          <div className="card space-y-3">
            <h3 className="font-semibold text-heading text-sm">Kitchen Ticket Printer (KOT 58mm)</h3>
            <p className="text-xs text-muted">Ethernet ESC/POS printer connected to KDS router.</p>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-success font-semibold">● Ready & Connected</span>
              <button
                type="button"
                onClick={() => alert('Test KOT order slip sent to kitchen printer!')}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Test Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
