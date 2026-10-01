'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/state';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Users,
  Award,
} from 'lucide-react';

export default function ReportsAnalyticsPage() {
  const { profile, activeOrders, menuItems } = useApp();
  const [dateRange, setDateRange] = useState<string>('30D');

  // Compute real stats from actual order data
  const completedOrders = activeOrders.filter((o) => o.status === 'COMPLETED');
  const grossRevenue = completedOrders.reduce((sum, o) => sum + (o.grandTotal || (o as any).finalTotal || o.subtotal || 0), 0);
  const totalOrders = completedOrders.length;
  const avgTicket = totalOrders > 0 ? Math.round(grossRevenue / totalOrders) : 0;
  const gstCollected = completedOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);

  // Compute top performing menu items from order line items
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  completedOrders.forEach((order) => {
    (order.items || []).forEach((item: any) => {
      const name = item.itemName || item.name || 'Unknown';
      if (!itemCounts[name]) {
        itemCounts[name] = { name, count: 0, revenue: 0 };
      }
      itemCounts[name].count += item.quantity || item.qty || 1;
      itemCounts[name].revenue += (item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1);
    });
  });

  const topDishes = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalUnits = topDishes.reduce((s, d) => s + d.count, 0);

  const fmt = (paise: number) =>
    `${profile.currencySymbol}${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
            Sales &amp; Revenue Analytics
          </h1>
          <p className="text-[14px] text-secondary mt-1">
            Revenue trends, popular item rankings, tax liabilities, and worker sales performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-surface border border-border p-1 rounded-xl">
            {['TODAY', '7D', '30D', 'MONTH'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  dateRange === range
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-secondary hover:text-main'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button className="btn-secondary text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards — live computed from real orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Gross Revenue</div>
          <div className="text-[28px] font-semibold text-heading mt-2 leading-none">{fmt(grossRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Total Orders Billed</div>
          <div className="text-[28px] font-semibold text-primary mt-2 leading-none">{totalOrders}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Avg Order Ticket</div>
          <div className="text-[28px] font-semibold text-success mt-2 leading-none">{fmt(avgTicket)}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">GST Tax Collected</div>
          <div className="text-[28px] font-semibold text-info mt-2 leading-none">{fmt(gstCollected)}</div>
        </div>
      </div>

      {/* Top Dishes Table or Empty State */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-borderLight bg-surface flex justify-between items-center">
          <h3 className="font-semibold text-base text-heading">Top Performing Menu Items</h3>
          <span className="text-xs text-muted">Sorted by sales volume</span>
        </div>
        {topDishes.length > 0 ? (
          <table className="w-full text-left text-[14px]">
            <thead className="bg-surfaceMuted text-muted text-xs font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Item Name</th>
                <th className="px-6 py-3.5">Units Sold</th>
                <th className="px-6 py-3.5">Gross Revenue</th>
                <th className="px-6 py-3.5 text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLight">
              {topDishes.map((dish, idx) => (
                <tr key={idx} className="hover:bg-surfaceMuted/50 transition">
                  <td className="px-6 py-4 font-semibold text-heading">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span>{dish.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary text-xs">{dish.count} orders</td>
                  <td className="px-6 py-4 font-semibold text-heading">{fmt(dish.revenue)}</td>
                  <td className="px-6 py-4 text-muted text-xs text-right">
                    {totalUnits > 0 ? Math.round((dish.count / totalUnits) * 100) : 0}% of total
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center space-y-3">
            <BarChart3 className="w-10 h-10 text-placeholder mx-auto" />
            <p className="text-sm text-secondary">No sales data yet.</p>
            <p className="text-xs text-muted">Complete orders from the POS to see analytics and item performance here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
