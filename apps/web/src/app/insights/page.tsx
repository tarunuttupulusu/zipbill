'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/state';
import {
  LineChart,
  TrendingUp,
  Clock,
  Award,
  Users,
  DollarSign,
  ArrowUpRight,
  Calendar,
  Utensils,
  LayoutGrid,
} from 'lucide-react';

const INSIGHTS_TABS = [
  { id: 'revenue', name: 'Revenue Analysis' },
  { id: 'trends', name: 'Sales Trends' },
  { id: 'peak', name: 'Peak Hours' },
  { id: 'bestsellers', name: 'Best Selling Items' },
  { id: 'staff', name: 'Staff Performance' },
  { id: 'tables', name: 'Table Performance' },
];

function InsightsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'revenue';
  const [activeTab, setActiveTab] = useState(initialTab);

  const { profile, activeOrders, menuItems, tables, staff } = useApp();
  const currencySymbol = profile.currencySymbol || '₹';

  // Compute live data from database records
  const completedOrders = activeOrders.filter((o) => o.status === 'COMPLETED' || o.status === 'BILLED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) / 100;
  const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  // Best sellers computation from actual line items
  const dishCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  completedOrders.forEach((o) => {
    (o.items || []).forEach((item: any) => {
      const name = item.itemName || item.name || 'Specialty Item';
      if (!dishCounts[name]) {
        dishCounts[name] = { name, count: 0, revenue: 0 };
      }
      dishCounts[name].count += item.quantity || 1;
      dishCounts[name].revenue += ((item.unitPrice || 0) * (item.quantity || 1)) / 100;
    });
  });

  const bestSellers = Object.values(dishCounts).sort((a, b) => b.count - a.count).slice(0, 8);

  // Peak Hours computation
  const hourlyCounts: Record<number, number> = {};
  completedOrders.forEach((o) => {
    const hour = new Date(o.createdAt || Date.now()).getHours();
    hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
  });

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
            Business Insights &amp; Intelligence
          </h1>
          <p className="text-[14px] text-secondary mt-1">
            Real-time analytics, revenue trends, peak ordering velocity, and dish popularity
          </p>
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Settled Revenue</div>
          <div className="text-[28px] font-semibold text-heading mt-2 leading-none">
            {currencySymbol}{totalRevenue.toFixed(2)}
          </div>
          <div className="text-[12px] text-success mt-1.5 flex items-center space-x-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Database Synced</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Average Order Value</div>
          <div className="text-[28px] font-semibold text-primary mt-2 leading-none">
            {currencySymbol}{avgOrderValue.toFixed(2)}
          </div>
          <div className="text-[12px] text-muted mt-1.5 font-medium">Per completed ticket</div>
        </div>

        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Best Performing Dish</div>
          <div className="text-[22px] font-semibold text-heading mt-2 leading-snug truncate">
            {bestSellers[0]?.name || 'N/A'}
          </div>
          <div className="text-[12px] text-secondary mt-1.5 font-medium">
            {bestSellers[0] ? `${bestSellers[0].count} orders punched` : 'No orders recorded'}
          </div>
        </div>

        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Total Orders Fulfilled</div>
          <div className="text-[28px] font-semibold text-info mt-2 leading-none">
            {completedOrders.length}
          </div>
          <div className="text-[12px] text-muted mt-1.5 font-medium">Recorded in PostgreSQL</div>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center space-x-1.5 overflow-x-auto bg-surface border border-border p-1 rounded-xl">
        {INSIGHTS_TABS.map((tab) => (
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

      {/* TAB CONTENT: REVENUE / TRENDS */}
      {(activeTab === 'revenue' || activeTab === 'trends') && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderLight">
            <h3 className="font-semibold text-base text-heading">Revenue Trajectory &amp; Volume</h3>
            <span className="text-xs font-semibold text-success">Live Insights</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surfaceMuted border border-borderLight space-y-1">
              <span className="text-xs text-secondary">Gross Revenue Today</span>
              <div className="text-2xl font-bold text-heading">{currencySymbol}{totalRevenue.toFixed(2)}</div>
              <span className="text-[11px] text-muted">From {completedOrders.length} settled orders</span>
            </div>
            <div className="p-4 rounded-xl bg-surfaceMuted border border-borderLight space-y-1">
              <span className="text-xs text-secondary">Catalog Dispersal</span>
              <div className="text-2xl font-bold text-heading">{menuItems.length} Dishes</div>
              <span className="text-[11px] text-muted">Active menu entries</span>
            </div>
            <div className="p-4 rounded-xl bg-surfaceMuted border border-borderLight space-y-1">
              <span className="text-xs text-secondary">Table Seat Coverage</span>
              <div className="text-2xl font-bold text-heading">{tables.length} Tables</div>
              <span className="text-[11px] text-muted">Layout capacity</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BEST SELLERS */}
      {activeTab === 'bestsellers' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderLight">
            <h3 className="font-semibold text-base text-heading">Top Ranked Menu Items by Volume</h3>
            <span className="text-xs text-primary font-semibold">{bestSellers.length} Ranked Items</span>
          </div>

          {bestSellers.length > 0 ? (
            <div className="divide-y divide-borderLight text-xs">
              {bestSellers.map((item, idx) => (
                <div key={item.name} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-heading">{item.name}</div>
                      <div className="text-muted">{item.count} orders ordered</div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-heading text-sm">
                    {currencySymbol}{item.revenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-secondary text-sm">
              No orders completed yet to calculate best-selling items.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PEAK HOURS */}
      {activeTab === 'peak' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-borderLight">
            <h3 className="font-semibold text-base text-heading">Hourly Order Distribution</h3>
            <span className="text-xs text-muted">Time-of-day order velocity</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[11, 12, 13, 14, 15, 18, 19, 20, 21, 22, 23].map((hr) => {
              const count = hourlyCounts[hr] || 0;
              const formattedTime = hr <= 12 ? `${hr}:00 AM` : `${hr - 12}:00 PM`;
              return (
                <div key={hr} className="p-3 rounded-xl bg-surfaceMuted border border-borderLight text-center space-y-1">
                  <div className="text-[11px] font-semibold text-secondary">{formattedTime}</div>
                  <div className="text-xl font-bold text-heading">{count}</div>
                  <div className="text-[10px] text-muted">{count === 1 ? 'order' : 'orders'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TABLES / STAFF */}
      {(activeTab === 'tables' || activeTab === 'staff') && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-base text-heading">
            {activeTab === 'tables' ? 'Table Turnover & Utilization' : 'Staff Sales Contribution'}
          </h3>
          <p className="text-xs text-secondary">
            {activeTab === 'tables'
              ? `${tables.length} tables active in layout. Check table occupancy and turnover rates in real time.`
              : `${staff.length} staff members registered. Tracks order attribution per worker.`}
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <Link href={activeTab === 'tables' ? '/tables' : '/staff'} className="btn-primary text-xs py-2 px-4">
              Open {activeTab === 'tables' ? 'Tables Plan' : 'Staff Directory'} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-neutral-400">Loading insights...</div>}>
      <InsightsContent />
    </Suspense>
  );
}
