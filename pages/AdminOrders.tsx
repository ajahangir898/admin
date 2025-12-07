
import React, { useState } from 'react';
import { Search, Filter, Eye, MoreHorizontal, Download, Calendar, MapPin, DollarSign, RefreshCw, ChevronDown, ChevronUp, Truck, Loader2, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { Order, CourierConfig } from '../types';

interface AdminOrdersProps {
  orders: Order[];
  courierConfig?: CourierConfig;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => void;
  isLoading?: boolean;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, courierConfig, onUpdateOrder, isLoading = false }) => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Courier Loading State
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

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

  const handleSendToCourier = async (order: Order) => {
    if (!courierConfig?.apiKey || !courierConfig?.secretKey) {
      alert("Please configure Steadfast Courier API keys in Settings first.");
      return;
    }

    if (!order.phone) {
      alert('This order is missing a customer phone number. Please edit the order details before sending to courier.');
      return;
    }

    if (!window.confirm(`Are you sure you want to send Order ${order.id} to Steadfast Courier?`)) {
      return;
    }

    setSendError(null);
    setProcessingOrder(order.id);

    try {
      const { CourierService } = await import('../services/CourierService');
      const result = await CourierService.sendToSteadfast(order, courierConfig);
      if (onUpdateOrder) {
        onUpdateOrder(order.id, {
          status: 'Shipped',
          trackingId: result.trackingId,
          courierProvider: 'Steadfast',
          courierMeta: {
            syncedAt: new Date().toISOString(),
            reference: result.reference,
            payload: result.payload,
            response: result.response
          }
        });
      }
      alert(`Order ${order.id} successfully sent to Steadfast Courier! Tracking ID: ${result.trackingId}`);
    } catch (error: any) {
      const message = error?.message || 'Failed to send order to Steadfast. Please try again.';
      setSendError(message);
      alert(message);
    } finally {
      setProcessingOrder(null);
    }
  };

  const activeFilterCount = [
    startDate, endDate, minAmount, maxAmount, locationFilter
  ].filter(Boolean).length;
  const skeletonRows = Array.from({ length: 6 });
  const showEmptyState = !isLoading && filteredOrders.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
           <p className="text-sm text-gray-500">Manage and track all your store orders.</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg transition text-sm font-medium shadow-lg">
             <Download size={16} /> Export
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg transition text-sm font-medium shadow-lg">
             + Create Order
           </button>
        </div>
      </div>

        {sendError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{sendError}</p>
              <button
                type="button"
                onClick={() => setSendError(null)}
                className="text-xs font-bold underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

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
            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 whitespace-nowrap">
                <Loader2 size={14} className="animate-spin text-purple-600" />
                Syncing latest orders...
              </div>
            )}
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
              {isLoading ? (
                skeletonRows.map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 bg-gray-200 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-20 bg-gray-200 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-36 bg-gray-200 rounded-full mb-2" />
                      <div className="h-3 w-24 bg-gray-100 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-16 bg-gray-200 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-24 bg-gray-200 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <div className="h-9 w-9 bg-gray-200 rounded-lg" />
                        <div className="h-9 w-9 bg-gray-200 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
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
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            order.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 border-gray-200'
                        }`}>
                            {order.status}
                        </span>
                        
                        {/* Display Clickable Tracking ID if available */}
                        {order.trackingId && (
                            <a 
                                href={`https://steadfast.com.bd/t/${order.trackingId}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"
                                title="Track on Steadfast"
                            >
                                <Truck size={10} /> {order.trackingId} <ExternalLink size={8} />
                            </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          
                          {/* Courier Action (Only if NOT already shipped/delivered/has tracking ID) */}
                          {(!order.trackingId && (order.status === 'Pending' || order.status === 'Confirmed')) && (
                            <button 
                              onClick={() => handleSendToCourier(order)}
                              disabled={processingOrder === order.id}
                              className="p-2 text-black shadow-lg transition shadow-sm flex items-center gap-1 disabled:opacity-70 disabled:cursor-not-allowed"
                              title="Send to Steadfast Courier"
                            >
                              {processingOrder === order.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Truck size={18} />
                              )}
                            </button>
                          )}

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
              ) : showEmptyState ? (
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
              ) : null}
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