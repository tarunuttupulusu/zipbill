'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/state';
import {
  QrCode,
  Download,
  Plus,
  Smartphone,
  CreditCard,
  Printer,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const QR_TABS = [
  { id: 'menu', name: 'QR Menu' },
  { id: 'tables', name: 'Table QR' },
  { id: 'ordering', name: 'QR Ordering' },
  { id: 'payment', name: 'QR Bill Payment' },
  { id: 'generate', name: 'Generate QR' },
];

export default function QrAndDigitalSectionPage() {
  const [activeTab, setActiveTab] = useState('menu');
  const { tables, profile, activeOrders, stats } = useApp();
  const currencySymbol = profile.currencySymbol || '₹';

  const digitalOrders = activeOrders.filter((o) => o.orderType === 'DINE_IN' || o.orderType === 'COUNTER');
  const digitalVolume = digitalOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) / 100;

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
            QR & Digital Experiences
          </h1>
          <p className="text-[14px] text-secondary mt-1">
            Manage contactless digital menus, table-top QR ordering, and scan-to-pay
          </p>
        </div>

        <button className="btn-primary">
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Download All Table QRs</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Active Table QRs</div>
          <div className="text-[28px] font-semibold text-heading mt-2 leading-none">{tables.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">QR Scans Today</div>
          <div className="text-[28px] font-semibold text-success mt-2 leading-none">{digitalOrders.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Digital Orders Placed</div>
          <div className="text-[28px] font-semibold text-primary mt-2 leading-none">{digitalOrders.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Scan-to-Pay Volume</div>
          <div className="text-[28px] font-semibold text-info mt-2 leading-none">{currencySymbol}{digitalVolume.toFixed(2)}</div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto bg-surface border border-border p-1 rounded-xl">
        {QR_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-primary-light text-primary font-semibold'
                : 'text-secondary hover:text-main'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {tables.map((t) => (
          <div key={t.id} className="card text-center p-4 space-y-3">
            <div className="w-24 h-24 bg-surfaceMuted border border-borderLight rounded-xl flex items-center justify-center mx-auto text-primary">
              <QrCode className="w-16 h-16 stroke-[1.5]" />
            </div>
            <div>
              <div className="font-semibold text-sm text-heading">{t.tableName}</div>
              <div className="text-[11px] text-muted">Table #{t.tableNumber}</div>
            </div>
            <button className="btn-secondary w-full text-xs py-1.5">
              <span>Print QR</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
