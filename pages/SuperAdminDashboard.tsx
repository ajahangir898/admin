import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Store, CreditCard, TrendingUp, TrendingDown,
  Activity, Server, Globe, Shield, Settings, Bell, Search, Menu,
  ChevronDown, MoreVertical, ArrowUpRight, ArrowDownRight, Eye,
  Calendar, Filter, Download, RefreshCw, Zap, Database, HardDrive,
  Cpu, Wifi, AlertTriangle, CheckCircle, Clock, BarChart3, PieChart,
  LineChart, Building2, UserPlus, DollarSign, Package, ShoppingCart,
  MessageSquare, Mail, Phone, MapPin, ExternalLink, Plus, Trash2,
  Edit, Copy, Star, Crown, Sparkles, Rocket, Target, Award, Layers
} from 'lucide-react';

// Types
interface TenantStats {
  id: string;
  name: string;
  subdomain: string;
  plan: 'starter' | 'growth' | 'enterprise';
  status: 'active' | 'trialing' | 'suspended';
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  lastActivity: string;
}

interface SystemStats {
  totalTenants: number;
  activeTenants: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  totalUsers: number;
  serverLoad: number;
  uptime: string;
  diskUsage: number;
  memoryUsage: number;
}

const SuperAdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with real API calls
  const systemStats: SystemStats = {
    totalTenants: 156,
    activeTenants: 142,
    totalRevenue: 4250000,
    monthlyRevenue: 485000,
    totalOrders: 28450,
    totalUsers: 1250,
    serverLoad: 34,
    uptime: '99.98%',
    diskUsage: 45,
    memoryUsage: 62
  };

  const topTenants: TenantStats[] = [
    { id: '1', name: 'OPBD Fashion', subdomain: 'opbd', plan: 'enterprise', status: 'active', totalOrders: 2450, totalRevenue: 485000, activeUsers: 45, lastActivity: '2 min ago' },
    { id: '2', name: 'StyleHub BD', subdomain: 'stylehub', plan: 'growth', status: 'active', totalOrders: 1820, totalRevenue: 320000, activeUsers: 32, lastActivity: '5 min ago' },
    { id: '3', name: 'TechMart Online', subdomain: 'techmart', plan: 'enterprise', status: 'active', totalOrders: 1560, totalRevenue: 890000, activeUsers: 28, lastActivity: '12 min ago' },
    { id: '4', name: 'FoodieExpress', subdomain: 'foodie', plan: 'starter', status: 'trialing', totalOrders: 245, totalRevenue: 45000, activeUsers: 8, lastActivity: '1 hour ago' },
    { id: '5', name: 'HomeDecor Plus', subdomain: 'homedecor', plan: 'growth', status: 'active', totalOrders: 980, totalRevenue: 210000, activeUsers: 15, lastActivity: '30 min ago' },
  ];

  const recentActivities = [
    { id: 1, type: 'new_tenant', message: 'New tenant "FashionBD" registered', time: '5 min ago', icon: Building2 },
    { id: 2, type: 'payment', message: 'Payment received from StyleHub BD - ৳15,000', time: '12 min ago', icon: CreditCard },
    { id: 3, type: 'alert', message: 'High traffic detected on opbd.systemnextit.com', time: '25 min ago', icon: AlertTriangle },
    { id: 4, type: 'upgrade', message: 'TechMart upgraded to Enterprise plan', time: '1 hour ago', icon: Rocket },
    { id: 5, type: 'support', message: 'New support ticket from HomeDecor Plus', time: '2 hours ago', icon: MessageSquare },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      starter: 'bg-slate-100 text-slate-700',
      growth: 'bg-blue-100 text-blue-700',
      enterprise: 'bg-purple-100 text-purple-700'
    };
    return styles[plan as keyof typeof styles] || styles.starter;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700',
      trialing: 'bg-amber-100 text-amber-700',
      suspended: 'bg-red-100 text-red-700'
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  // Pie Chart Data
  const pieChartData = [
    { label: 'Enterprise', value: 35, color: '#8b5cf6' },
    { label: 'Growth', value: 45, color: '#3b82f6' },
    { label: 'Starter', value: 20, color: '#10b981' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'} bg-slate-900 text-white transition-all duration-300 flex flex-col fixed h-full z-40`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-700/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <h1 className="font-bold text-lg">Super Admin</h1>
              <p className="text-xs text-slate-400">SystemNext IT</p>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} collapsed={!sidebarOpen} />
          <NavItem icon={Building2} label="Tenants" active={activeTab === 'tenants'} onClick={() => setActiveTab('tenants')} collapsed={!sidebarOpen} badge={systemStats.totalTenants} />
          <NavItem icon={Users} label="All Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} collapsed={!sidebarOpen} />
          <NavItem icon={ShoppingCart} label="All Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} collapsed={!sidebarOpen} />
          <NavItem icon={CreditCard} label="Subscriptions" active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')} collapsed={!sidebarOpen} />
          <NavItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} collapsed={!sidebarOpen} />
          
          <div className="pt-4 pb-2">
            {sidebarOpen && <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">System</p>}
          </div>
          
          <NavItem icon={Server} label="Server Status" active={activeTab === 'server'} onClick={() => setActiveTab('server')} collapsed={!sidebarOpen} />
          <NavItem icon={Database} label="Database" active={activeTab === 'database'} onClick={() => setActiveTab('database')} collapsed={!sidebarOpen} />
          <NavItem icon={Shield} label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} collapsed={!sidebarOpen} />
          <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} collapsed={!sidebarOpen} />
        </nav>

        {/* Collapse Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="h-12 border-t border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ChevronDown className={`w-5 h-5 transform ${sidebarOpen ? 'rotate-90' : '-rotate-90'} transition-transform`} />
        </button>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'} ml-0`}>
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg">
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tenants, users, orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 md:w-64 lg:w-80 pl-10 pr-4 py-2 bg-slate-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Period Selector */}
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="hidden sm:block px-3 sm:px-4 py-2 bg-slate-100 border-0 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <button className="p-2 hover:bg-slate-100 rounded-xl relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                SA
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-900">Super Admin</p>
                <p className="text-xs text-slate-500">admin@systemnextit.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            <StatsCard
              title="Total Tenants"
              value={systemStats.totalTenants}
              change={12}
              changeType="increase"
              icon={Building2}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              subtitle={`${systemStats.activeTenants} active`}
            />
            <StatsCard
              title="Monthly Revenue"
              value={formatCurrency(systemStats.monthlyRevenue)}
              change={8.5}
              changeType="increase"
              icon={DollarSign}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              subtitle="vs last month"
            />
            <StatsCard
              title="Total Orders"
              value={systemStats.totalOrders.toLocaleString()}
              change={15}
              changeType="increase"
              icon={ShoppingCart}
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              subtitle="All tenants"
            />
            <StatsCard
              title="Active Users"
              value={systemStats.totalUsers.toLocaleString()}
              change={-2.3}
              changeType="decrease"
              icon={Users}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
              subtitle="Last 7 days"
            />
          </div>

          {/* Pie Chart & Server Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Subscription Distribution Pie Chart */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Subscription Distribution</h3>
                <PieChart className="w-5 h-5 text-slate-400" />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* SVG Pie Chart */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Enterprise - 35% */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray="87.96 251.33"
                      strokeDashoffset="0"
                      className="transition-all duration-500"
                    />
                    {/* Growth - 45% */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="transparent"
                      stroke="#14b8a6"
                      strokeWidth="20"
                      strokeDasharray="113.1 251.33"
                      strokeDashoffset="-87.96"
                      className="transition-all duration-500"
                    />
                    {/* Starter - 20% */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="transparent"
                      stroke="#334155"
                      strokeWidth="20"
                      strokeDasharray="50.27 251.33"
                      strokeDashoffset="-201.06"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold text-slate-900">{systemStats.totalTenants}</span>
                    <span className="text-xs text-slate-500">Total</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-row sm:flex-col gap-3 sm:gap-4 flex-wrap justify-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-700">Enterprise</p>
                      <p className="text-xs text-slate-500">35% (55)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-700">Growth</p>
                      <p className="text-xs text-slate-500">45% (70)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-600"></span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-700">Starter</p>
                      <p className="text-xs text-slate-500">20% (31)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Server Status */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Server Status</h3>
                <span className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">All Systems Operational</span>
                  <span className="sm:hidden">Online</span>
                </span>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <ServerMetric label="CPU Usage" value={systemStats.serverLoad} color="violet" />
                <ServerMetric label="Memory" value={systemStats.memoryUsage} color="blue" />
                <ServerMetric label="Disk Space" value={systemStats.diskUsage} color="emerald" />
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs sm:text-sm text-slate-600">Uptime</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">{systemStats.uptime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-4 sm:mb-6 text-sm sm:text-base">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <QuickActionButton icon={Plus} label="Add Tenant" color="violet" />
                <QuickActionButton icon={UserPlus} label="Add User" color="blue" />
                <QuickActionButton icon={Download} label="Export" color="emerald" />
                <QuickActionButton icon={RefreshCw} label="Cache" color="amber" />
                <QuickActionButton icon={Mail} label="Broadcast" color="pink" />
                <QuickActionButton icon={Shield} label="Security" color="red" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Recent Activity</h3>
                <button className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All</button>
              </div>
              <div className="space-y-3 sm:space-y-4 max-h-64 overflow-y-auto">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'alert' ? 'bg-amber-100 text-amber-600' :
                      activity.type === 'payment' ? 'bg-emerald-100 text-emerald-600' :
                      activity.type === 'upgrade' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      <activity.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-slate-700 truncate">{activity.message}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Tenants Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Top Performing Tenants</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Based on revenue and orders</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl flex items-center gap-1.5 sm:gap-2">
                    <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Filter
                  </button>
                  <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1.5 sm:gap-2">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Add Tenant</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Users</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                            {tenant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{tenant.name}</p>
                            <p className="text-sm text-slate-500">{tenant.subdomain}.systemnextit.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getPlanBadge(tenant.plan)}`}>
                          {tenant.plan === 'enterprise' && <Crown className="w-3 h-3" />}
                          {tenant.plan === 'growth' && <Rocket className="w-3 h-3" />}
                          {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(tenant.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : tenant.status === 'trialing' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                          {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">{tenant.totalOrders.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-emerald-600">{formatCurrency(tenant.totalRevenue)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{tenant.activeUsers}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{tenant.lastActivity}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs sm:text-sm text-slate-500">Showing 5 of {systemStats.totalTenants} tenants</p>
              <button className="text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700">View All Tenants →</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components
const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  badge?: number;
}> = ({ icon: Icon, label, active, onClick, collapsed, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
      active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {!collapsed && (
      <>
        <span className="font-medium text-sm flex-1 text-left">{label}</span>
        {badge !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-700'}`}>
            {badge}
          </span>
        )}
      </>
    )}
  </button>
);

const StatsCard: React.FC<{
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  subtitle: string;
}> = ({ title, value, change, changeType, icon: Icon, iconBg, iconColor, subtitle }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-slate-500 truncate">{title}</p>
        <p className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 mt-0.5 sm:mt-1 truncate">{value}</p>
        <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
          <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium ${changeType === 'increase' ? 'text-emerald-600' : 'text-red-500'}`}>
            {changeType === 'increase' ? <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {Math.abs(change)}%
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 hidden sm:inline">{subtitle}</span>
        </div>
      </div>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${iconBg} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const ServerMetric: React.FC<{
  label: string;
  value: number;
  color: 'violet' | 'blue' | 'emerald';
}> = ({ label, value, color }) => {
  const colors = {
    violet: 'bg-emerald-500',
    blue: 'bg-emerald-400',
    emerald: 'bg-emerald-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <span className="text-xs sm:text-sm text-slate-600">{label}</span>
        <span className="text-xs sm:text-sm font-semibold text-slate-900">{value}%</span>
      </div>
      <div className="h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
};

const QuickActionButton: React.FC<{
  icon: React.ElementType;
  label: string;
  color: string;
}> = ({ icon: Icon, label, color }) => {
  const colors: Record<string, string> = {
    violet: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    blue: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    pink: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
  };

  return (
    <button className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl ${colors[color]} transition-colors flex flex-col items-center gap-1 sm:gap-2`}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">{label}</span>
    </button>
  );
};

export default SuperAdminDashboard;
