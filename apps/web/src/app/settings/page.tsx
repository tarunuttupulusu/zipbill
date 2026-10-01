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
} from 'lucide-react';
import { SYSTEM_MODULE_REGISTRY } from '@platform/config-engine';
import { ModuleToken } from '@platform/types';

export default function SettingsAndModulesPage() {
  const { profile, setProfile, enabledModules, toggleModule } = useApp();
  const [activeTab, setActiveTab] = useState<'MODULES' | 'BILLING' | 'PRINTERS'>('MODULES');
  const [gstRate, setGstRate] = useState<number>(5);

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
            Store Settings & Dynamic Modules
          </h1>
          <p className="text-[14px] text-secondary mt-1">
            Control business capabilities, hardware printer routing, and tax configurations
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1.5 bg-surface border border-border p-1 rounded-xl">
          {[
            { id: 'MODULES', label: 'Modules Registry' },
            { id: 'BILLING', label: 'Taxes & Billing' },
            { id: 'PRINTERS', label: 'Thermal Printers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
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

      {/* TAB 1: MODULE MANAGEMENT */}
      {activeTab === 'MODULES' && (
        <div className="space-y-4">
          <div className="card space-y-3">
            <h2 className="text-base font-semibold text-heading">Active System Modules</h2>
            <p className="text-xs text-secondary">
              Toggle operational features on/off. When a module is enabled or disabled, navigation routes and screens adapt in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(SYSTEM_MODULE_REGISTRY).map((mod) => {
              const isEnabled = enabledModules.includes(mod.token as ModuleToken);
              return (
                <div
                  key={mod.token}
                  className={`card flex flex-col justify-between transition-all duration-150 ${
                    isEnabled
                      ? 'border-primary/40 bg-surface'
                      : 'border-border bg-surfaceMuted/50 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-muted uppercase">
                        {mod.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.token as ModuleToken)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                          isEnabled ? 'bg-primary' : 'bg-border'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <h3 className="font-semibold text-[15px] text-heading leading-snug">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-secondary mt-1.5 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-borderLight flex items-center justify-between text-[11px] text-muted">
                    <span className="font-mono">{mod.token}</span>
                    <span className={`font-semibold ${isEnabled ? 'text-primary' : 'text-muted'}`}>
                      {isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TAXES & BILLING */}
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
              <button className="btn-primary">
                Save Tax Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRINTERS */}
      {activeTab === 'PRINTERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card space-y-3">
            <h3 className="font-semibold text-heading text-sm">Cashier Thermal Printer (80mm)</h3>
            <p className="text-xs text-muted">USB / Network ESC/POS thermal printer for invoices.</p>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-success font-semibold">● Ready & Connected</span>
              <button className="btn-secondary text-xs py-1.5 px-3">Test Print</button>
            </div>
          </div>
          <div className="card space-y-3">
            <h3 className="font-semibold text-heading text-sm">Kitchen Ticket Printer (KOT 58mm)</h3>
            <p className="text-xs text-muted">Ethernet ESC/POS printer connected to KDS router.</p>
            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-success font-semibold">● Ready & Connected</span>
              <button className="btn-secondary text-xs py-1.5 px-3">Test Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
