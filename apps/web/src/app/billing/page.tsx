'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/state';
import { Receipt, Check, CreditCard, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function BillingPage() {
  const { profile, session, tables, staff, activeOrders } = useApp();
  const currencySymbol = profile.currencySymbol || '₹';

  const completedOrders = activeOrders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'BILLED'
  );

  return (
    <div className="p-8 sm:p-10 max-w-[1400px] mx-auto space-y-8 font-sans">
      <div className="pb-2 border-b border-borderLight">
        <h1 className="text-[28px] sm:text-[32px] font-semibold text-heading tracking-tight leading-tight">
          Restaurant Subscription &amp; Billing
        </h1>
        <p className="text-[14px] text-secondary mt-1">
          Operational plan tier, dining table quotas, and settled invoices for {profile.businessName || 'your restaurant'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CURRENT PLAN CARD */}
        <div className="card space-y-4 md:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-light text-primary">
                Active Operational Tier
              </span>
              <h3 className="text-xl font-semibold text-heading mt-2">
                Starter POS Plan
              </h3>
              <p className="text-xs text-muted">
                {profile.businessName || 'Registered Restaurant'} • Standard Dining License
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-heading">
                {currencySymbol}0<span className="text-sm font-normal text-muted">/mo</span>
              </div>
              <span className="text-[11px] text-success font-semibold">Active &amp; Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-borderLight text-xs">
            <div>
              <span className="text-muted block">Configured Tables:</span>
              <span className="font-semibold text-heading text-sm">
                {tables.length} {tables.length === 1 ? 'Table' : 'Tables'} Active
              </span>
            </div>
            <div>
              <span className="text-muted block">Staff Team:</span>
              <span className="font-semibold text-heading text-sm">
                {staff.length} {staff.length === 1 ? 'Member' : 'Members'} Registered
              </span>
            </div>
            <div>
              <span className="text-muted block">Default Currency:</span>
              <span className="font-semibold text-heading text-sm">
                {currencySymbol} ({profile.currencyCode || 'INR'})
              </span>
            </div>
            <div>
              <span className="text-muted block">Primary Owner:</span>
              <span className="font-semibold text-heading text-sm">
                {profile.email || session.email || 'Restaurant Owner'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-borderLight flex flex-wrap gap-3">
            <Link href="/subscription" className="btn-primary">
              <Sparkles className="w-4 h-4" />
              <span>Explore Upgrade Plans</span>
            </Link>
            <Link href="/settings" className="btn-secondary">
              <span>Store Settings</span>
            </Link>
          </div>
        </div>

        {/* INVOICE SUMMARY CARD */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-heading text-base">Settled Billing Invoices</h3>
            <span className="text-xs text-muted font-medium">{completedOrders.length} Billed</span>
          </div>

          {completedOrders.length > 0 ? (
            <div className="space-y-3 text-xs divide-y divide-borderLight">
              {completedOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="pt-2 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-heading">{order.orderNumber}</div>
                    <div className="text-muted text-[11px]">
                      {order.tableName || 'Counter'} • {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="font-semibold text-heading font-mono">
                    {currencySymbol}{(Number(order.grandTotal || 0) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <Receipt className="w-8 h-8 text-placeholder mx-auto" />
              <p className="text-xs text-secondary font-medium">No settled customer bills yet.</p>
              <p className="text-[11px] text-muted">
                Completed orders will automatically generate itemized tax invoices here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
