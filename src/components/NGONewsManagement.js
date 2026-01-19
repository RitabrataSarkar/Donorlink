import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNewsByNGO, updateNewsStatus } from '../services/newsService';
import { getNGOByUserId } from '../services/ngoService';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  EyeIcon, 
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const NGONewsManagement = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [ngoData, setNgoData] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    if (currentUser && isOpen) {
      loadNGOData();
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (ngoData && isOpen) {
      loadNGONews();
    }
  }, [ngoData, isOpen]);

  const loadNGOData = async () => {
    try {
      const ngo = await getNGOByUserId(currentUser.uid);
      setNgoData(ngo);
    } catch (error) {
      console.error('Error loading NGO data:', error);
      toast.error('Error loading NGO information');
    }
  };

  const loadNGONews = () => {
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
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Camp News</h2>
            <p className="text-gray-600">View and manage your blood donation camp announcements</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Filter Tabs */}
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
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'You haven\'t created any camp news yet. Click "Create Camp News" to get started.'
                  : `You don't have any ${filter} camp news.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredNews.map((camp) => {
                const statusBadge = getStatusBadge(camp.status);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <div
                    key={camp.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
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

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total: {news.length} news items
            </div>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGONewsManagement;
