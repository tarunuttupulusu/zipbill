'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/state';
import {
  LayoutGrid,
  Users,
  Plus,
  Clock,
  Receipt,
  QrCode,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import { TableStatus } from '@platform/types';

export default function TablesFloorPage() {
  const { tables, setTables, profile, session, currentTenant, refreshTenantData } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState('4');

  const statusColors: Record<TableStatus, { bg: string; text: string; border: string }> = {
    AVAILABLE: { bg: 'bg-emerald-50 text-success', text: 'text-success', border: 'border-emerald-200' },
    OCCUPIED: { bg: 'bg-orange-50 text-primary', text: 'text-primary', border: 'border-orange-200' },
    BILLING: { bg: 'bg-blue-50 text-info', text: 'text-info', border: 'border-blue-200' },
    RESERVED: { bg: 'bg-purple-50 text-purple-600', text: 'text-purple-600', border: 'border-purple-200' },
    ORDER_READY: { bg: 'bg-amber-50 text-warning', text: 'text-warning', border: 'border-amber-200' },
    OUT_OF_SERVICE: { bg: 'bg-surfaceMuted text-muted', text: 'text-muted', border: 'border-border' },
  };

  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING').length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber || !tableName) return;
    const activeTenantId = profile.tenantId || session.tenantId || currentTenant?.id || '';

    const newTable = {
      id: `tbl-${Date.now()}`,
      tenantId: activeTenantId,
      tableNumber,
      tableName,
      capacity: Number(capacity),
      status: 'AVAILABLE' as TableStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTables([...tables, newTable]);

    try {
      const res = await fetch('/api/tenant/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenantId,
          tableNumber,
          tableName,
          capacity: Number(capacity),
          status: 'AVAILABLE',
        }),
      });
      if (res.ok) {
        refreshTenantData().catch(() => {});
      }
    } catch {}

    setTableNumber('');
    setTableName('');
    setIsAddOpen(false);
  };

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight flex items-center space-x-2">
            <span>Tables & Floor Plan</span>
          </h1>
          <p className="text-[14px] text-secondary mt-1">
            Real-time table occupancy, guest counts, and direct POS terminal access from database
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center space-x-3 text-xs bg-surface border border-border p-2 rounded-xl">
            <span className="flex items-center space-x-1.5 text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span>Available</span>
            </span>
            <span className="flex items-center space-x-1.5 text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span>Occupied</span>
            </span>
            <span className="flex items-center space-x-1.5 text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-info" />
              <span>Billing</span>
            </span>
          </div>

          <button onClick={() => setIsAddOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Total Tables</div>
          <div className="text-[28px] font-semibold text-heading mt-2 leading-none">{tables.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Occupied</div>
          <div className="text-[28px] font-semibold text-primary mt-2 leading-none">{occupiedCount}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Available</div>
          <div className="text-[28px] font-semibold text-success mt-2 leading-none">{availableCount}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Occupancy Rate</div>
          <div className="text-[28px] font-semibold text-info mt-2 leading-none">
            {tables.length > 0 ? Math.round((occupiedCount / tables.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Table Grid */}
      {tables.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((t) => {
            const cfg = statusColors[t.status] || statusColors.AVAILABLE;
            return (
              <div
                key={t.id}
                className={`card flex flex-col justify-between hover:border-placeholder transition ${cfg.border}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-muted">T-{t.tableNumber}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg}`}>
                      {t.status}
                    </span>
                  </div>

                  <div className="my-4 text-center">
                    <div className="text-2xl font-bold text-heading">{t.tableName}</div>
                    <div className="text-xs text-muted flex items-center justify-center space-x-1 mt-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{t.capacity} Seats</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-borderLight flex gap-2">
                  <Link
                    href="/pos"
                    className="btn-primary flex-1 text-xs py-2 text-center"
                  >
                    <span>Open POS</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center p-12 space-y-3">
          <LayoutGrid className="w-10 h-10 text-placeholder mx-auto" />
          <p className="text-sm text-secondary">No tables configured in this restaurant floor plan yet.</p>
          <button onClick={() => setIsAddOpen(true)} className="btn-primary text-xs py-1.5 px-4 inline-flex items-center space-x-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Table</span>
          </button>
        </div>
      )}

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-heading">Add Floor Table</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-placeholder hover:text-heading">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTable} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-secondary mb-1">Table Number</label>
                  <input
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g. 1, 2, 3"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-medium text-secondary mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="4"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-secondary mb-1">Table Display Name</label>
                <input
                  type="text"
                  required
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="e.g. Table 1, Window Booth, VIP 1"
                  className="input-field"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
