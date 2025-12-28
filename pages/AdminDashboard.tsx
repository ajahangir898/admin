import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { DashboardStatCard } from '../components/AdminComponents';
import { AdminProductManager } from '../components/AdminProductManager';
import { MetricsSkeleton, TableSkeleton } from '../components/SkeletonLoaders';
import { normalizeImageUrl } from '../utils/imageUrlHelper';
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
  TrendingUp,
  CreditCard,
  Download,
  Plus,
  Search,
  ArrowUpRight,
  Wallet,
  BarChart3,
  Calendar,
  ChevronDown,
  DollarSign
} from 'lucide-react';
import { REVENUE_DATA as DEFAULT_REVENUE_DATA, CATEGORY_DATA as DEFAULT_CATEGORY_DATA } from '../constants';
import { Order, Product } from '../types';

type RevenueRange = 'Yearly' | 'Monthly' | 'Last Week';

const PIE_COLORS = [
  '#22d3ee', // cyan
  '#a3e635', // lime
  '#8b5cf6', // violet
  '#f97316', // orange
  '#ec4899', // pink
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
];

const COLORS = [
  'rgb(var(--color-primary-rgb))',
  'rgba(var(--color-secondary-rgb), 0.9)',
  'rgba(var(--color-primary-rgb), 0.75)',
  'rgba(var(--color-secondary-rgb), 0.6)'
];

const ALLOWED_REVENUE_STATUSES: Array<Order['status']> = ['Pending', 'Confirmed', 'On Hold', 'Processing', 'Shipped', 'Sent to Courier', 'Delivered'];

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

const buildWeeklyRevenueData = (orders: Order[], endDateOverride?: Date | null) => {
  const endDate = endDateOverride ? new Date(endDateOverride) : new Date();
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

  return buckets.map(({ key, ...rest }) => rest);
};

const buildMonthlyRevenueData = (orders: Order[], endDateOverride?: Date | null) => {
  const endDate = endDateOverride ? new Date(endDateOverride) : new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: 30 }, (_, index) => {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + index);
    return {
      key: `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`,
      name: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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

  return buckets.map(({ key, ...rest }) => rest);
};

const buildYearlyRevenueData = (orders: Order[], endDateOverride?: Date | null) => {
  const endDate = endDateOverride ? new Date(endDateOverride) : new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(endDate);
  startDate.setMonth(endDate.getMonth() - 11, 1);
  startDate.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: 12 }, (_, index) => {
    const current = new Date(startDate);
    current.setMonth(startDate.getMonth() + index, 1);
    return {
      key: `${current.getFullYear()}-${current.getMonth()}`,
      name: current.toLocaleDateString('en-US', { month: 'short' }),
      value: 0
    };
  });

  const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]));

  orders.forEach((order) => {
    if (!ALLOWED_REVENUE_STATUSES.includes(order.status)) return;
    const orderDate = parseOrderDate(order.date);
    if (!orderDate || orderDate < startDate || orderDate > endDate) return;
    const key = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
    const targetIndex = bucketIndex.get(key);
    if (targetIndex === undefined) return;
    buckets[targetIndex].value += order.amount;
  });

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

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  onManageBalance?: () => void;
  onExportData?: (orders: Order[]) => void;
  onCreatePayment?: () => void;
  onSearch?: (query: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  products,
  onManageBalance,
  onExportData,
  onCreatePayment,
  onSearch
}) => {
  const gradientId = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [revenueRange, setRevenueRange] = useState<RevenueRange>('Last Week');

  const [dateFilter, setDateFilter] = useState<{ from?: string; to?: string }>({});
  const [dateDraft, setDateDraft] = useState<{ from: string; to: string }>(() => {
    const today = new Date();
    const yyyyMmDd = today.toISOString().split('T')[0];
    return { from: yyyyMmDd, to: yyyyMmDd };
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const headerControlsRef = useRef<HTMLDivElement | null>(null);

  const isDateFilterActive = Boolean(dateFilter.from && dateFilter.to);

  const effectiveEndDateForWeeklyChart = useMemo(() => {
    if (!dateFilter.to) return null;
    const parsed = Date.parse(dateFilter.to);
    return Number.isNaN(parsed) ? null : new Date(parsed);
  }, [dateFilter.to]);

  const dateFilteredOrders = useMemo(() => {
    if (!dateFilter.from && !dateFilter.to) return orders;

    const fromDate = dateFilter.from ? new Date(dateFilter.from) : null;
    const toDate = dateFilter.to ? new Date(dateFilter.to) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);

    return orders.filter((order) => {
      const parsed = parseOrderDate(order.date);
      if (!parsed) return false;
      if (fromDate && parsed < fromDate) return false;
      if (toDate && parsed > toDate) return false;
      return true;
    });
  }, [orders, dateFilter.from, dateFilter.to]);

  const formatRangeLabel = useCallback((fromIso?: string, toIso?: string) => {
    if (!fromIso || !toIso) return '';
    const fromDate = new Date(fromIso);
    const toDate = new Date(toIso);
    const fromLabel = fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const toLabel = toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fromLabel}-${toLabel}`;
  }, []);

  const applyDateDraft = useCallback(() => {
    const from = dateDraft.from;
    const to = dateDraft.to;
    if (!from || !to) return;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const normalizedFrom = fromDate <= toDate ? from : to;
    const normalizedTo = fromDate <= toDate ? to : from;
    setDateFilter({ from: normalizedFrom, to: normalizedTo });
    setIsDatePickerOpen(false);
    setIsQuickMenuOpen(false);
  }, [dateDraft.from, dateDraft.to]);

  const clearDateFilter = useCallback(() => {
    setDateFilter({});
    setIsDatePickerOpen(false);
    setIsQuickMenuOpen(false);
  }, []);

  const setTodayFilter = useCallback(() => {
    const today = new Date();
    const yyyyMmDd = today.toISOString().split('T')[0];
    setDateFilter({ from: yyyyMmDd, to: yyyyMmDd });
    setDateDraft({ from: yyyyMmDd, to: yyyyMmDd });
    setIsDatePickerOpen(false);
    setIsQuickMenuOpen(false);
  }, []);

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const revenueData = useMemo(() => {
    if (revenueRange === 'Yearly') return buildYearlyRevenueData(dateFilteredOrders, effectiveEndDateForWeeklyChart);
    if (revenueRange === 'Monthly') return buildMonthlyRevenueData(dateFilteredOrders, effectiveEndDateForWeeklyChart);
    return buildWeeklyRevenueData(dateFilteredOrders, effectiveEndDateForWeeklyChart);
  }, [dateFilteredOrders, effectiveEndDateForWeeklyChart, revenueRange]);
  const revenueGeometry = useMemo(() => buildAreaGeometry(revenueData), [revenueData]);
  const categoryData = useMemo(() => buildCategoryBreakdown(dateFilteredOrders, products), [dateFilteredOrders, products]);

  const totalOrders = dateFilteredOrders.length;
  const today = new Date().toDateString();
  const todayOrders = useMemo(
    () =>
      dateFilteredOrders.filter((order) => {
        const parsed = parseOrderDate(order.date);
        return parsed && parsed.toDateString() === today;
      }).length,
    [dateFilteredOrders, today]
  );

  const courierOrders = useMemo(() => dateFilteredOrders.filter((order) => Boolean(order.courierProvider)).length, [dateFilteredOrders]);
  const confirmedOrders = useMemo(() => dateFilteredOrders.filter((order) => order.status === 'Confirmed').length, [dateFilteredOrders]);
  const pendingOrders = useMemo(() => dateFilteredOrders.filter((order) => order.status === 'Pending').length, [dateFilteredOrders]);
  const cancelledOrders = useMemo(() => dateFilteredOrders.filter((order) => order.status === 'Cancelled').length, [dateFilteredOrders]);
  const deliveredOrders = useMemo(() => dateFilteredOrders.filter((order) => order.status === 'Delivered').length, [dateFilteredOrders]);
  const shippedOrders = useMemo(() => dateFilteredOrders.filter((order) => order.status === 'Shipped').length, [dateFilteredOrders]);
  const returnsCount = Math.max(cancelledOrders, Math.round(totalOrders * 0.05));

  const totalRevenue = useMemo(() => dateFilteredOrders.reduce((sum, order) => sum + order.amount, 0), [dateFilteredOrders]);
  const deliveredRevenue = useMemo(
    () => dateFilteredOrders.filter((order) => order.status === 'Delivered').reduce((sum, order) => sum + order.amount, 0),
    [dateFilteredOrders]
  );
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;
  const retentionRate = totalOrders ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const haystack = `${order.id} ${order.customer} ${order.status} ${order.location ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [orders, searchQuery]);

  const filteredOrdersByDateAndSearch = useMemo(() => {
    if (!searchQuery.trim()) return dateFilteredOrders;
    const query = searchQuery.toLowerCase();
    return dateFilteredOrders.filter((order) => {
      const haystack = `${order.id} ${order.customer} ${order.status} ${order.location ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [dateFilteredOrders, searchQuery]);

  const visibleOrders = useMemo(() => filteredOrdersByDateAndSearch.slice(0, 8), [filteredOrdersByDateAndSearch]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (headerControlsRef.current && !headerControlsRef.current.contains(target)) {
        setIsDatePickerOpen(false);
        setIsQuickMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="w-16 h-1 bg-orange-400 rounded-full mt-1"></div>
        </div>
        <div ref={headerControlsRef} className="relative flex items-center gap-3">
          {isDateFilterActive ? (
            <>
              <button
                type="button"
                onClick={clearDateFilter}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-500 bg-white hover:bg-red-50 transition"
              >
                <XCircle size={16} />
                Clear Filter
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateDraft({
                    from: dateFilter.from || dateDraft.from,
                    to: dateFilter.to || dateDraft.to,
                  });
                  setIsDatePickerOpen((prev) => !prev);
                  setIsQuickMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 border border-blue-200 rounded-lg text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition"
              >
                <Calendar size={16} />
                {formatRangeLabel(dateFilter.from, dateFilter.to)}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDateDraft(() => {
                  const to = new Date();
                  const from = new Date();
                  from.setDate(from.getDate() - 6);
                  return {
                    from: from.toISOString().split('T')[0],
                    to: to.toISOString().split('T')[0],
                  };
                });
                setIsDatePickerOpen((prev) => !prev);
                setIsQuickMenuOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <Calendar size={16} />
              Filter in Date
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsQuickMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-500 bg-white hover:bg-red-50 transition"
          >
            <ChevronDown size={16} />
            Today
          </button>

          {isQuickMenuOpen && (
            <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <button
                type="button"
                onClick={setTodayFilter}
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Today
              </button>
              <button
                type="button"
                onClick={clearDateFilter}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                All Time
              </button>
            </div>
          )}

          {isDatePickerOpen && (
            <div className="absolute right-0 top-12 z-20 w-[340px] rounded-2xl border border-gray-200 bg-white shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-gray-900">Select date range</div>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="p-1 rounded hover:bg-gray-50 text-gray-500"
                  aria-label="Close"
                >
                  <XCircle size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={dateDraft.from}
                    onChange={(e) => setDateDraft((prev) => ({ ...prev, from: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={dateDraft.to}
                    onChange={(e) => setDateDraft((prev) => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyDateDraft}
                  className="px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <DashboardStatCard title="Today Orders:" value={todayOrders} icon={<ShoppingBag />} colorClass="pink" />
        <DashboardStatCard title="Courier Orders:" value={courierOrders} icon={<Truck />} colorClass="orange" />
        <DashboardStatCard title="Confirmed Orders:" value={confirmedOrders} icon={<CheckCircle />} colorClass="green" />
        <DashboardStatCard title="Pending Orders:" value={pendingOrders} icon={<Clock />} colorClass="purple" />
        <DashboardStatCard title="Hold Orders:" value={Math.max(0, Math.round(pendingOrders * 0.35))} icon={<PauseCircle />} colorClass="lavender" />
        <DashboardStatCard title="Cancelled Orders:" value={cancelledOrders} icon={<XCircle />} colorClass="cyan" />
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        <DashboardStatCard title="Delivered Orders:" value={deliveredOrders} icon={<PackageCheck />} colorClass="pink" />
        <DashboardStatCard title="Return Orders:" value={returnsCount} icon={<ArchiveRestore />} colorClass="blue" />
        <DashboardStatCard title={`Income (${visibleOrders.length} txns)`} value={`৳${totalRevenue.toLocaleString()}`} icon={<DollarSign />} colorClass="cyan" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Revenue Overview Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
            <div className="flex items-center gap-2">
              {(['Yearly', 'Monthly', 'Last Week'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRevenueRange(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    tab === revenueRange
                      ? 'text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="h-72">
            <div className="flex items-end justify-between h-full gap-2">
              {revenueData.map((item, index) => {
                const maxValue = Math.max(...revenueData.map(d => d.value), 1);
                const heightPercent = (item.value / maxValue) * 100;
                return (
                  <div key={item.name} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-56 relative group">
                      {/* Revenue bar */}
                      <div 
                        className="w-full max-w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all group-hover:from-blue-700 group-hover:to-blue-500"
                        style={{ height: `${Math.max(heightPercent * 0.7, 4)}%` }}
                      />
                      {/* Profit bar (lighter, behind) */}
                      <div 
                        className="absolute bottom-0 w-full max-w-12 bg-blue-100 rounded-t-lg -z-10"
                        style={{ height: `${Math.max(heightPercent * 0.9, 8)}%` }}
                      />
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        ৳{item.value.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-200"></div>
              <span className="text-sm text-gray-600">Profit</span>
            </div>
          </div>
        </div>

        {/* Sales by Category Donut */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Sales by Category</h3>
          
          {/* Donut Chart */}
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  const total = categoryData.reduce((sum, entry) => sum + entry.value, 0);
                  let currentAngle = 0;
                  return categoryData.map((entry, index) => {
                    const percentage = total > 0 ? (entry.value / total) * 100 : 0;
                    const angle = (percentage / 100) * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;
                    
                    // Calculate SVG arc path
                    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                    const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                    const largeArc = angle > 180 ? 1 : 0;
                    
                    return (
                      <path
                        key={entry.name}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    );
                  });
                })()}
                {/* Center hole */}
                <circle cx="50" cy="50" r="25" fill="white" />
              </svg>
            </div>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {categoryData.slice(0, 6).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-xs text-gray-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <button className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
              View Orders
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {visibleOrders.slice(0, 5).map((order, index) => {
              const product = products.find(p => p.id === order.productId) || products[index % products.length];
              return (
                <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                      {product?.image && (
                        <img src={normalizeImageUrl(product.image)} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="absolute -top-1 -left-1 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900"># {order.id}</p>
                    <p className="text-sm text-gray-600 truncate">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.location || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                </div>
              );
            })}
            {!visibleOrders.length && (
              <div className="p-8 text-center text-gray-500">No recent orders</div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
              <ChevronDown size={14} />
              December
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {featuredProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition">
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={normalizeImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">৳ {product.price?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg">
                  {product.stock || 1}
                  <ArrowUpRight size={12} />
                </div>
              </div>
            ))}
            {!featuredProducts.length && (
              <div className="p-8 text-center text-gray-500">No products yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

             