import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getPendingNGOs, 
  getPendingNews, 
  updateNGOStatus, 
  updateNewsStatus,
  subscribeToPendingItems 
} from '../services/adminService';
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  NewspaperIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { isAdminUser, adminLoading, dashboardStats, refreshStats } = useAdmin();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [pendingNews, setPendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!adminLoading && (!currentUser || !isAdminUser)) {
      navigate('/admin/login');
    }
  }, [currentUser, isAdminUser, adminLoading, navigate]);

  // Load pending items
  useEffect(() => {
    let isMounted = true;
    
    const loadPendingItems = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        const [ngos, news] = await Promise.all([
          getPendingNGOs(),
          getPendingNews()
        ]);
        
        if (isMounted) {
          setPendingNGOs(ngos || []);
          setPendingNews(news || []);
        }
      } catch (error) {
        console.error('Error loading pending items:', error);
        if (isMounted) {
          toast.error('Failed to load pending items. Please refresh the page.');
          // Set empty arrays to prevent undefined errors
          setPendingNGOs([]);
          setPendingNews([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isAdminUser && !adminLoading) {
      loadPendingItems();
      
      // Set up real-time listeners
      const unsubscribe = subscribeToPendingItems((update) => {
        if (!isMounted) return;
        
        try {
          if (update.type === 'ngos') {
            setPendingNGOs(update.data || []);
          } else if (update.type === 'news') {
            setPendingNews(update.data || []);
          }
          // Call refreshStats but don't depend on it in useEffect
          refreshStats();
        } catch (error) {
          console.error('Error in real-time listener:', error);
        }
      });

      return () => {
        isMounted = false;
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAdminUser, adminLoading]); // Added adminLoading to prevent premature execution

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleNGOAction = async (ngoId, action) => {
    try {
      setProcessing(true);
      const status = action === 'approve' ? 'verified' : 'rejected';
      await updateNGOStatus(ngoId, status, reviewNotes);
      
      toast.success(`NGO ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedItem(null);
      setReviewNotes('');
      refreshStats();
    } catch (error) {
      console.error(`Error ${action}ing NGO:`, error);
      toast.error(`Failed to ${action} NGO`);
    } finally {
      setProcessing(false);
    }
  };

  const handleNewsAction = async (newsId, action) => {
    try {
      setProcessing(true);
      const status = action === 'approve' ? 'approved' : 'rejected';
      await updateNewsStatus(newsId, status, reviewNotes);
      
      toast.success(`News ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setSelectedItem(null);
      setReviewNotes('');
      refreshStats();
    } catch (error) {
      console.error(`Error ${action}ing news:`, error);
      toast.error(`Failed to ${action} news`);
    } finally {
      setProcessing(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">DonorLink Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ShieldCheckIcon },
              { id: 'ngos', name: 'Pending NGOs', icon: UserGroupIcon, count: dashboardStats.pendingNGOs },
              { id: 'news', name: 'Pending News', icon: NewspaperIcon, count: dashboardStats.pendingNews }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending NGOs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.pendingNGOs}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending News
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.pendingNews}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Verified NGOs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.totalVerifiedNGOs}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Approved News
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {dashboardStats.totalApprovedNews}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending NGOs Tab */}
        {activeTab === 'ngos' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Pending NGO Registrations
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review and approve NGO registration requests
              </p>
            </div>
            
            {pendingNGOs.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending NGOs</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All NGO registrations have been reviewed.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingNGOs.map((ngo) => (
                  <li key={ngo.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{ngo.organizationName}</h4>
                        <p className="text-sm text-gray-600">{ngo.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Registration: {ngo.registrationNumber} | Phone: {ngo.phone}
                        </p>
                        <p className="text-sm text-gray-500">
                          Address: {ngo.address}, {ngo.city}, {ngo.state}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted: {ngo.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedItem({ ...ngo, type: 'ngo' })}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Review
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Pending News Tab */}
        {activeTab === 'news' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Pending News Posts
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review and approve blood donation camp news
              </p>
            </div>
            
            {pendingNews.length === 0 ? (
              <div className="text-center py-12">
                <NewspaperIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending news</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All news posts have been reviewed.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingNews.map((news) => (
                  <li key={news.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{news.title}</h4>
                        <p className="text-sm text-gray-600">{news.organizationName}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Date: {new Date(news.campDate).toLocaleDateString()} | 
                          Time: {news.campTime}
                        </p>
                        <p className="text-sm text-gray-500">
                          Venue: {news.venue}, {news.address}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted: {news.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedItem({ ...news, type: 'news' })}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Review
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review {selectedItem.type === 'ngo' ? 'NGO Registration' : 'News Post'}
              </h3>
              
              {selectedItem.type === 'ngo' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.organizationName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.registrationNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedItem.address}, {selectedItem.city}, {selectedItem.state}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.description}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.organizationName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Camp Date & Time</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedItem.campDate).toLocaleDateString()} at {selectedItem.campTime}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Venue</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.venue}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.address}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedItem.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedItem.contactPerson} - {selectedItem.contactPhone}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Add notes for approval/rejection..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    setReviewNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (selectedItem.type === 'ngo') {
                      handleNGOAction(selectedItem.id, 'reject');
                    } else {
                      handleNewsAction(selectedItem.id, 'reject');
                    }
                  }}
                  disabled={processing}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircleIcon className="h-4 w-4 mr-1 inline" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    if (selectedItem.type === 'ngo') {
                      handleNGOAction(selectedItem.id, 'approve');
                    } else {
                      handleNewsAction(selectedItem.id, 'approve');
                    }
                  }}
                  disabled={processing}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1 inline" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
