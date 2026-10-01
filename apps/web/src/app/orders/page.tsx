'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/state';
import {
  ClipboardList,
  Search,
  Filter,
  Printer,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
  User,
  ArrowRight,
  X,
} from 'lucide-react';
import { OrderStatus } from '@platform/types';

interface OrderRecord {
  id: string;
  orderNumber: string;
  tableNumber: string;
  orderType: string;
  workerName: string;
  status: OrderStatus;
  itemsCount: number;
  total: number;
  timeAgo: string;
  items: Array<{ name: string; qty: number; price: number }>;
}

export default function OrdersManagementPage() {
  const { profile, activeOrders } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeOrderModal, setActiveOrderModal] = useState<any | null>(null);

  const ordersList = activeOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber || `ORD-${o.id.substring(0, 4).toUpperCase()}`,
    tableNumber: o.tableName || (o as any).table?.tableName || (o.tableId ? 'Dine-In Table' : 'Takeaway Counter'),
    orderType: o.orderType || (o.tableId ? 'Dine-In' : 'Takeaway'),
    workerName: o.createdByWorkerName || (o as any).workerId || 'Cashier',
    status: o.status,
    itemsCount: o.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 0,
    total: o.grandTotal || (o as any).finalTotal || o.subtotal || 0,
    timeAgo: new Date(o.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: o.items || [],
  }));

  const filtered = ordersList.filter(
    (o) => selectedStatus === 'ALL' || o.status === selectedStatus
  );

  const activeCount = ordersList.filter((o) => o.status === 'PREPARING' || o.status === 'PLACED' || o.status === 'SERVED').length;
  const completedCount = ordersList.filter((o) => o.status === 'COMPLETED').length;
  const cancelledCount = ordersList.filter((o) => o.status === 'CANCELLED').length;

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-borderLight">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
            Orders Management
          </h1>
          <p className="text-[14px] text-secondary mt-1">
            Real-time track, inspect details, reprint thermal bills, and manage order statuses
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto bg-surface border border-border p-1 rounded-xl">
          {['ALL', 'PLACED', 'PREPARING', 'SERVED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedStatus === st
                  ? 'bg-primary-light text-primary font-semibold'
                  : 'text-secondary hover:text-main'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Total Orders Today</div>
          <div className="text-[28px] font-semibold text-heading mt-2 leading-none">{ordersList.length}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Active (Kitchen/Floor)</div>
          <div className="text-[28px] font-semibold text-primary mt-2 leading-none">{activeCount}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Completed Bills</div>
          <div className="text-[28px] font-semibold text-success mt-2 leading-none">{completedCount}</div>
        </div>
        <div className="stat-card">
          <div className="text-[14px] text-secondary font-medium">Cancelled</div>
          <div className="text-[28px] font-semibold text-danger mt-2 leading-none">{cancelledCount}</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card p-0 overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-surfaceMuted text-muted text-xs font-semibold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Table / Mode</th>
                  <th className="px-6 py-3.5">Server</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderLight">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-surfaceMuted/50 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-heading">
                      {order.orderNumber}
                      <div className="text-xs text-muted font-normal font-sans">{order.timeAgo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-heading">{order.tableNumber}</span>
                      <span className="block text-xs text-muted">{order.orderType}</span>
                    </td>
                    <td className="px-6 py-4 text-secondary text-xs">{order.workerName}</td>
                    <td className="px-6 py-4 text-secondary text-xs">{order.itemsCount} items</td>
                    <td className="px-6 py-4 font-semibold text-heading">
                      {profile.currencySymbol} {(order.total / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === 'PREPARING'
                            ? 'bg-warning-bg text-warning'
                            : order.status === 'SERVED'
                            ? 'bg-info-bg text-info'
                            : order.status === 'COMPLETED'
                            ? 'bg-success-bg text-success'
                            : 'bg-danger-bg text-danger'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setActiveOrderModal(order)}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <Eye className="w-3.5 h-3.5 text-placeholder" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <ClipboardList className="w-10 h-10 text-placeholder mx-auto" />
            <p className="text-sm text-secondary">No orders recorded for this session yet.</p>
            <p className="text-xs text-muted">Create orders from the POS terminal to see live tracking here.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {activeOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-[20px] shadow-dropdown w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-borderLight">
              <div>
                <h3 className="font-semibold text-lg text-heading">Order {activeOrderModal.orderNumber}</h3>
                <p className="text-xs text-muted">{activeOrderModal.tableNumber} • {activeOrderModal.orderType}</p>
              </div>
              <button onClick={() => setActiveOrderModal(null)} className="text-placeholder hover:text-heading">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-borderLight text-xs py-2">
              {activeOrderModal.items.map((item: any, idx: number) => (
                <div key={idx} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-heading">{item.quantity || item.qty}x {item.itemName || item.name}</span>
                  </div>
                  <span className="font-semibold text-heading">
                    {profile.currencySymbol} {(((item.unitPrice || item.price || 0) * (item.quantity || item.qty || 1)) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-borderLight flex justify-between items-center text-sm font-semibold text-heading">
              <span>Grand Total</span>
              <span className="text-primary font-bold text-base">
                {profile.currencySymbol} {(activeOrderModal.total / 100).toFixed(2)}
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setActiveOrderModal(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
