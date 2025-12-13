import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { DueTransaction } from '../types';
import { dueListService } from '../services/DueListService';

interface DueHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DueHistoryModal: React.FC<DueHistoryModalProps> = ({ isOpen, onClose }) => {
  const [transactions, setTransactions] = useState<DueTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Paid' | 'Cancelled'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dueListService.getTransactions(
        undefined,
        undefined,
        undefined,
        filterStatus !== 'all' ? filterStatus : undefined
      );
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transaction history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (transactionId: string, newStatus: string) => {
    try {
      await dueListService.updateTransactionStatus(transactionId, newStatus);
      fetchTransactions();
    } catch (err) {
      setError('Failed to update transaction');
      console.error(err);
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await dueListService.deleteTransaction(transactionId);
      fetchTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200 pb-4">
            {['all', 'Pending', 'Paid', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status as any);
                  setTransactions([]);
                }}
                className={`px-4 py-2 font-medium transition ${
                  filterStatus === status
                    ? 'text-pink-600 border-b-2 border-pink-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status === 'all' ? 'All Transactions' : status}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              No transactions found
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg font-semibold text-sm text-gray-700">
                <div className="col-span-2">Entity</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Action</div>
              </div>

              {/* Transaction Rows */}
              {transactions.map(transaction => (
                <div
                  key={transaction._id}
                  className="grid grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition items-center"
                >
                  <div className="col-span-2">
                    <p className="font-medium text-gray-900">{transaction.entityName}</p>
                    {transaction.notes && (
                      <p className="text-sm text-gray-600 truncate">{transaction.notes}</p>
                    )}
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      transaction.direction === 'INCOME'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {transaction.direction === 'INCOME' ? 'Get' : 'Give'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className={`font-semibold ${
                      transaction.direction === 'INCOME' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {transaction.direction === 'INCOME' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </p>
                    {transaction.dueDate && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(transaction.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <select
                      value={transaction.status}
                      onChange={e => handleStatusChange(transaction._id!, e.target.value)}
                      className={`px-3 py-1 rounded text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer ${
                        transaction.status === 'Paid'
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => handleDelete(transaction._id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete transaction"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DueHistoryModal;
