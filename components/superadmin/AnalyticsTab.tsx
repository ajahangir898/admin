import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Store, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsTabProps {
  systemStats: {
    totalTenants: number;
    activeTenants: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalOrders: number;
    totalUsers: number;
  };
  tenants: Array<{ id: string; createdAt?: string; status: string; plan?: string }>;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ systemStats, tenants }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [tenantGrowthData, setTenantGrowthData] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);

  useEffect(() => {
    // Generate revenue data
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const revenue: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      revenue.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 50000) + 20000,
        orders: Math.floor(Math.random() * 100) + 50,
      });
    }
    setRevenueData(revenue);

    // Generate tenant growth data
    const growth: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const tenantsOnDate = tenants.filter(t => {
        if (!t.createdAt) return false;
        const createdDate = new Date(t.createdAt);
        return createdDate <= date;
      }).length;
      growth.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tenants: tenantsOnDate,
      });
    }
    setTenantGrowthData(growth);

    // Calculate plan distribution
    const planCounts: { [key: string]: number } = {};
    tenants.forEach(t => {
      const plan = t.plan || 'starter';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    });
    const distribution = Object.entries(planCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
    setPlanDistribution(distribution);
  }, [timeRange, tenants]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `৳${systemStats.totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'emerald',
    },
    {
      title: 'Active Tenants',
      value: systemStats.activeTenants.toString(),
      change: '+8.2%',
      trend: 'up' as const,
      icon: Store,
      color: 'blue',
    },
    {
      title: 'Total Orders',
      value: systemStats.totalOrders.toLocaleString(),
      change: '+15.3%',
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'purple',
    },
    {
      title: 'Total Users',
      value: systemStats.totalUsers.toLocaleString(),
      change: '+5.1%',
      trend: 'up' as const,
      icon: Users,
      color: 'amber',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">Comprehensive platform performance metrics</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`text-${stat.color}-600`} size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                labelStyle={{ color: '#475569', fontWeight: 600 }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue (৳)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tenant Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Tenant Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tenantGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                labelStyle={{ color: '#475569', fontWeight: 600 }}
              />
              <Legend />
              <Line type="monotone" dataKey="tenants" stroke="#3b82f6" strokeWidth={2} name="Total Tenants" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Daily Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                labelStyle={{ color: '#475569', fontWeight: 600 }}
              />
              <Legend />
              <Bar dataKey="orders" fill="#8b5cf6" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <span className="text-sm text-slate-600 mb-2">Average Revenue per Tenant</span>
            <span className="text-2xl font-bold text-slate-800">
              ৳{systemStats.activeTenants > 0 
                ? Math.floor(systemStats.totalRevenue / systemStats.activeTenants).toLocaleString() 
                : '0'}
            </span>
            <span className="text-sm text-emerald-600 mt-1">+9.3% from last month</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-slate-600 mb-2">Average Orders per Tenant</span>
            <span className="text-2xl font-bold text-slate-800">
              {systemStats.activeTenants > 0 
                ? Math.floor(systemStats.totalOrders / systemStats.activeTenants).toLocaleString() 
                : '0'}
            </span>
            <span className="text-sm text-emerald-600 mt-1">+12.7% from last month</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-slate-600 mb-2">Customer Retention Rate</span>
            <span className="text-2xl font-bold text-slate-800">94.2%</span>
            <span className="text-sm text-emerald-600 mt-1">+2.1% from last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
