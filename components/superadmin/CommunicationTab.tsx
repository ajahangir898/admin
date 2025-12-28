import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  AlertTriangle, 
  Send, 
  Clock, 
  CheckCircle,
  Users,
  TrendingDown,
  Calendar,
  MessageSquare,
  Plus,
  X,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Types
interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'maintenance' | 'feature' | 'update' | 'alert' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'scheduled' | 'sent';
  targetTenants: string[] | 'all';
  createdBy: {
    userId: string;
    name: string;
    email: string;
  };
  scheduledFor?: string;
  sentAt?: string;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
}

interface AtRiskMerchant {
  tenantId: string;
  tenantName: string;
  subdomain: string;
  status: string;
  lastLoginAt?: string;
  lastOrderAt?: string;
  totalOrders: number;
  totalRevenue: number;
  revenueDropPercentage: number;
  riskReasons: string[];
  lastCheckedAt: string;
}

interface MerchantStats {
  totalMerchants: number;
  atRiskMerchants: number;
  healthyMerchants: number;
  merchantsWithNoLogin14Days: number;
  merchantsWithRevenueDrop: number;
  averageRevenueDrop: number;
}

interface CommunicationTabProps {}

const CommunicationTab: React.FC<CommunicationTabProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<'announcements' | 'at-risk' | 'tickets'>('announcements');
  
  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'general' as Announcement['type'],
    priority: 'medium' as Announcement['priority'],
    targetTenants: 'all' as 'all' | string[]
  });

  // At-Risk Merchants state
  const [atRiskMerchants, setAtRiskMerchants] = useState<AtRiskMerchant[]>([]);
  const [merchantStats, setMerchantStats] = useState<MerchantStats | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Load data
  useEffect(() => {
    if (activeSubTab === 'announcements') {
      loadAnnouncements();
    } else if (activeSubTab === 'at-risk') {
      loadAtRiskMerchants();
      loadMerchantStats();
    }
  }, [activeSubTab]);

  const loadAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnnouncements(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
      toast.error('Failed to load announcements');
    }
  };

  const loadAtRiskMerchants = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/merchant-tracking/at-risk', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setAtRiskMerchants(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load at-risk merchants:', error);
      toast.error('Failed to load at-risk merchants');
    }
  };

  const loadMerchantStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/merchant-tracking/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMerchantStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load merchant stats:', error);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAnnouncement)
      });

      if (response.ok) {
        toast.success('Announcement created successfully');
        setShowAnnouncementForm(false);
        setNewAnnouncement({
          title: '',
          message: '',
          type: 'general',
          priority: 'medium',
          targetTenants: 'all'
        });
        loadAnnouncements();
      } else {
        toast.error('Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const handleSendAnnouncement = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/announcements/${id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Announcement sent successfully');
        loadAnnouncements();
      } else {
        toast.error('Failed to send announcement');
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Failed to send announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Announcement deleted successfully');
        loadAnnouncements();
      } else {
        toast.error('Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleScanMerchants = async () => {
    setIsScanning(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/merchant-tracking/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Scan completed: ${result.results.atRisk} at-risk merchants found`);
        loadAtRiskMerchants();
        loadMerchantStats();
      } else {
        toast.error('Failed to scan merchants');
      }
    } catch (error) {
      console.error('Error scanning merchants:', error);
      toast.error('Failed to scan merchants');
    } finally {
      setIsScanning(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      maintenance: 'bg-orange-100 text-orange-700',
      feature: 'bg-blue-100 text-blue-700',
      update: 'bg-purple-100 text-purple-700',
      alert: 'bg-red-100 text-red-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || colors.general;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || colors.medium;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Communication & CRM</h2>
          <p className="text-slate-400 mt-1">Manage announcements, track merchant health, and support tickets</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex space-x-2 border-b border-slate-700/50">
        <button
          onClick={() => setActiveSubTab('announcements')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSubTab === 'announcements'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4 inline mr-2" />
          Bulk Announcements
        </button>
        <button
          onClick={() => setActiveSubTab('at-risk')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSubTab === 'at-risk'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          At-Risk Merchants
        </button>
        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSubTab === 'tickets'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Support Tickets
        </button>
      </div>

      {/* Announcements Tab */}
      {activeSubTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Announcements</h3>
            <button
              onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
              className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              {showAnnouncementForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showAnnouncementForm ? 'Cancel' : 'New Announcement'}
            </button>
          </div>

          {/* Announcement Form */}
          {showAnnouncementForm && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Planned maintenance on Sunday"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="Enter your announcement message..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <select
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as Announcement['type'] })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="feature">New Feature</option>
                    <option value="update">Update</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                  <select
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as Announcement['priority'] })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCreateAnnouncement}
                  className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Create Announcement
                </button>
              </div>
            </div>
          )}

          {/* Announcements List */}
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No announcements yet. Create one to get started.</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-white">{announcement.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                          {announcement.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3">{announcement.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(announcement.createdAt)}
                        </span>
                        {announcement.status === 'sent' && announcement.sentAt && (
                          <span className="flex items-center text-green-400">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Sent {formatDate(announcement.sentAt)}
                          </span>
                        )}
                        {announcement.status === 'draft' && (
                          <span className="flex items-center text-yellow-400">
                            <Clock className="w-4 h-4 mr-1" />
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {announcement.status === 'draft' && (
                        <button
                          onClick={() => handleSendAnnouncement(announcement.id)}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                          title="Send announcement"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* At-Risk Merchants Tab */}
      {activeSubTab === 'at-risk' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          {merchantStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Merchants</p>
                    <p className="text-3xl font-bold text-white mt-1">{merchantStats.totalMerchants}</p>
                  </div>
                  <Users className="w-12 h-12 text-blue-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">At-Risk Merchants</p>
                    <p className="text-3xl font-bold text-red-400 mt-1">{merchantStats.atRiskMerchants}</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-400" />
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Healthy Merchants</p>
                    <p className="text-3xl font-bold text-green-400 mt-1">{merchantStats.healthyMerchants}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">At-Risk Merchants</h3>
            <button
              onClick={handleScanMerchants}
              disabled={isScanning}
              className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Scan All Merchants'}
            </button>
          </div>

          {/* At-Risk Merchants List */}
          <div className="space-y-4">
            {atRiskMerchants.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-400">No at-risk merchants found. All merchants are healthy!</p>
              </div>
            ) : (
              atRiskMerchants.map((merchant) => (
                <div
                  key={merchant.tenantId}
                  className="bg-slate-800/50 border border-red-900/30 rounded-xl p-6 hover:border-red-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-white">{merchant.tenantName}</h4>
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                          {merchant.subdomain}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {merchant.riskReasons.map((reason, idx) => (
                            <span
                              key={idx}
                              className="flex items-center px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-sm"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {reason}
                            </span>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-slate-500">Total Orders</p>
                            <p className="text-white font-medium">{merchant.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Total Revenue</p>
                            <p className="text-white font-medium">৳{merchant.totalRevenue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Last Login</p>
                            <p className="text-white font-medium">
                              {merchant.lastLoginAt ? formatDate(merchant.lastLoginAt) : 'Never'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Last Order</p>
                            <p className="text-white font-medium">
                              {merchant.lastOrderAt ? formatDate(merchant.lastOrderAt) : 'Never'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Support Tickets Tab */}
      {activeSubTab === 'tickets' && (
        <div className="space-y-6">
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Support ticket management is available in the Support section</p>
            <p className="text-slate-500 text-sm mt-2">Use the existing support ticket system to manage merchant requests</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationTab;
