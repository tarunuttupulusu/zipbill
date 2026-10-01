'use client';

import React, { useEffect, useState } from 'react';
import { Store, Plus, Search, Loader2 } from 'lucide-react';

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  status: string;
  plan: string;
  createdAt: string;
}

export default function AdminRestaurantsPage() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadTenants() {
      try {
        const res = await fetch('/api/admin/tenants');
        if (res.ok) {
          const data = await res.json();
          setTenants(data.tenants || []);
        }
      } catch (err) {
        console.error('Failed to load tenants:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTenants();
  }, []);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading tracking-tight">Restaurant Tenants</h1>
          <p className="text-sm text-secondary mt-1">
            Global tenant provisioning, module toggles, and business workspace management
          </p>
        </div>
        <button className="btn-primary text-xs px-4 py-2.5 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Provision New Tenant</span>
        </button>
      </div>

      <div className="card p-6 space-y-4">
        <div className="flex items-center space-x-3 bg-surfaceMuted px-3.5 py-2 rounded-lg border border-border max-w-md">
          <Search className="w-4 h-4 text-placeholder" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant by name, slug, or ID..."
            className="bg-transparent text-xs text-heading placeholder-placeholder focus:outline-none w-full"
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Loading registered restaurants...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <Store className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No restaurants found</p>
              <p className="text-xs mt-1">New restaurant registrations will appear here dynamically.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-secondary font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Restaurant Name</th>
                  <th className="py-3 px-4">Domain / Slug</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-surfaceMuted transition">
                    <td className="py-3.5 px-4 font-bold text-heading">{tenant.name}</td>
                    <td className="py-3.5 px-4 text-secondary font-mono">{tenant.slug}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-primary-light text-primary font-semibold">
                        {tenant.businessType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-heading">{tenant.plan}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          tenant.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="btn-secondary text-[11px] px-3 py-1 font-semibold">
                        Manage Tenant
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
