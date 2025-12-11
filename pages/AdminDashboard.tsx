import React, { useCallback, useId, useMemo, useState } from 'react';
import { DashboardStatCard } from '../components/AdminComponents';
import { AdminProductManager } from '../components/AdminProductManager';
import {
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  PauseCircle,
  XCircle,
  PackageCheck,
  ArchiveRestore,
  LayoutGrid,
  Layers,
  TrendingUp,
  CreditCard,
  Download,
  Plus,
  Search,
  ArrowUpRight,
  Wallet,
  BarChart3,
  Target
} from 'lucide-react';
import { REVENUE_DATA as DEFAULT_REVENUE_DATA, CATEGORY_DATA as DEFAULT_CATEGORY_DATA } from '../constants';
import { Order, Product } from '../types';

const COLORS = [
  'rgb(var(--color-primary-rgb))',
  'rgba(var(--color-secondary-rgb), 0.9)',
  'rgba(var(--color-primary-rgb), 0.75)',
  'rgba(var(--color-secondary-rgb), 0.6)'
];

const ALLOWED_REVENUE_STATUSES: Array<Order['status']> = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(Math.round(value || 0));

const parseOrderDate = (dateString?: string) => {
  if (!dateString) return null;
  const direct = Date.parse(dateString);
  if (!Number.isNaN(direct)) return new Date(direct);
  const sanitized = Date.parse(dateString.replace(/,/g, ''));
  return Number.isNaN(sanitized) ? null : new Date(sanitized);
};

const buildWeeklyRevenueData = (orders: Order[]) => {
  if (!orders.length) return DEFAULT_REVENUE_DATA;

  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: 7 }, (_, index) => {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + index);
    return {
      key: `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`,
      name: current.toLocaleDateString('en-US', { weekday: 'short' }),
      value: 0
    };
  });

  const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));

  orders.forEach((order) => {
    if (!ALLOWED_REVENUE_STATUSES.includes(order.status)) return;
    const orderDate = parseOrderDate(order.date);
    if (!orderDate || orderDate < startDate || orderDate > endDate) return;
    const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}-${orderDate.getDate()}`;
    const targetIndex = bucketIndex.get(key);
    if (targetIndex === undefined) return;
    buckets[targetIndex].value += order.amount;
  });

  if (buckets.every((bucket) => bucket.value === 0)) {
    return DEFAULT_REVENUE_DATA;
  }

  return buckets.map(({ key, ...rest }) => rest);
};

const buildCategoryBreakdown = (orders: Order[], products: Product[]) => {
  if (!orders.length) return DEFAULT_CATEGORY_DATA;

  const productById = new Map(products.map((product) => [product.id, product]));
  const productByName = new Map(products.map((product) => [product.name.toLowerCase(), product]));
  const totals: Record<string, number> = {};

  orders.forEach((order) => {
    if (!ALLOWED_REVENUE_STATUSES.includes(order.status)) return;
    const matchedProduct =
      (order.productId && productById.get(order.productId)) ||
      (order.productName ? productByName.get(order.productName.toLowerCase()) : undefined);
    const category = matchedProduct?.category || 'Other';
    totals[category] = (totals[category] || 0) + order.amount;
  });

  const dataset = Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return dataset.length ? dataset : DEFAULT_CATEGORY_DATA;
};

const buildAreaGeometry = (data: typeof DEFAULT_REVENUE_DATA, width = 720, height = 280) => {
  if (!data.length) {
    return {
      width,
      height,
      strokePath: '',
      fillPath: '',
      points: [] as Array<{ x: number; y: number; value: number; label: string }>
    };
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const paddingY = 24;

  const points = data.map((item, index) => {
    const normalizedY = height - paddingY - (item.value / maxValue) * (height - paddingY * 2);
    return {
      x: Math.round(index * stepX),
      y: Number.isFinite(normalizedY) ? normalizedY : height - paddingY,
      value: item.value,
      label: item.name
    };
  });

  const strokePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const fillPath = `${strokePath} L ${points[points.length - 1]?.x || width} ${height} L 0 ${height} Z`;

  return {
    width,
    height,
    strokePath,
    fillPath,
    points
  };
};

const exportOrdersToCsv = (orders: Order[]) => {
  if (typeof window === 'undefined' || !orders.length) return;
  const header = ['Order ID', 'Customer', 'Amount', 'Status', 'Date'];
  const rows = orders.map((order) => [order.id, order.customer, order.amount, order.status, order.date]);
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `dashboard-orders-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const QUICK_ACTIONS = ['Send Invoice', 'Collect Payment', 'Pay Supplier', 'Issue Refund', 'Add Note', 'Track Shipment'];

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  onManageBalance?: () => void;
  onExportData?: (orders: Order[]) => void;
  onCreatePayment?: () => void;
  onAddCard?: () => void;
  onQuickAction?: (action: string) => void;
  onSearch?: (query: string) => void;
  dailyTargets?: Array<{
    id: string;
    title?: string;
    startDate: string;
    endDate: string;
    targetAmount: number;
    createdAt: string;
  }>;
  onNavigateToDailyTarget?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  products,
  onManageBalance,
  onExportData,
  onCreatePayment,
  onAddCard,
  onQuickAction,
  onSearch,
  dailyTargets = [],
  onNavigateToDailyTarget
}) => {
  const gradientId = useId();
  const [searchQuery, setSearchQuery] = useState('');

  const revenueData = useMemo(() => buildWeeklyRevenueData(orders), [orders]);
  const revenueGeometry = useMemo(() => buildAreaGeometry(revenueData), [revenueData]);
  const categoryData = useMemo(() => buildCategoryBreakdown(orders, products), [orders, products]);

  const totalOrders = orders.length;
  const today = new Date().toDateString();
  const todayOrders = useMemo(
    () =>
      orders.filter((order) => {
        const parsed = parseOrderDate(order.date);
        return parsed && parsed.toDateString() === today;
      }).length,
    [orders, today]
  );

  const courierOrders = useMemo(() => orders.filter((order) => Boolean(order.courierProvider)).length, [orders]);
  const confirmedOrders = useMemo(() => orders.filter((order) => order.status === 'Confirmed').length, [orders]);
  const pendingOrders = useMemo(() => orders.filter((order) => order.status === 'Pending').length, [orders]);
  const cancelledOrders = useMemo(() => orders.filter((order) => order.status === 'Cancelled').length, [orders]);
  const deliveredOrders = useMemo(() => orders.filter((order) => order.status === 'Delivered').length, [orders]);
  const shippedOrders = useMemo(() => orders.filter((order) => order.status === 'Shipped').length, [orders]);
  const returnsCount = Math.max(cancelledOrders, Math.round(totalOrders * 0.05));

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.amount, 0), [orders]);
  const deliveredRevenue = useMemo(
    () => orders.filter((order) => order.status === 'Delivered').reduce((sum, order) => sum + order.amount, 0),
    [orders]
  );
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const retentionRate = totalOrders ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const cashFlow = revenueData.reduce((sum, entry) => sum + (entry?.value || 0), 0);

  const dailyLimitMax = Math.max(150000, totalRevenue * 0.65 || 150000);
  const dailyLimitUsed = Math.min(dailyLimitMax, totalRevenue * 0.38);
  const dailyLimitPercent = dailyLimitMax ? Math.round((dailyLimitUsed / dailyLimitMax) * 100) : 0;

  // Calculate active daily target
  const activeTarget = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dailyTargets.find(target => {
      const startDate = new Date(target.startDate);
      const endDate = new Date(target.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return today >= startDate && today <= endDate;
    });
  }, [dailyTargets]);

  // Calculate revenue within target period
  const targetRevenue = useMemo(() => {
    if (!activeTarget) return 0;
    const startDate = new Date(activeTarget.startDate);
    const endDate = new Date(activeTarget.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return orders.filter(order => {
      if (!ALLOWED_REVENUE_STATUSES.includes(order.status)) return false;
      const orderDate = parseOrderDate(order.date);
      return orderDate && orderDate >= startDate && orderDate <= endDate;
    }).reduce((sum, order) => sum + order.amount, 0);
  }, [activeTarget, orders]);

  const targetProgress = activeTarget && activeTarget.targetAmount > 0
    ? Math.max(0, Math.min(100, Math.round((targetRevenue / activeTarget.targetAmount) * 100)))
    : 0;

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const haystack = `${order.id} ${order.customer} ${order.status} ${order.location ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [orders, searchQuery]);

  const visibleOrders = useMemo(() => filteredOrders.slice(0, 8), [filteredOrders]);

  const featuredProducts = useMemo(() => {
    if (!products.length) return [];
    return products.slice(0, 3);
  }, [products]);

  const pieGradient = useMemo(() => {
    const total = categoryData.reduce((sum, entry) => sum + entry.value, 0);
    if (!total) return 'rgba(255,255,255,0.08) 0% 100%';
    let cursor = 0;
    return categoryData
      .map((entry, index) => {
        const start = (cursor / total) * 100;
        cursor += entry.value;
        const end = (cursor / total) * 100;
        return `${COLORS[index % COLORS.length]} ${start.toFixed(1)}% ${end.toFixed(1)}%`;
      })
      .join(', ');
  }, [categoryData]);

  const highlightCards = useMemo(
    () => [
      {
        id: 'revenue',
        label: 'Gross Revenue',
        value: formatCurrency(totalRevenue),
        delta: '+12.4%',
        description: 'vs last 7 days',
        icon: <Wallet size={22} className="text-orange-100" />,
        accent: 'from-[#361116]'
      },
      {
        id: 'average-order',
        label: 'Average Order',
        value: formatCurrency(averageOrderValue),
        delta: '+4.6%',
        description: 'per checkout',
        icon: <BarChart3 size={22} className="text-emerald-100" />,
        accent: 'from-[#0d1f1a]'
      },
      {
        id: 'retention',
        label: 'Fulfillment Rate',
        value: `${Math.min(100, retentionRate)}%`,
        delta: '+2.1%',
        description: 'orders delivered',
        icon: <TrendingUp size={22} className="text-red-100" />,
        accent: 'from-[#2a120a]'
      }
    ],
    [averageOrderValue, retentionRate, totalRevenue]
  );

  const smartSpendingLimits = useMemo(
    () => [
      { label: 'Marketing', percent: Math.min(92, dailyLimitPercent + 18), gradient: 'from-orange-500 to-red-500' },
      { label: 'Logistics', percent: Math.min(88, Math.round((courierOrders / Math.max(totalOrders, 1)) * 140)), gradient: 'from-emerald-500 to-teal-500' },
      { label: 'Operations', percent: Math.max(34, Math.round((pendingOrders / Math.max(totalOrders, 1)) * 100)), gradient: 'from-slate-500 to-slate-300' }
    ],
    [courierOrders, dailyLimitPercent, pendingOrders, totalOrders]
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setSearchQuery(nextValue);
      onSearch?.(nextValue);
    },
    [onSearch]
  );

  const handleSearchSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => event.preventDefault(), []);

  const handleManageBalance = useCallback(() => {
    if (onManageBalance) return onManageBalance();
    console.info('[AdminDashboard] Manage balance clicked');
  }, [onManageBalance]);

  const handleExport = useCallback(() => {
    if (onExportData) return onExportData(filteredOrders);
    exportOrdersToCsv(filteredOrders);
  }, [filteredOrders, onExportData]);

  const handleCreatePayment = useCallback(() => {
    if (onCreatePayment) return onCreatePayment();
    console.info('[AdminDashboard] New payment action triggered');
  }, [onCreatePayment]);

  const handleAddCard = useCallback(() => {
    if (onAddCard) return onAddCard();
    console.info('[AdminDashboard] Add card action triggered');
  }, [onAddCard]);

  const handleQuickAction = useCallback(
    (action: string) => {
      if (onQuickAction) return onQuickAction(action);
      console.info(`[AdminDashboard] Quick action executed: ${action}`);
    },
    [onQuickAction]
  );

  // Product management handlers
  const handleUpdateProduct = useCallback((product: Product) => {
    console.info('[AdminDashboard] Update product:', product.id);
  }, []);

  const handleDeleteProduct = useCallback((productId: number) => {
    console.info('[AdminDashboard] Delete product:', productId);
  }, []);

  const handleBulkAction = useCallback((ids: number[], action: string) => {
    console.info(`[AdminDashboard] Bulk action "${action}" on products:`, ids);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2">
          <button onClick={handleManageBalance} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-100 text-sm font-semibold hover:bg-white/10 transition">
            <Wallet size={16} />
            Manage Balance
          </button>
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-100 text-sm font-semibold hover:bg-white/10 transition">
            <Download size={16} />
            Export
          </button>
          <button onClick={handleCreatePayment} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold border border-transparent shadow-lg shadow-orange-800/40">
            <Plus size={16} />
            New Payment
          </button>
        </div>
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:gap-4 xl:w-auto xl:flex-row">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:flex-1 xl:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              placeholder="Search orders, clients..."
            />
          </form>
          <button onClick={handleAddCard} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-slate-100 text-sm font-semibold hover:bg-white/10 transition">
            <CreditCard size={16} />
            Add Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {highlightCards.map((card) => (
              <div key={card.id} className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.accent} via-transparent to-[#050507] p-6 shadow-[0_20px_45px_rgba(0,0,0,0.45)]`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{card.label}</p>
                    <p className="mt-2 text-3xl font-black text-white">{card.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {card.icon}
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <ArrowUpRight size={12} />
                    {card.delta}
                  </span>
                  <span>{card.description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-8">
            <DashboardStatCard title="Today Orders" value={todayOrders} icon={<ShoppingBag />} colorClass="secondary" />
            <DashboardStatCard title="Courier Orders" value={courierOrders} icon={<Truck />} colorClass="primary" />
            <DashboardStatCard title="Confirmed Orders" value={confirmedOrders} icon={<CheckCircle />} colorClass="primary" />
            <DashboardStatCard title="Pending Orders" value={pendingOrders} icon={<Clock />} colorClass="secondary" />
            <DashboardStatCard title="Hold Orders" value={Math.max(1, Math.round(pendingOrders * 0.35))} icon={<PauseCircle />} colorClass="secondary-strong" />
            <DashboardStatCard title="Cancelled Orders" value={cancelledOrders} icon={<XCircle />} colorClass="secondary" />
            <DashboardStatCard title="Delivered Orders" value={deliveredOrders} icon={<PackageCheck />} colorClass="primary-strong" />
            <DashboardStatCard title="Return Orders" value={returnsCount} icon={<ArchiveRestore />} colorClass="primary" />
          </div>

          <div className="rounded-3xl bg-gradient-to-b from-[#0b0d15] via-[#06070b] to-[#040305] border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.45)] p-6 space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Cash Flow</p>
                <p className="text-3xl font-black text-white mt-1">{formatCurrency(cashFlow)}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span className="text-emerald-300 font-semibold inline-flex items-center gap-1">
                    <ArrowUpRight size={12} />
                    +8%
                  </span>
                  <span>Weekly overview</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {['Income', 'Expense', 'Saving'].map((tab) => (
                  <button key={tab} className={`px-3 py-1 rounded-full border border-white/10 ${tab === 'Income' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 transition'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72 w-full">
              <svg viewBox={`0 0 ${revenueGeometry.width} ${revenueGeometry.height}`} preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity="0.35" />
                    <stop offset="95%" stopColor="#f87171" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={revenueGeometry.fillPath} fill={`url(#${gradientId})`} />
                <path d={revenueGeometry.strokePath} fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" />
                {revenueGeometry.points.map((point) => (
                  <g key={point.label}>
                    <circle cx={point.x} cy={point.y} r={5} fill="#0b0f14" stroke="#f87171" strokeWidth={2} />
                    <title>{`${point.label}: ${formatCurrency(point.value)}`}</title>
                  </g>
                ))}
              </svg>
              <div className="mt-4 grid grid-cols-7 text-[11px] text-slate-400">
                {revenueData.map((item) => (
                  <span key={item.name} className="text-center font-semibold">
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl p-6 flex flex-col gap-4 border border-red-500/40 shadow-lg shadow-red-900/30 relative overflow-hidden bg-gradient-to-br from-[#1a0d10] via-[#120712] to-[#050407] text-slate-100">
              <div className="z-10">
                <p className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2 tracking-wide uppercase">
                  Total Order <TrendingUp size={16} className="text-red-400" />
                </p>
                <h2 className="text-4xl font-black text-white">{totalOrders}</h2>
                <p className="text-xs text-slate-400 mt-2">
                  vs last month <span className="text-emerald-400 font-bold">+12%</span>
                </p>
              </div>
              <div className="z-10 text-right">
                <p className="text-sm font-semibold text-slate-300 mb-2">Total Sales</p>
                <h2 className="text-4xl font-black text-red-200">{formatCurrency(totalRevenue)}</h2>
                <p className="text-xs text-slate-500 mt-2">Net revenue</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-4 translate-x-4 text-red-500">
                <LayoutGrid size={150} />
              </div>
            </div>
            <div className="rounded-2xl p-6 flex items-center justify-between border border-emerald-500/40 shadow-lg shadow-emerald-900/30 relative overflow-hidden bg-gradient-to-br from-[#031912] via-[#04150f] to-[#020605] text-emerald-50 gap-4">
              <div className="z-10">
                <p className="text-sm font-semibold text-emerald-200 mb-2 tracking-wide uppercase">Total Products</p>
                <h2 className="text-4xl font-black text-white">{products.length}</h2>
                <p className="text-xs text-emerald-200/70 mt-2">In stock</p>
              </div>
              <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center text-emerald-300 shadow-2xl shadow-emerald-900/50 z-10 border border-emerald-500/40">
                <Layers size={32} />
              </div>
              <div className="absolute left-0 bottom-0 opacity-10 transform translate-y-4 -translate-x-4 text-emerald-500">
                <Layers size={150} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-[#241612] via-[#130b08] to-[#050304] border border-white/10 shadow-[0_25px_55px_rgba(0,0,0,0.45)] p-6 text-white space-y-8">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3 py-1">
                <span className="text-white">Credit</span>
                <span className="px-3 py-0.5 rounded-full border border-white/10 text-slate-400">Debit</span>
              </div>
              <button onClick={handleAddCard} className="text-orange-300 inline-flex items-center gap-1">
                <Plus size={12} /> Add Card
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Card Number</p>
                <p className="text-xl font-black tracking-[0.2em] mt-2">**** **** 6541</p>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em]">Card Holder</p>
                  <p className="text-base font-semibold mt-1">Anjuman Sharear</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.3em]">Expires</p>
                  <p className="text-base font-semibold mt-1">12/27</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-[#080a12] via-[#05070a] to-[#030304] border border-white/10 shadow-[0_25px_55px_rgba(0,0,0,0.45)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Quick Action</h3>
              <button onClick={() => handleQuickAction('manage_limits')} className="text-xs font-semibold text-slate-300 border border-white/10 rounded-full px-3 py-1 hover:bg-white/10 transition">
                Manage
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {QUICK_ACTIONS.map((action) => (
                <button key={action} onClick={() => handleQuickAction(action)} className="rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-100 py-3 hover:bg-white/10 transition">
                  {action}
                </button>
              ))}
            </div>
            <div className="pt-5 border-t border-white/5 space-y-4">
              <div>
                <p className="text-sm text-slate-400">Daily Limit</p>
                <p className="text-xl font-black text-white">
                  {formatCurrency(dailyLimitUsed)}
                  <span className="text-sm text-slate-500 font-medium"> used from {formatCurrency(dailyLimitMax)}</span>
                </p>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${dailyLimitPercent}%` }}></div>
              </div>
              <div className="space-y-3">
                {smartSpendingLimits.map((limit) => (
                  <div key={limit.label} className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="w-24 text-slate-300 font-semibold">{limit.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/5">
                      <div className={`h-full rounded-full bg-gradient-to-r ${limit.gradient}`} style={{ width: `${limit.percent}%` }}></div>
                    </div>
                    <span className="w-10 text-right text-slate-200 font-semibold">{limit.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Target Widget */}
          {activeTarget && (
            <div className="rounded-3xl bg-gradient-to-br from-[#1a0d10] via-[#0a050a] to-[#030304] border border-violet-500/40 shadow-[0_25px_55px_rgba(139,92,246,0.15)] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                    <Target size={20} className="text-violet-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Daily Target</h3>
                    <p className="text-xs text-slate-400">{activeTarget.title || 'Current Period'}</p>
                  </div>
                </div>
                {onNavigateToDailyTarget && (
                  <button 
                    onClick={onNavigateToDailyTarget}
                    className="text-xs font-semibold text-violet-300 border border-violet-500/40 rounded-full px-3 py-1 hover:bg-violet-500/10 transition"
                  >
                    Manage
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Current Progress</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(targetRevenue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Target</p>
                    <p className="text-xl font-bold text-violet-200">{formatCurrency(activeTarget.targetAmount)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Achievement</span>
                    <span className={`font-bold ${targetProgress >= 100 ? 'text-emerald-300' : targetProgress >= 75 ? 'text-violet-300' : 'text-amber-300'}`}>
                      {targetProgress}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        targetProgress >= 100 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                          : targetProgress >= 75
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{ width: `${targetProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Period</span>
                  <span className="text-slate-300 font-semibold">
                    {new Date(activeTarget.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {new Date(activeTarget.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-gradient-to-b from-[#090b12] via-[#05080a] to-[#030405] p-6 border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.35)] text-slate-100">
            <h3 className="text-lg font-bold text-white mb-6 tracking-wide">Sales by Category</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-full relative shadow-inner shadow-black/60" style={{ background: `conic-gradient(${pieGradient})` }}>
                <div className="absolute inset-6 bg-[#05070b] rounded-full flex flex-col items-center justify-center text-center border border-white/10">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Total</span>
                  <span className="text-2xl font-black text-white">{formatCurrency(categoryData.reduce((sum, entry) => sum + entry.value, 0))}</span>
                  <span className="text-[11px] text-slate-400">by category</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-sm text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <span className="text-slate-400 font-bold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a0b12] via-[#05060a] to-[#030304] shadow-[0_20px_45px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="p-5 border-b border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-white tracking-wide">Recent Orders</h3>
            <button onClick={() => handleQuickAction('view_all_orders')} className="text-xs font-semibold text-white/90 border border-red-400/40 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600/70 to-emerald-500/70 hover:shadow-lg hover:shadow-emerald-900/30 transition">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-slate-400 font-semibold uppercase tracking-[0.2em] text-[11px]">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {visibleOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-4 font-black text-white tracking-wide">{order.id}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{order.customer}</div>
                      <div className="text-xs text-slate-500 mt-1">{order.date}</div>
                    </td>
                    <td className="px-5 py-4 text-emerald-200 font-semibold">{formatCurrency(order.amount)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          order.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-200 border-amber-400/40'
                            : order.status === 'Confirmed'
                              ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/40'
                              : order.status === 'Delivered'
                                ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/40'
                                : order.status === 'Shipped'
                                  ? 'bg-sky-500/15 text-sky-200 border-sky-400/40'
                                  : 'bg-white/5 text-slate-300 border-white/10'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!visibleOrders.length && (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-500 text-sm">
                      No orders match “{searchQuery}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#090b13] via-[#05060a] to-[#020203] shadow-[0_20px_45px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="p-5 border-b border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-white tracking-wide">Top Products</h3>
            <button onClick={() => handleQuickAction('filter_top_products')} className="text-xs font-semibold text-white/90 border border-emerald-400/40 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/70 to-red-500/70 hover:shadow-lg hover:shadow-red-900/30 transition">
              December
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {featuredProducts.map((product) => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/10 rounded-lg flex-shrink-0 border border-white/10 overflow-hidden">
                    <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white line-clamp-1">{product.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{formatCurrency(product.price)}</p>
                  </div>
                </div>
                <span className="bg-emerald-500/15 text-emerald-200 text-xs font-bold px-2 py-1 rounded-full border border-emerald-400/40 flex items-center gap-1">
                  {product.stock ?? 0}
                  <TrendingUp size={10} />
                </span>
              </div>
            ))}
            {!featuredProducts.length && (
              <div className="p-6 text-center text-sm text-slate-500">Add products to see leaderboard.</div>
            )}
          </div>
        </div>

        {/* Advanced Product Management Section */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#090b13] via-[#05060a] to-[#020203] shadow-[0_20px_45px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="p-5 border-b border-white/10">
            <h3 className="font-bold text-white tracking-wide">Product Management</h3>
            <p className="text-xs text-slate-400 mt-1">Advanced filtering, sorting, and bulk operations for inventory management</p>
          </div>
          <div className="overflow-hidden">
            <AdminProductManager 
              products={products}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onBulkAction={handleBulkAction}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
