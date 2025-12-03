import React from 'react';
import { DashboardStatCard } from '../components/AdminComponents';
import { 
  ShoppingBag, Truck, CheckCircle, Clock, PauseCircle, XCircle, PackageCheck, ArchiveRestore,
  LayoutGrid, Layers, TrendingUp
} from 'lucide-react';
import { REVENUE_DATA, CATEGORY_DATA } from '../constants';
import { Order } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Stats Grid - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <DashboardStatCard title="Today Orders" value={Math.floor(totalOrders / 5)} icon={<ShoppingBag />} colorClass="pink" />
        <DashboardStatCard title="Courier Orders" value={courierOrders} icon={<Truck />} colorClass="purple" />
        <DashboardStatCard title="Confirmed Orders" value={confirmedOrders} icon={<CheckCircle />} colorClass="green" />
        <DashboardStatCard title="Pending Orders" value={pendingOrders} icon={<Clock />} colorClass="orange" />
        <DashboardStatCard title="Hold Orders" value="5" icon={<PauseCircle />} colorClass="red" />
        <DashboardStatCard title="Cancelled Orders" value={cancelledOrders} icon={<XCircle />} colorClass="cyan" />
        <DashboardStatCard title="Delivered Orders" value={deliveredOrders} icon={<PackageCheck />} colorClass="teal" />
        <DashboardStatCard title="Return Orders" value="8" icon={<ArchiveRestore />} colorClass="blue" />
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
         <div className="bg-indigo-50 rounded-2xl p-6 flex justify-between items-center border border-indigo-100 shadow-sm relative overflow-hidden">
             <div className="z-10">
                 <p className="text-gray-600 font-semibold mb-2">Total Products</p>
                 <h2 className="text-4xl font-extrabold text-gray-800">19</h2>
                 <p className="text-sm text-gray-500 mt-2">In stock</p>
             </div>
             <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-lg z-10">
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
                <button className="px-3 py-1 text-xs font-medium border rounded hover:bg-gray-50 transition">Yearly</button>
                <button className="px-3 py-1 text-xs font-medium border rounded hover:bg-gray-50 transition">Monthly</button>
                <button className="px-3 py-1 text-xs font-medium bg-gray-900 text-white rounded shadow-sm">Last Week</button>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  cursor={{stroke: '#8884d8', strokeWidth: 1}}
                />
                <Area type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
           <h3 className="text-lg font-bold text-gray-800 mb-6">Sales by Category</h3>
           <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={CATEGORY_DATA}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={90}
                   fill="#8884d8"
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {CATEGORY_DATA.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                   ))}
                 </Pie>
                 <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                 <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Recent Orders & Top Products - Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Recent Orders</h3>
                  <button className="text-xs font-medium text-red-500 border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition">View All</button>
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
                                          order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                          order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 
                                          order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-50 border-gray-200'
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
                  <button className="text-xs font-medium text-red-500 border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition">December</button>
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
