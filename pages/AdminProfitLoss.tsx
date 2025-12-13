import React, { useState, useMemo, useRef } from 'react';
import { ArrowLeft, Download, RefreshCw, Calendar, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import { Order } from '../types';

interface AdminProfitLossProps {
  orders: Order[];
  onBack?: () => void;
}

interface DateRange {
  from: string;
  to: string;
}

const AdminProfitLoss: React.FC<AdminProfitLossProps> = ({ orders, onBack }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      from: thirtyDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    };
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Filter orders by date range and completed status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      
      const inDateRange = orderDate >= fromDate && orderDate <= toDate;
      const isCompleted = order.status === 'Delivered' || order.status === 'Completed';
      
      return inDateRange && isCompleted;
    });
  }, [orders, dateRange]);

  // Calculate profit/loss metrics
  const metrics = useMemo(() => {
    let totalSelling = 0;
    let totalPurchasePrice = 0;
    let totalDeliveryPrice = 0;

    filteredOrders.forEach(order => {
      // Selling price (total order value)
      totalSelling += order.total || 0;
      
      // Purchase price (cost price - usually stored as originalPrice or we estimate as 60% of selling)
      // In a real system, you'd have cost price per product
      const estimatedCost = (order.total || 0) * 0.6; // 60% cost assumption
      totalPurchasePrice += estimatedCost;
      
      // Delivery price from order
      totalDeliveryPrice += order.deliveryCharge || 0;
    });

    const profitFromSale = totalSelling - totalPurchasePrice - totalDeliveryPrice;

    return {
      selling: totalSelling,
      purchasePrice: totalPurchasePrice,
      deliveryPrice: totalDeliveryPrice,
      profitFromSale,
      // These would come from other data sources in a complete system
      otherIncome: 0,
      otherExpense: 0,
      totalProfitLoss: profitFromSale // + otherIncome - otherExpense
    };
  }, [filteredOrders]);

  const formatCurrency = (amount: number) => {
    return `৳ ${amount.toLocaleString('en-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDateDisplay = () => {
    const from = new Date(dateRange.from);
    const to = new Date(dateRange.to);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${from.toLocaleDateString('en-US', options)} - ${to.toLocaleDateString('en-US', options)}`;
  };

  const handleRefresh = () => {
    // Trigger re-calculation by resetting date to same values
    setDateRange({ ...dateRange });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Profit/Loss Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #fff; color: #333; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
          .title { font-size: 24px; font-weight: bold; }
          .date-range { color: #666; font-size: 14px; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
          .card { background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
          .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .row:last-child { border-bottom: none; }
          .row-label { color: #555; }
          .row-value { font-weight: 600; }
          .row-value.positive { color: #22c55e; }
          .row-value.negative { color: #ef4444; }
          .total-card { background: #f0f9ff; border: 2px solid #3b82f6; }
          .total-label { font-weight: bold; color: #1e40af; }
          .total-value { font-size: 24px; font-weight: bold; color: ${metrics.totalProfitLoss >= 0 ? '#22c55e' : '#ef4444'}; }
          .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Profit/Loss Report</div>
          <div class="date-range">${formatDateDisplay()}</div>
        </div>

        <div class="section">
          <div class="section-title">Profit From Sale</div>
          <div class="card">
            <div class="row">
              <span class="row-label">Selling</span>
              <span class="row-value">${formatCurrency(metrics.selling)}</span>
            </div>
            <div class="row">
              <span class="row-label">Purchase Price of the Product</span>
              <span class="row-value negative">(-) ${formatCurrency(metrics.purchasePrice)}</span>
            </div>
            <div class="row">
              <span class="row-label">Delivery Price of the Product</span>
              <span class="row-value negative">(-) ${formatCurrency(metrics.deliveryPrice)}</span>
            </div>
            <div class="row" style="border-top: 2px solid #ddd; margin-top: 8px; padding-top: 16px;">
              <span class="row-label" style="font-weight: 600; color: #3b82f6;">Profit from Sale</span>
              <span class="row-value positive">(+) ${formatCurrency(metrics.profitFromSale)}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Other Income</div>
          <div class="card">
            <div class="row">
              <span class="row-label" style="font-weight: 600;">Gross Income (Other)</span>
              <span class="row-value positive">(+) ${formatCurrency(metrics.otherIncome)}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Other Expense</div>
          <div class="card">
            <div class="row">
              <span class="row-label" style="font-weight: 600;">Total Expense (Other)</span>
              <span class="row-value negative">(-) ${formatCurrency(metrics.otherExpense)}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="card total-card">
            <div class="row" style="border: none;">
              <div>
                <div class="total-label">TOTAL PROFIT/LOSS</div>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">(Profit from sale + other income) - Total cost</div>
              </div>
              <span class="total-value">${formatCurrency(metrics.totalProfitLoss)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800">Profit Loss Report</h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Printer size={18} />
            Download/Print
          </button>

          <div className="relative" ref={datePickerRef}>
            <button 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm text-gray-700">{formatDateDisplay()}</span>
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 min-w-[280px]">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">Refresh</span>
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-4xl">
        {/* Column Headers */}
        <div className="flex justify-between items-center mb-4 px-4">
          <span className="text-blue-600 font-semibold">Description</span>
          <span className="text-blue-600 font-semibold">Total</span>
        </div>

        {/* Profit From Sale Section */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-4 border-b border-gray-300 pb-2">
            Profit From Sale
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Selling</span>
                <span className="font-medium text-gray-900">{formatCurrency(metrics.selling)}</span>
              </div>
              <div className="flex justify-between items-center py-2 text-gray-500">
                <span>Purchase Price of the Product</span>
                <span>(-) {formatCurrency(metrics.purchasePrice)}</span>
              </div>
              <div className="flex justify-between items-center py-2 text-gray-500">
                <span>Delivery Price of the Product</span>
                <span>(-) {formatCurrency(metrics.deliveryPrice)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-2">
                <span className="text-blue-600 font-medium">Profit from Sale</span>
                <span className="text-green-600 font-semibold">(+) {formatCurrency(metrics.profitFromSale)}</span>
              </div>

              {/* See Details Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm"
                >
                  {isDetailsOpen ? 'Hide Details' : 'See Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {isDetailsOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Breakdown ({filteredOrders.length} orders)</h4>
                  {filteredOrders.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2 text-gray-600">Order ID</th>
                            <th className="text-left p-2 text-gray-600">Date</th>
                            <th className="text-right p-2 text-gray-600">Amount</th>
                            <th className="text-right p-2 text-gray-600">Delivery</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.slice(0, 20).map((order, idx) => (
                            <tr key={order.id || idx} className="border-b border-gray-100">
                              <td className="p-2 text-gray-800">#{order.id?.toString().slice(-6) || idx + 1}</td>
                              <td className="p-2 text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                              <td className="p-2 text-right text-gray-800">{formatCurrency(order.total || 0)}</td>
                              <td className="p-2 text-right text-gray-600">{formatCurrency(order.deliveryCharge || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredOrders.length > 20 && (
                        <p className="text-center text-gray-500 text-sm mt-2">
                          Showing 20 of {filteredOrders.length} orders
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No completed orders in selected date range</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Other Income Section */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-4 border-b border-gray-300 pb-2">
            Other Income
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-800">Gross Income (Other)</span>
              <span className="text-green-600 font-semibold">(+) {formatCurrency(metrics.otherIncome)}</span>
            </div>
          </div>
        </div>

        {/* Other Expense Section */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-4 border-b border-gray-300 pb-2">
            Other Expense
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-800">Total Expense (Other)</span>
              <span className="text-red-500 font-semibold">(-) {formatCurrency(metrics.otherExpense)}</span>
            </div>
          </div>
        </div>

        {/* Total Profit/Loss Section */}
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-gray-800 text-lg">TOTAL PROFIT/LOSS</span>
                <p className="text-sm text-gray-500 mt-1">(Profit from sale + other income) - Total cost</p>
              </div>
              <span className={`text-2xl font-bold ${metrics.totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.totalProfitLoss)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfitLoss;
