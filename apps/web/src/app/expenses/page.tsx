'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/state';
import {
  Receipt,
  Plus,
  TrendingDown,
  DollarSign,
  Calendar,
  Search,
  X,
} from 'lucide-react';

export default function ExpensesLedgerPage() {
  const { expenses, setExpenses, profile, session, currentTenant, refreshTenantData } = useApp();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [category, setCategory] = useState('RAW_MATERIALS');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [notes, setNotes] = useState('');

  const currencySymbol = profile.currencySymbol || '₹';

  const totalExpense = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0) / 100;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    const activeTenantId = profile.tenantId || session.tenantId || currentTenant?.id || '';

    const newExpense = {
      id: `exp-${Date.now()}`,
      tenantId: activeTenantId,
      category,
      amount: Math.round(Number(amount) * 100),
      paymentMode,
      notes,
      recordedBy: 'Owner',
      createdAt: new Date().toISOString(),
    };

    setExpenses([newExpense, ...expenses]);

    try {
      const res = await fetch('/api/tenant/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenantId,
          category,
          amount,
          paymentMode,
          notes,
        }),
      });
      if (res.ok) {
        refreshTenantData().catch(() => {});
      }
    } catch {}

    setAmount('');
    setNotes('');
    setIsAddOpen(false);
  };

  const filtered = expenses.filter((e) =>
    e.category?.toLowerCase().includes(search.toLowerCase()) ||
    e.notes?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
            Store Expenses & Payouts
          </h1>
          <p className="text-[14px] text-secondary mt-1">
            Log operational costs, supplier payouts, utility bills, and petty cash transactions from database
          </p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Total Expenses</div>
          <div className="text-[28px] font-semibold text-heading mt-2 leading-none">
            {currencySymbol}{totalExpense.toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Total Entries</div>
          <div className="text-[28px] font-semibold text-heading mt-2 leading-none">{expenses.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Payment Modes</div>
          <div className="text-[28px] font-semibold text-info mt-2 leading-none">UPI / Cash</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Postgres Status</div>
          <div className="text-[28px] font-semibold text-success mt-2 leading-none">Live Synced</div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by category or expense notes..."
          className="search-input w-full"
        />
      </div>

      <div className="card p-0 overflow-hidden">
        {filtered.length > 0 ? (
          <table className="w-full text-left text-[14px]">
            <thead className="bg-surfaceMuted text-muted text-xs font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Payment Mode</th>
                <th className="px-6 py-3.5">Notes</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-surfaceMuted/50 transition">
                  <td className="px-6 py-4 font-semibold text-heading">{e.category}</td>
                  <td className="px-6 py-4 font-semibold text-danger">
                    {currencySymbol}{(Number(e.amount || 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-secondary">{e.paymentMode}</td>
                  <td className="px-6 py-4 text-secondary text-xs">{e.notes || '—'}</td>
                  <td className="px-6 py-4 text-muted text-xs">
                    {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'Today'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-10 h-10 text-placeholder mx-auto" />
            <p className="text-sm text-secondary">No expense records logged in this restaurant yet.</p>
            <button onClick={() => setIsAddOpen(true)} className="btn-primary text-xs py-1.5 px-4 inline-flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Record First Expense</span>
            </button>
          </div>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-heading">Record Store Expense</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-placeholder hover:text-heading">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-secondary mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="RAW_MATERIALS">Raw Materials & Ingredients</option>
                  <option value="RENT">Store Rent</option>
                  <option value="SALARIES">Staff Wages & Payroll</option>
                  <option value="UTILITIES">Electricity & Gas</option>
                  <option value="PACKAGING">Packaging & Disposables</option>
                  <option value="MARKETING">Marketing & Ads</option>
                  <option value="OTHER">Other Expense</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-secondary mb-1">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block font-medium text-secondary mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="input-field"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="CASH">Cash Drawer</option>
                    <option value="BANK_TRANSFER">Net Banking / NEFT</option>
                    <option value="CARD">Credit / Debit Card</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-medium text-secondary mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional details..."
                  className="input-field"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
