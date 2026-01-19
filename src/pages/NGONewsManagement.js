import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNewsByNGO } from '../services/newsService';
import { getNGOByUserId, isVerifiedNGO } from '../services/ngoService';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  EyeIcon, 
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  ArrowLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NGONewsManagement = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [isVerified, setIsVerified] = useState(false);

  const checkNGOVerification = useCallback(async () => {
    try {
      const verified = await isVerifiedNGO(currentUser.uid);
      if (!verified) {
        toast.error('Access denied. Only verified NGOs can access this page.');
        navigate('/news');
        return;
      }
      setIsVerified(true);
    } catch (error) {
      console.error('Error checking NGO verification:', error);
      toast.error('Error verifying NGO status');
      navigate('/news');
    }
  }, [currentUser.uid, navigate]);

  const loadNGOData = useCallback(async () => {
    try {
      const ngo = await getNGOByUserId(currentUser.uid);
      if (ngo) {
        setNgoData(ngo);
      } else {
        toast.error('NGO information not found');
        navigate('/news');
      }
    } catch (error) {
      console.error('Error loading NGO data:', error);
      toast.error('Error loading NGO information');
      navigate('/news');
    }
  }, [currentUser.uid, navigate]);

  const loadNGONews = useCallback(() => {
    if (!ngoData) return;

    try {
      const unsubscribe = getNewsByNGO(ngoData.id, (newsData) => {
        setNews(newsData);
        setLoading(false);
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error loading NGO news:', error);
      toast.error('Error loading news');
      setLoading(false);
    }
  }, [ngoData]);

  useEffect(() => {
    if (currentUser) {
      checkNGOVerification();
      loadNGOData();
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate, checkNGOVerification, loadNGOData]);

  useEffect(() => {
    if (ngoData) {
      loadNGONews();
    }
  }, [ngoData, loadNGONews]);

  const getStatusBadge = (status) => {
    const badges = {
      approved: {
        bg: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
        text: 'Approved'
      },
      pending: {
        bg: 'bg-yellow-100 text-yellow-800',
        icon: PendingIcon,
        text: 'Pending Review'
      },
      rejected: {
        bg: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
        text: 'Rejected'
      }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (date) => {
    if (!date) return 'Date not specified';
    const campDate = date.toDate ? date.toDate() : new Date(date);
    return campDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return 'Time not specified';
    return time;
  };

  const filteredNews = news.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getFilterCount = (status) => {
    if (status === 'all') return news.length;
    return news.filter(item => item.status === status).length;
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying NGO status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/news')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Camp News</h1>
                <p className="text-gray-600">View and manage your blood donation camp announcements</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/news')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Camp
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NGO Info */}
        {ngoData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-lg">
                    {ngoData.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{ngoData.name}</h2>
                <p className="text-gray-600">Registration: {ngoData.registrationNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All News' },
                { key: 'pending', label: 'Pending' },
                { key: 'approved', label: 'Approved' },
                { key: 'rejected', label: 'Rejected' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({getFilterCount(tab.key)})
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your news...</p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No news found' : `No ${filter} news found`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all' 
                    ? 'You haven\'t created any camp news yet.'
                    : `You don't have any ${filter} camp news.`
                  }
                </p>
                {filter === 'all' && (
                  <button
                    onClick={() => navigate('/news')}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Create Your First Camp News
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredNews.map((camp) => {
                  const statusBadge = getStatusBadge(camp.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <div
                      key={camp.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Status and Date */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusBadge.bg}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {statusBadge.text}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Created: {new Date(camp.createdAt?.toDate?.() || camp.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Camp Title */}
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{camp.title}</h3>

                      {/* Camp Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {formatDate(camp.campDate)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {formatTime(camp.campTime)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {camp.venue}, {camp.address}
                        </div>
                      </div>

                      {/* Description */}
                      {camp.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {camp.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {camp.views || 0} views
                        </div>
                        <div className="flex items-center">
                          <HeartIcon className="h-4 w-4 mr-1" />
                          {camp.interestedCount || 0} interested
                        </div>
                      </div>

                      {/* Admin Notes (if rejected) */}
                      {camp.status === 'rejected' && camp.adminNotes && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{camp.adminNotes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {camp.status === 'pending' && (
                          <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            Under Review
                          </span>
                        )}
                        {camp.status === 'approved' && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            Published
                          </span>
                        )}
                        {camp.status === 'rejected' && (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            Not Published
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{getFilterCount('all')}</div>
              <div className="text-sm text-gray-600">Total News</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{getFilterCount('pending')}</div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{getFilterCount('approved')}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{getFilterCount('rejected')}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGONewsManagement;
