import React, { useMemo } from 'react';
import { DashboardStatCard } from '../components/AdminComponents';
import { 
  ShoppingBag, Truck, CheckCircle, Clock, PauseCircle, XCircle, PackageCheck, ArchiveRestore,
  LayoutGrid, Layers, TrendingUp
} from 'lucide-react';
import { REVENUE_DATA, CATEGORY_DATA } from '../constants';
import { Order } from '../types';

const COLORS = [
  'rgb(var(--color-primary-rgb))',
  'rgba(var(--color-secondary-rgb), 0.9)',
  'rgba(var(--color-primary-rgb), 0.75)',
  'rgba(var(--color-secondary-rgb), 0.6)'
];

const buildAreaGeometry = (data: typeof REVENUE_DATA, width = 640, height = 240) => {
  if (!data.length) {
    return {
      width,
      height,
      strokePath: '',
      fillPath: '',
      points: [] as Array<{ x: number; y: number; label: string; value: number }>
    };
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const step = data.length > 1 ? width / (data.length - 1) : width;
  const points = data.map((item, index) => {
    const x = index * step;
    const y = height - (item.value / maxValue) * height;
    return { x, y, label: item.name, value: item.value };
  });

  const strokePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const fillPath = `M 0 ${height} ${strokePath} L ${width} ${height} Z`;

  return { width, height, strokePath, fillPath, points };
};

const buildPieGradient = (data: typeof CATEGORY_DATA) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let cursor = 0;
  return data.map((item, index) => {
    const start = (cursor / total) * 360;
    cursor += item.value;
    const end = (cursor / total) * 360;
    return `${COLORS[index % COLORS.length]} ${start}deg ${end}deg`;
  }).join(', ');
};

const AdminDashboard = ({ orders }: { orders: Order[] }) => {
  // Calculate dynamic stats based on props
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const shippedOrders = orders.filter(o => o.status === 'Shipped').length;
  // Mock data for others to show UI density
  const courierOrders = 120;
  const cancelledOrders = 12;

  const gradientId = useMemo(() => `revenueGradient-${Math.random().toString(36).slice(2, 10)}`, []);
  const revenueGeometry = useMemo(() => buildAreaGeometry(REVENUE_DATA), []);
  const pieGradient = useMemo(() => buildPieGradient(CATEGORY_DATA), []);
  const totalCategorySales = CATEGORY_DATA.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Stats Grid - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <DashboardStatCard title="Today Orders" value={Math.floor(totalOrders / 5)} icon={<ShoppingBag />} colorClass="secondary" />
        <DashboardStatCard title="Courier Orders" value={courierOrders} icon={<Truck />} colorClass="primary" />
        <DashboardStatCard title="Confirmed Orders" value={confirmedOrders} icon={<CheckCircle />} colorClass="primary" />
        <DashboardStatCard title="Pending Orders" value={pendingOrders} icon={<Clock />} colorClass="secondary" />
        <DashboardStatCard title="Hold Orders" value="5" icon={<PauseCircle />} colorClass="secondary-strong" />
        <DashboardStatCard title="Cancelled Orders" value={cancelledOrders} icon={<XCircle />} colorClass="secondary" />
        <DashboardStatCard title="Delivered Orders" value={deliveredOrders} icon={<PackageCheck />} colorClass="primary-strong" />
        <DashboardStatCard title="Return Orders" value="8" icon={<ArchiveRestore />} colorClass="primary" />
      </div>

      {/* Summary Big Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-orange-50 rounded-2xl p-6 flex justify-between items-center border border-orange-100 shadow-sm relative overflow-hidden group">
             <div className="z-10">
                 <p className="text-gray-600 font-semibold mb-2 flex items-center gap-2">Total Order <TrendingUp size={16} className="text-orange-500"/></p>
                 <h2 className="text-4xl font-extrabold text-gray-800">{totalOrders}</h2>
                 <p className="text-sm text-gray-500 mt-2">vs last month <span className="text-green-500 font-bold">+12%</span></p>
             </div>
             <div className="z-10 text-right">
                 <p className="text-gray-600 font-semibold mb-2">Total Sales</p>
                 <h2 className="text-4xl font-extrabold text-orange-600">৳ {totalRevenue.toLocaleString()}</h2>
                 <p className="text-sm text-gray-500 mt-2">Net revenue</p>
             </div>
             <div className="absolute right-0 bottom-0 opacity-5 transform translate-y-4 translate-x-4">
                 <LayoutGrid size={150} />
             </div>
         </div>
         <div className="bg-green-50 rounded-2xl p-6 flex justify-between items-center border border-green-100 shadow-sm relative overflow-hidden">
             <div className="z-10">
                 <p className="text-gray-600 font-semibold mb-2">Total Products</p>
                 <h2 className="text-4xl font-extrabold text-gray-800">19</h2>
                 <p className="text-sm text-gray-500 mt-2">In stock</p>
             </div>
             <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-green-600 shadow-lg z-10">
                 <Layers size={32} />
             </div>
             <div className="absolute left-0 bottom-0 opacity-5 transform translate-y-4 -translate-x-4">
                 <Layers size={150} />
             </div>
         </div>
      </div>

      {/* Charts - Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Revenue Overview</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 transition">Yearly</button>
              <button className="px-3 py-1 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 transition">Monthly</button>
              <button className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded border border-green-600 shadow-sm">Last Week</button>
            </div>
          </div>
          <div className="h-72 w-full">
            <svg
              viewBox={`0 0 ${revenueGeometry.width} ${revenueGeometry.height}`}
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity="0.35" />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={revenueGeometry.fillPath} fill={`url(#${gradientId})`} />
              <path d={revenueGeometry.strokePath} fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
              {revenueGeometry.points.map((point) => (
                <g key={point.label}>
                  <circle cx={point.x} cy={point.y} r={5} fill="#fff" stroke="#7c3aed" strokeWidth={2} />
                  <title>{`${point.label}: ৳ ${point.value.toLocaleString()}`}</title>
                </g>
              ))}
            </svg>
            <div className="mt-4 grid grid-cols-7 text-xs text-gray-500">
              {REVENUE_DATA.map((item) => (
                <span key={item.name} className="text-center font-semibold">
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
           <h3 className="text-lg font-bold text-gray-800 mb-6">Sales by Category</h3>
           <div className="flex flex-col items-center gap-4">
             <div
               className="w-48 h-48 rounded-full relative"
               style={{ background: `conic-gradient(${pieGradient})` }}
             >
               <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center text-center">
                 <span className="text-xs text-gray-500">Total</span>
                 <span className="text-xl font-black text-gray-800">৳ {totalCategorySales.toLocaleString()}</span>
                 <span className="text-[11px] text-gray-400">by category</span>
               </div>
             </div>
             <div className="w-full space-y-3">
               {CATEGORY_DATA.map((item, index) => (
                 <div key={item.name} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <span
                       className="w-3 h-3 rounded-full"
                       style={{ background: COLORS[index % COLORS.length] }}
                     />
                     <span className="font-semibold text-gray-700">{item.name}</span>
                   </div>
                   <span className="text-gray-500 font-bold">৳ {item.value.toLocaleString()}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      {/* Recent Orders & Top Products - Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Recent Orders</h3>
                  <button className="text-xs font-medium text-orange-600 border border-orange-200 px-3 py-1.5 rounded hover:bg-orange-50 transition">View All</button>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs">
                          <tr>
                              <th className="px-5 py-4">Order ID</th>
                              <th className="px-5 py-4">Customer</th>
                              <th className="px-5 py-4">Amount</th>
                              <th className="px-5 py-4">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {orders.slice(0, 8).map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50 transition">
                                  <td className="px-5 py-4 font-bold text-gray-900">{order.id}</td>
                                  <td className="px-5 py-4">
                                      <div className="font-medium text-gray-800">{order.customer}</div>
                                      <div className="text-xs text-gray-400 mt-1">{order.date}</div>
                                  </td>
                                  <td className="px-5 py-4 text-gray-600">৳ {order.amount.toLocaleString()}</td>
                                  <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                          order.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                          order.status === 'Confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                          order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 
                                          order.status === 'Shipped' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                                        }`}>
                                          {order.status}
                                      </span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Top Products List */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Top Products</h3>
                  <button className="text-xs font-medium text-orange-600 border border-orange-200 px-3 py-1.5 rounded hover:bg-orange-50 transition">December</button>
              </div>
              <div className="divide-y divide-gray-100">
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex-shrink-0">
                              <img src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover rounded-lg" alt="thumb"/>
                          </div>
                          <div>
                              <p className="text-sm font-bold text-gray-800 line-clamp-1">Apple 20W USB-C Power Adapter</p>
                              <p className="text-xs text-gray-500 font-medium">৳ 2,200</p>
                          </div>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">3 <TrendingUp size={10} /></span>
                  </div>
                   <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex-shrink-0">
                             <img src="https://images.unsplash.com/photo-1678685888221-c4e9c71a3983?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover rounded-lg" alt="thumb"/>
                          </div>
                          <div>
                              <p className="text-sm font-bold text-gray-800 line-clamp-1">iPhone 14 Pro Max 1TB</p>
                              <p className="text-xs text-gray-500 font-medium">৳ 1,89,999</p>
                          </div>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">1 <TrendingUp size={10} /></span>
                  </div>
                   <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer">
                      <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex-shrink-0">
                             <img src="https://images.unsplash.com/photo-1599669454699-248893623040?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover rounded-lg" alt="thumb"/>
                          </div>
                          <div>
                              <p className="text-sm font-bold text-gray-800 line-clamp-1">Logitech G Pro X Headset</p>
                              <p className="text-xs text-gray-500 font-medium">৳ 12,500</p>
                          </div>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">1 <TrendingUp size={10} /></span>
                  </div>
              </div>
          </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
