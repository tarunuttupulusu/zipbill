'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/state';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  Scale,
  RefreshCw,
  TrendingDown,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';

export default function InventoryPage() {
  const { profile, session, currentTenant, inventory, refreshTenantData } = useApp();
  const activeTenantId = profile?.tenantId || session?.tenantId || currentTenant?.id || '';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState('10');
  const [minThreshold, setMinThreshold] = useState('5');
  const [search, setSearch] = useState('');

  const stock = inventory || [];
  const lowStockCount = stock.filter((i: any) => Number(i.currentStock) <= Number(i.minAlertStock ?? i.minThreshold ?? 5)).length;

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeTenantId) return;

    try {
      const res = await fetch('/api/tenant/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenantId,
          name: name.trim(),
          unit,
          currentStock: Number(currentStock),
          minThreshold: Number(minThreshold),
        }),
      });
      if (res.ok) {
        await refreshTenantData();
      }
    } catch (err) {
      console.error('Failed to add inventory item:', err);
    }

    setName('');
    setIsAddOpen(false);
  };

  const handleDeleteStock = async (id: string) => {
    if (!id || !activeTenantId) return;
    try {
      const res = await fetch(`/api/tenant/inventory?id=${encodeURIComponent(id)}&tenantId=${encodeURIComponent(activeTenantId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshTenantData();
      }
    } catch (err) {
      console.error('Failed to delete inventory item:', err);
    }
  };

  const filteredStock = stock.filter((i: any) =>
    (i.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
            Inventory & Ingredients
          </h1>
          <p className="text-[14px] text-secondary mt-1">
            Real-time stock tracking, minimum thresholds, and automatic recipe consumption
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Ingredient</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Total Stock Items</div>
          <div className="text-[28px] font-semibold text-heading mt-2 leading-none">{stock.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Low Stock Alerts</div>
          <div className={`text-[28px] font-semibold mt-2 leading-none ${lowStockCount > 0 ? 'text-danger' : 'text-success'}`}>
            {lowStockCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Unit Types</div>
          <div className="text-[28px] font-semibold text-info mt-2 leading-none">4</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Auto-Deduction</div>
          <div className="text-[28px] font-semibold text-success mt-2 leading-none">Active</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search raw ingredients or supplies..."
          className="search-input w-full"
        />
      </div>

      {/* Stock Table */}
      <div className="card p-0 overflow-hidden">
        {filteredStock.length > 0 ? (
          <table className="w-full text-left text-[14px]">
            <thead className="bg-surfaceMuted text-muted text-xs font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Ingredient Name</th>
                <th className="px-6 py-3.5">Current Balance</th>
                <th className="px-6 py-3.5">Min Alert Level</th>
                <th className="px-6 py-3.5">Unit</th>
                <th className="px-6 py-3.5">Health Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight">
              {filteredStock.map((i: any) => {
                const isLow = Number(i.currentStock) <= Number(i.minAlertStock ?? i.minThreshold ?? 5);
                return (
                  <tr key={i.id} className="hover:bg-surfaceMuted/50 transition">
                    <td className="px-6 py-4 font-semibold text-heading">{i.name}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-heading">{i.currentStock} {i.unit}</td>
                    <td className="px-6 py-4 text-secondary">{i.minAlertStock ?? i.minThreshold ?? 5} {i.unit}</td>
                    <td className="px-6 py-4 text-muted text-xs uppercase">{i.unit}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isLow ? 'bg-danger-bg text-danger' : 'bg-success-bg text-success'}`}>
                        {isLow ? 'Low Stock' : 'Adequate'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteStock(i.id)}
                        className="p-1.5 text-danger hover:bg-danger-bg rounded-lg transition"
                        title="Delete Ingredient"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-placeholder mx-auto" />
            <p className="text-sm text-secondary">No raw ingredients or inventory items added yet.</p>
            <button onClick={() => setIsAddOpen(true)} className="btn-primary text-xs py-1.5 px-4 inline-flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Ingredient</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-semibold text-lg text-heading">Add Raw Ingredient</h3>
            <form onSubmit={handleAddStock} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-secondary mb-1">Ingredient Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Basmati Rice, Milk, Cooking Oil"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-secondary mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-medium text-secondary mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="input-field"
                  >
                    <option value="kg">kg</option>
                    <option value="g">grams</option>
                    <option value="L">Liters</option>
                    <option value="pcs">Pieces</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
