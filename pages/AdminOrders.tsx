import React, { useMemo, useState, useEffect } from 'react';
import { Search, Filter, Edit3, Printer, ShieldAlert, ShieldCheck, X, Package2, MapPin, Mail, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Order, CourierConfig } from '../types';
import { CourierService, FraudCheckResult } from '../services/CourierService';
import { SkeletonGridMetrics, SkeletonTable } from '../components/SkeletonLoaders';

interface AdminOrdersProps {
  orders: Order[];
  courierConfig: CourierConfig;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
}

type StatusFilter = 'all' | Order['status'];

const STATUS_COLORS: Record<Order['status'], string> = {
  Pending: 'text-amber-300 bg-amber-500/15 border border-amber-500/40',
  Confirmed: 'text-sky-200 bg-sky-500/10 border border-sky-500/30',
  Shipped: 'text-indigo-200 bg-indigo-500/10 border border-indigo-500/30',
  Delivered: 'text-emerald-200 bg-emerald-500/10 border border-emerald-500/30',
  Cancelled: 'text-rose-200 bg-rose-500/10 border border-rose-500/30'
};

const STATUSES: Order['status'][] = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(value);

const getCourierId = (order: Order) => {
  if (order.trackingId) return order.trackingId;
  if (order.courierMeta) {
    return (
      (order.courierMeta.tracking_id as string) ||
      (order.courierMeta.trackingCode as string) ||
      (order.courierMeta.consignment_id as string) ||
      (order.courierMeta.invoice as string)
    );
  }
  return undefined;
};

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, courierConfig, onUpdateOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [draftOrder, setDraftOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFraudChecking, setIsFraudChecking] = useState(false);
  const [fraudResult, setFraudResult] = useState<FraudCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const metrics = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    const pending = orders.filter((order) => order.status === 'Pending').length;
    const fulfilled = orders.filter((order) => order.status === 'Delivered').length;
    const average = total ? revenue / total : 0;
    return { total, revenue, pending, fulfilled, average };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      if (!query) return matchesStatus;
      const haystack = `${order.id} ${order.customer} ${order.location} ${order.phone || ''}`.toLowerCase();
      return matchesStatus && haystack.includes(query);
    });
  }, [orders, searchTerm, statusFilter]);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setDraftOrder({ ...order });
    setFraudResult(null);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setDraftOrder(null);
    setIsSaving(false);
    setIsFraudChecking(false);
    setFraudResult(null);
  };

  const handleDraftChange = <K extends keyof Order>(field: K, value: Order[K]) => {
    setDraftOrder((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder || !draftOrder) return;
    setIsSaving(true);
    try {
      const { id, ...updates } = draftOrder;
      onUpdateOrder(selectedOrder.id, updates);
      toast.success('Order updated');
      closeOrderModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update order';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFraudCheck = async (order: Order) => {
    setIsFraudChecking(true);
    try {
      const result = await CourierService.checkFraudRisk(order, courierConfig);
      setFraudResult(result);
      toast.success('Fraud check completed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fraud check failed';
      toast.error(message);
    } finally {
      setIsFraudChecking(false);
    }
  };

  const handlePrintInvoice = (order: Order) => {
    try {
      const courierId = getCourierId(order) || 'Pending assignment';
      const popup = window.open('', 'PRINT', 'width=900,height=700');
      if (!popup) {
        toast.error('Please allow popups to print the invoice.');
        return;
      }
      const itemLabel = order.productName ? `${order.productName}${order.variant ? ` (${order.variant.color} / ${order.variant.size})` : ''}` : 'Custom Order';
      const now = new Date().toLocaleString();
      popup.document.write(`<!doctype html>
<html>
<head>
<meta charSet="utf-8" />
<title>Invoice ${order.id}</title>
<style>
body { font-family: 'Segoe UI', Arial, sans-serif; padding: 32px; color: #0f172a; }
header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
h1 { font-size: 24px; margin: 0; }
.section { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.section h2 { margin: 0 0 12px; font-size: 16px; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.label { font-size: 12px; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px; letter-spacing: 0.05em; }
.value { font-size: 15px; font-weight: 600; color: #0f172a; }
table { width: 100%; border-collapse: collapse; margin-top: 8px; }
th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
th { text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; color: #64748b; }
footer { text-align: center; margin-top: 32px; font-size: 12px; color: #475569; }
</style>
</head>
<body>
<header>
  <div>
    <p style="text-transform: uppercase; letter-spacing: 0.2em; color: #ef4444; margin: 0;">Admin Console</p>
    <h1>Invoice ${order.id}</h1>
  </div>
  <div style="text-align: right;">
    <p class="label" style="margin:0;">Printed</p>
    <p class="value" style="margin:0;">${now}</p>
  </div>
</header>
<section class="section">
  <h2>Customer</h2>
  <div class="grid">
    <div><p class="label">Name</p><p class="value">${order.customer}</p></div>
    <div><p class="label">Phone</p><p class="value">${order.phone || 'Not Provided'}</p></div>
    <div><p class="label">Email</p><p class="value">${order.email || 'Not Provided'}</p></div>
    <div><p class="label">Division</p><p class="value">${order.division || 'N/A'}</p></div>
  </div>
  <div style="margin-top:12px;">
    <p class="label">Delivery Address</p>
    <p class="value">${order.location}</p>
  </div>
</section>
<section class="section">
  <h2>Courier</h2>
  <div class="grid">
    <div><p class="label">Provider</p><p class="value">${order.courierProvider || 'Not Assigned'}</p></div>
    <div><p class="label">Courier ID</p><p class="value">${courierId}</p></div>
    <div><p class="label">Delivery Type</p><p class="value">${order.deliveryType || 'Regular'}</p></div>
  </div>
</section>
<section class="section">
  <h2>Items</h2>
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Charge</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${itemLabel}</td>
        <td>${order.quantity || 1}</td>
        <td>${order.deliveryCharge ? formatCurrency(order.deliveryCharge) : '-'}</td>
        <td>${formatCurrency(order.amount)}</td>
      </tr>
    </tbody>
  </table>
</section>
<section class="section" style="display:flex; justify-content:flex-end;">
  <div style="width: 260px;">
    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
      <span class="label">Subtotal</span>
      <span class="value">${formatCurrency(order.amount - (order.deliveryCharge || 0))}</span>
    </div>
    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
      <span class="label">Delivery</span>
      <span class="value">${order.deliveryCharge ? formatCurrency(order.deliveryCharge) : 'Included'}</span>
    </div>
    <div style="border-top:1px solid #e2e8f0; margin-top:12px; padding-top:8px; display:flex; justify-content:space-between;">
      <span class="label" style="letter-spacing:0.1em;">Total Due</span>
      <span class="value" style="font-size:18px;">${formatCurrency(order.amount)}</span>
    </div>
  </div>
</section>
<footer>Courier ID must be shared with the customer. Thank you for using the premium admin console.</footer>
</body>
</html>`);
      popup.document.close();
      popup.focus();
      popup.print();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to print invoice';
      toast.error(message);
    }
  };

  const fraudBadge = fraudResult ? (() => {
    const status = (fraudResult.status || '').toLowerCase();
    if (['pass', 'safe', 'low'].some((cue) => status.includes(cue))) {
      return { label: fraudResult.status, color: 'text-emerald-300', icon: <ShieldCheck size={18} /> };
    }
    if (['review', 'medium', 'warn'].some((cue) => status.includes(cue))) {
      return { label: fraudResult.status, color: 'text-amber-300', icon: <AlertTriangle size={18} /> };
    }
    return { label: fraudResult.status, color: 'text-rose-300', icon: <ShieldAlert size={18} /> };
  })() : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">Operations</p>
          <h1 className="text-2xl font-bold text-white">Order Intelligence</h1>
          <p className="text-sm text-white/60">Monitor, edit, and clear every Steadfast-ready shipment.</p>
        </div>
        <div className="flex w-full flex-col gap-3 md:flex-row lg:w-auto">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder-white/40 focus:border-rose-400 focus:outline-none"
              placeholder="Search by customer, phone, or order ID"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="relative w-full md:w-48">
            <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <select
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white focus:border-rose-400 focus:outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="all">All Statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <SkeletonGridMetrics count={4} darkMode={true} />
        ) : (
        <>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1f0b0f] to-[#12080b] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Total Orders</p>
          <p className="mt-2 text-3xl font-bold text-white">{metrics.total}</p>
          <p className="text-xs text-white/40">Across all time</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#24090c] to-[#12080b] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">GMV</p>
          <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(metrics.revenue)}</p>
          <p className="text-xs text-white/40">Gross merchandise value</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a0c1c] to-[#0c0a12] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pending</p>
          <p className="mt-2 text-3xl font-bold text-white">{metrics.pending}</p>
          <p className="text-xs text-white/40">Need confirmation</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d1612] to-[#06090c] p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Avg Order</p>
          <p className="mt-2 text-3xl font-bold text-white">{formatCurrency(metrics.average)}</p>
          <p className="text-xs text-white/40">Per customer spend</p>
        </div>
        </>
        )}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#080509]/80 px-4 py-3 text-sm text-white/70">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Package2 size={16} className="text-rose-300" />
            <span>{filteredOrders.length} orders match current filters</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-emerald-300" />
            <span>{metrics.fulfilled} delivered so far</span>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0609]/80">
        <div className="overflow-x-auto">
          {isLoading ? (
            <SkeletonTable rows={5} columns={6} darkMode={true} />
          ) : (
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.2em] text-white/50">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Destination</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="cursor-pointer bg-white/0 transition hover:bg-white/5" onClick={() => openOrderModal(order)}>
                    <td className="px-6 py-4 text-white">
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-xs text-white/50">{order.date}</p>
                    </td>
                    <td className="px-6 py-4 text-white">
                      <p className="font-semibold">{order.customer}</p>
                      <p className="text-xs text-white/50">{order.phone || order.email || 'No contact'}</p>
                    </td>
                    <td className="px-6 py-4 text-white">
                      <p className="font-semibold flex items-center gap-2"><MapPin size={14} className="text-rose-300" /> {order.location}</p>
                      <p className="text-xs text-white/50">{order.division || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-300">{formatCurrency(order.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(event) => { event.stopPropagation(); openOrderModal(order); }}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:border-rose-400 hover:text-rose-300"
                          aria-label="View or edit order"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(event) => { event.stopPropagation(); handlePrintInvoice(order); }}
                          className="rounded-full border border-white/10 bg-white/5 p-2 text-white transition hover:border-rose-400 hover:text-rose-300"
                          aria-label="Print invoice"
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-white/50">
                    No orders found for the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {selectedOrder && draftOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0507] p-6 text-white shadow-2xl shadow-rose-900/40">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-rose-300">Order #{selectedOrder.id}</p>
                <h2 className="text-2xl font-semibold">Customer Intelligence</h2>
                <p className="text-sm text-white/60">Edit the payload, trigger Steadfast fraud signals, or print a branded invoice.</p>
              </div>
              <button onClick={closeOrderModal} className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition hover:border-rose-400 hover:text-white" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Customer Name</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.customer}
                      onChange={(event) => handleDraftChange('customer', event.target.value)}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Phone</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.phone || ''}
                      onChange={(event) => handleDraftChange('phone', event.target.value)}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Email</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.email || ''}
                      onChange={(event) => handleDraftChange('email', event.target.value)}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Division</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.division || ''}
                      onChange={(event) => handleDraftChange('division', event.target.value)}
                    />
                  </label>
                </div>

                <label className="space-y-2 text-sm">
                  <span className="text-white/60">Delivery Address</span>
                  <textarea
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                    value={draftOrder.location}
                    onChange={(event) => handleDraftChange('location', event.target.value)}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Amount</span>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.amount}
                      onChange={(event) => handleDraftChange('amount', Number(event.target.value))}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Delivery Charge</span>
                    <input
                      type="number"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.deliveryCharge || 0}
                      onChange={(event) => handleDraftChange('deliveryCharge', Number(event.target.value))}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Status</span>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.status}
                      onChange={(event) => handleDraftChange('status', event.target.value as Order['status'])}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Delivery Type</span>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.deliveryType || 'Regular'}
                      onChange={(event) => handleDraftChange('deliveryType', event.target.value as Order['deliveryType'])}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Express">Express</option>
                      <option value="Free">Free</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Tracking ID</span>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.trackingId || ''}
                      onChange={(event) => handleDraftChange('trackingId', event.target.value)}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-white/60">Courier Provider</span>
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-white focus:border-rose-400 focus:outline-none"
                      value={draftOrder.courierProvider || ''}
                      onChange={(event) => handleDraftChange('courierProvider', (event.target.value || undefined) as Order['courierProvider'])}
                    >
                      <option value="">Not Assigned</option>
                      <option value="Steadfast">Steadfast</option>
                      <option value="Pathao">Pathao</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Package2 size={16} className="text-rose-300" />
                    <span>Order Snapshot</span>
                  </div>
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center gap-2"><Mail size={14} className="text-white/40" /> {draftOrder.productName || 'Custom request'}</div>
                    <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-white/40" /> Qty: {draftOrder.quantity || 1}</div>
                    {draftOrder.variant && (
                      <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-white/40" /> {draftOrder.variant.color} / {draftOrder.variant.size}</div>
                    )}
                    <div className="flex items-center gap-2"><Truck size={14} className="text-white/40" /> Courier ID: {getCourierId(draftOrder) || 'Pending'}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Fraud Check</p>
                      <p className="text-xs text-white/50">Powered by Steadfast API</p>
                    </div>
                    {fraudBadge && (
                      <span className={`inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-semibold ${fraudBadge.color}`}>
                        {fraudBadge.icon}
                        {fraudBadge.label}
                      </span>
                    )}
                  </div>
                  {fraudResult && (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                      <p>Status: <span className="font-semibold text-white">{fraudResult.status}</span></p>
                      {typeof fraudResult.riskScore === 'number' && (
                        <p>Risk Score: <span className="font-semibold text-white">{fraudResult.riskScore}</span></p>
                      )}
                      {fraudResult.remarks && (
                        <p>Remarks: <span className="text-white/80">{fraudResult.remarks}</span></p>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => handleFraudCheck(draftOrder)}
                    disabled={isFraudChecking}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-400 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
                  >
                    {isFraudChecking ? 'Checking...' : 'Run Fraud Check'}
                  </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Quick Actions</p>
                  <div className="mt-3 space-y-2">
                    <button
                      onClick={() => handlePrintInvoice(draftOrder)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 py-3 text-sm font-semibold text-white transition hover:border-rose-400"
                    >
                      <Printer size={16} /> Print Invoice
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:justify-end">
              <button
                onClick={closeOrderModal}
                className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className="rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 px-8 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
