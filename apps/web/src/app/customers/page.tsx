'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/state';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Award,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

export default function CustomersDirectoryPage() {
  const { customers, setCustomers, profile, session, currentTenant, refreshTenantData } = useApp();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const currencySymbol = profile.currencySymbol || '₹';

  const filtered = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    const activeTenantId = profile.tenantId || session.tenantId || currentTenant?.id || '';

    const newCustomer = {
      id: `cust-${Date.now()}`,
      tenantId: activeTenantId,
      name,
      phone,
      email: email || '',
      totalVisits: 1,
      totalSpend: 0,
      lastVisitAt: new Date().toISOString(),
    };

    setCustomers([newCustomer, ...customers]);

    // Save to DB
    try {
      const res = await fetch('/api/tenant/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenantId,
          name,
          phone,
          email,
        }),
      });
      if (res.ok) {
        refreshTenantData().catch(() => {});
      }
    } catch {}

    setName('');
    setPhone('');
    setEmail('');
    setIsAddOpen(false);
  };

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
            Customer Directory & CRM
          </h1>
          <p className="text-[14px] text-secondary mt-1">
            Track customer visit frequency, lifetime spend, and loyalty rewards from database
          </p>
        </div>

        <button onClick={() => setIsAddOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Total Registered Guests</div>
          <div className="text-[28px] font-semibold text-heading mt-2 leading-none">{customers.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">VIP Repeat Guests</div>
          <div className="text-[28px] font-semibold text-success mt-2 leading-none">
            {customers.filter((c) => (c.totalVisits || 0) > 5).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Average Spend / Visit</div>
          <div className="text-[28px] font-semibold text-info mt-2 leading-none">
            {currencySymbol}
            {customers.length > 0
              ? (customers.reduce((acc, c) => acc + (c.totalSpend || 0), 0) / customers.length / 100).toFixed(0)
              : '0'}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">SMS Loyalty Opt-in</div>
          <div className="text-[28px] font-semibold text-primary mt-2 leading-none">100%</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or phone number..."
          className="search-input w-full"
        />
      </div>

      {/* Directory Table */}
      <div className="card p-0 overflow-hidden">
        {filtered.length > 0 ? (
          <table className="w-full text-left text-[14px]">
            <thead className="bg-surfaceMuted text-muted text-xs font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Phone Number</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Total Visits</th>
                <th className="px-6 py-3.5">Lifetime Spend</th>
                <th className="px-6 py-3.5">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight">
              {filtered.map((c) => (
                <tr key={c.id || c.phone} className="hover:bg-surfaceMuted/50 transition">
                  <td className="px-6 py-4 font-semibold text-heading">{c.name}</td>
                  <td className="px-6 py-4 font-mono text-secondary text-xs">{c.phone}</td>
                  <td className="px-6 py-4 text-secondary text-xs">{c.email || '—'}</td>
                  <td className="px-6 py-4 font-semibold text-heading">{c.totalVisits || 1}</td>
                  <td className="px-6 py-4 font-semibold text-heading">
                    {currencySymbol}{(Number(c.totalSpend || 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-muted text-xs">
                    {c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-placeholder mx-auto" />
            <p className="text-sm text-secondary">No customer profiles recorded in this restaurant yet.</p>
            <button onClick={() => setIsAddOpen(true)} className="btn-primary text-xs py-1.5 px-4 inline-flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Customer</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-heading">Add New Customer</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-placeholder hover:text-heading">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block font-medium text-secondary mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block font-medium text-secondary mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="input-field"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
