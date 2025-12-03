import React, { useState } from 'react';
import { Search, Filter, Eye, MoreHorizontal, Download, Calendar, MapPin, DollarSign, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Order } from '../types';

const AdminOrders = ({ orders }: { orders: Order[] }) => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const filteredOrders = orders.filter(order => {
    // 1. Status Filter
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    
    // 2. Search Filter (ID or Customer)
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());

    // 3. Date Range Filter
    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.date);
      if (startDate) {
        matchesDate = matchesDate && orderDate >= new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of the day
        matchesDate = matchesDate && orderDate <= end;
      }
    }

    // 4. Amount Range Filter
    let matchesAmount = true;
    if (minAmount) matchesAmount = matchesAmount && order.amount >= parseFloat(minAmount);
    if (maxAmount) matchesAmount = matchesAmount && order.amount <= parseFloat(maxAmount);

    // 5. Location Filter
    let matchesLocation = true;
    if (locationFilter) {
      matchesLocation = order.location.toLowerCase().includes(locationFilter.toLowerCase());
    }

    return matchesStatus && matchesSearch && matchesDate && matchesAmount && matchesLocation;
  });

  const resetFilters = () => {
    setFilterStatus('All');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setLocationFilter('');
  };

  const activeFilterCount = [
    startDate, endDate, minAmount, maxAmount, locationFilter
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
           <p className="text-sm text-gray-500">Manage and track all your store orders.</p>
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
        {/* Top Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between bg-gray-50/50 items-start lg:items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide w-full lg:w-auto">
            {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap border ${
                  filterStatus === status 
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <input 
                type="text" 
                placeholder="Search ID or Customer..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition ${
                showFilters || activeFilterCount > 0
                  ? 'bg-purple-50 border-purple-200 text-purple-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-purple-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                  {activeFilterCount}
                </span>
              )}
              {showFilters ? <ChevronUp size={14} className="ml-1"/> : <ChevronDown size={14} className="ml-1"/>}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Date Range */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <Calendar size={12}/> Date Range
                </label>
                <div className="flex gap-2">
                   <input 
                     type="date" 
                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                     value={startDate}
                     onChange={(e) => setStartDate(e.target.value)}
                   />
                   <span className="text-gray-400 self-center">-</span>
                   <input 
                     type="date" 
                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                     value={endDate}
                     onChange={(e) => setEndDate(e.target.value)}
                   />
                </div>
              </div>

              {/* Amount Range */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <DollarSign size={12}/> Amount Range
                </label>
                <div className="flex gap-2">
                   <input 
                     type="number" 
                     placeholder="Min" 
                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                     value={minAmount}
                     onChange={(e) => setMinAmount(e.target.value)}
                   />
                   <span className="text-gray-400 self-center">-</span>
                   <input 
                     type="number" 
                     placeholder="Max" 
                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                     value={maxAmount}
                     onChange={(e) => setMaxAmount(e.target.value)}
                   />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                  <MapPin size={12}/> Location
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter City or Area" 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={14} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-end">
                <button 
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4 cursor-pointer hover:text-purple-600 group flex items-center gap-1">
                  Date <ChevronDown size={12} className="opacity-0 group-hover:opacity-100 transition"/>
                </th>
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
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{order.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{order.customer}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                         <MapPin size={10} /> {order.location}
                      </div>
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
                       <p className="font-medium">No orders found matching filters</p>
                       <button onClick={resetFilters} className="mt-2 text-purple-600 text-sm font-bold hover:underline">
                         Clear all filters
                       </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-white">
          <div>Showing 1 to {Math.min(filteredOrders.length, 10)} of {filteredOrders.length} entries</div>
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