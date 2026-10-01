'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/state';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  LayoutGrid,
  ChefHat,
  Calculator,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
  Zap,
  ArrowRight,
  Database,
  Store,
  Layers,
  Search,
  Plus,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Receipt,
  CreditCard,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { BusinessType } from '@platform/types';

const DASHBOARD_TABS = [
  { id: 'overview', name: 'Overview' },
  { id: 'sales', name: "Today's Sales" },
  { id: 'orders', name: "Today's Orders" },
  { id: 'tables', name: 'Active Tables' },
  { id: 'pending', name: 'Pending Orders' },
  { id: 'kitchen', name: 'Kitchen Status' },
  { id: 'payments', name: 'Payment Summary' },
  { id: 'actions', name: 'Quick Actions' },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    profile,
    session,
    tables,
    activeOrders,
    stats,
    isLoadingData,
  } = useApp();

  const occupiedTables = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILLING');
  const availableTables = tables.filter((t) => t.status === 'AVAILABLE');
  const completedOrders = activeOrders.filter((o) => o.status === 'COMPLETED' || o.status === 'BILLED');

  const currencySymbol = profile.currencySymbol || '₹';
  const totalRevenue = stats?.totalRevenue || (completedOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0) / 100);

  const filteredOrders = activeOrders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.tableName?.toLowerCase().includes(q) ||
      o.createdByWorkerName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
              {profile.businessName || 'Restaurant Dashboard'}
            </h1>
            {isLoadingData && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-light text-primary font-medium animate-pulse">
                Syncing DB...
              </span>
            )}
          </div>
          <p className="text-[14px] text-secondary mt-1">
            Real-time live database overview of your operations, orders, active tables, and sales.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/onboarding" className="btn-secondary">
            <Store className="w-4 h-4 text-placeholder" />
            <span>Setup Wizard</span>
          </Link>
          <Link href="/pos" className="btn-primary">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ New Order / POS</span>
          </Link>
        </div>
      </div>

      {/* 4 DYNAMIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue (Protected: Hidden for non-owners to guard sensitive financial data) */}
        {session.roleName === 'OWNER' ? (
          <div className="stat-card">
            <div className="text-[14px] text-secondary font-medium">Revenue</div>
            <div className="text-[28px] font-semibold text-heading mt-2 leading-none">
              {currencySymbol}{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[12px] text-success mt-1.5 flex items-center space-x-1 font-medium">
              <span>Live from Database</span>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="text-[14px] text-secondary font-medium">Shift Status</div>
            <div className="text-[28px] font-semibold text-primary mt-2 leading-none">
              Active
            </div>
            <div className="text-[12px] text-muted mt-1.5 font-medium">
              Floor Terminal Assigned
            </div>
          </div>
        )}

        {/* Card 2: Active Orders */}
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Active Orders</div>
          <div className="text-[28px] font-semibold text-primary mt-2 leading-none">
            {activeOrders.length}
          </div>
          <div className="text-[12px] text-muted mt-1.5 font-medium">
            {activeOrders.length === 0 ? 'No active orders' : `${activeOrders.length} in preparation`}
          </div>
        </div>

        {/* Card 3: Table Occupancy */}
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Occupied Tables</div>
          <div className="text-[28px] font-semibold text-success mt-2 leading-none">
            {occupiedTables.length} / {tables.length}
          </div>
          <div className="text-[12px] text-secondary mt-1.5 font-medium">
            {tables.length > 0
              ? `${Math.round((occupiedTables.length / tables.length) * 100)}% Capacity Utilized`
              : 'No tables configured'}
          </div>
        </div>

        {/* Card 4: Completed Bills */}
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Completed Bills</div>
          <div className="text-[28px] font-semibold text-info mt-2 leading-none">
            {completedOrders.length}
          </div>
          <div className="text-[12px] text-muted mt-1.5 font-medium">PostgreSQL Synced</div>
        </div>
      </div>

      {/* CHILDREN SUB-TABS */}
      <div className="flex items-center space-x-1.5 overflow-x-auto bg-surface border border-border p-1 rounded-xl">
        {DASHBOARD_TABS.map((tab) => (
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

      {/* SEARCH BAR */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search live orders, tables, or staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input w-full"
        />
      </div>

      {/* TAB CONTENT: Overview */}
      {(activeTab === 'overview' || activeTab === 'sales') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders List */}
          <div className="card space-y-4 lg:col-span-2">
            <div className="flex justify-between items-center pb-3 border-b border-borderLight">
              <div>
                <h3 className="font-semibold text-base text-heading">Live Floor & Counter Orders</h3>
                <p className="text-xs text-secondary mt-0.5">Real-time status of orders in kitchen and tables</p>
              </div>
              <Link href="/orders" className="text-xs text-primary font-semibold hover:underline">
                View All Orders →
              </Link>
            </div>

            {filteredOrders.length > 0 ? (
              <div className="divide-y divide-borderLight text-xs">
                {filteredOrders.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-heading text-sm">
                        {ord.tableName ? `${ord.tableName}` : 'Counter Takeaway'} ({ord.orderNumber})
                      </div>
                      <div className="text-muted">
                        {ord.items && ord.items.length > 0
                          ? ord.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')
                          : 'Items being added'} • {ord.createdByWorkerName || 'Staff'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-heading text-sm">
                        {currencySymbol}{(Number(ord.grandTotal || 0) / 100).toFixed(2)}
                      </div>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          ord.status === 'COMPLETED'
                            ? 'bg-success-bg text-success'
                            : ord.status === 'READY'
                            ? 'bg-info-bg text-info'
                            : 'bg-warning-bg text-warning'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-placeholder mx-auto" />
                <p className="text-sm text-secondary">No active orders in this restaurant yet.</p>
                <Link href="/pos" className="btn-primary text-xs py-1.5 px-4 inline-flex items-center space-x-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Order</span>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-base text-heading">Operational Shortcuts</h3>
            <div className="space-y-2.5">
              <Link
                href="/pos"
                className="p-3 rounded-xl bg-surfaceMuted border border-borderLight flex items-center justify-between hover:border-primary/40 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-heading">Launch POS Billing</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-placeholder" />
              </Link>

              <Link
                href="/kitchen"
                className="p-3 rounded-xl bg-surfaceMuted border border-borderLight flex items-center justify-between hover:border-primary/40 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <ChefHat className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-heading">Kitchen Display (KDS)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-placeholder" />
              </Link>

              <Link
                href="/tables"
                className="p-3 rounded-xl bg-surfaceMuted border border-borderLight flex items-center justify-between hover:border-primary/40 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-heading">Floor & Seating Plan</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-placeholder" />
              </Link>

              <Link
                href="/menu"
                className="p-3 rounded-xl bg-surfaceMuted border border-borderLight flex items-center justify-between hover:border-primary/40 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-heading">Menu Catalog & Prices</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-placeholder" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Active Tables */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          {tables.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {tables.map((t) => (
                <div key={t.id} className="card text-center p-4 space-y-2">
                  <span className="text-xs font-semibold uppercase text-muted">Table #{t.tableNumber}</span>
                  <div className="text-xl font-bold text-heading">{t.tableName}</div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      t.status === 'OCCUPIED'
                        ? 'bg-warning-bg text-warning'
                        : t.status === 'BILLING'
                        ? 'bg-info-bg text-info'
                        : 'bg-success-bg text-success'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center p-12 space-y-3">
              <LayoutGrid className="w-10 h-10 text-placeholder mx-auto" />
              <p className="text-sm text-secondary">No tables configured for this restaurant yet.</p>
              <Link href="/tables" className="btn-primary text-xs py-1.5 px-4 inline-flex items-center space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Configure Tables</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
