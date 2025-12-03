import React, { useState } from 'react';
import { RECENT_ORDERS } from '../constants';
import { Search, Filter, Eye, MoreHorizontal, Download } from 'lucide-react';

const AdminOrders = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = RECENT_ORDERS.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
           <p className="text-sm text-gray-500">Manage all your store orders here.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
             <Download size={16} /> Export
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-lg shadow-purple-200">
             + Create Order
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filters & Search */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  filterStatus === status 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search by ID or Customer..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4 font-bold text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 text-gray-500">{order.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{order.customer}</div>
                      <div className="text-xs text-gray-400">{order.location}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">৳ {order.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        order.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 border-gray-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition" title="View Details">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition">
                            <MoreHorizontal size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                       <div className="bg-gray-100 p-4 rounded-full mb-3">
                          <Search size={32} className="text-gray-400" />
                       </div>
                       <p className="font-medium">No orders found</p>
                       <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <div>Showing 1 to {filteredOrders.length} of {filteredOrders.length} entries</div>
          <div className="flex gap-1">
             <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
             <button className="px-3 py-1 bg-purple-600 text-white rounded shadow">1</button>
             <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
             <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;