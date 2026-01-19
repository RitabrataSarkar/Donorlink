import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNGOByUserId } from '../services/ngoService';
import { getNewsByNGO } from '../services/newsService';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  UserGroupIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CreateNewsModal from './CreateNewsModal';
import NGORegistration from './NGORegistration';

const NGODashboard = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [ngoData, setNgoData] = useState(null);
  const [ngoNews, setNgoNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      loadNGOData();
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (ngoData) {
      const unsubscribe = getNewsByNGO(ngoData.id, (newsData) => {
        setNgoNews(newsData);
      });

      return () => unsubscribe();
    }
  }, [ngoData]);

  const loadNGOData = async () => {
    try {
      setLoading(true);
      const ngo = await getNGOByUserId(currentUser.uid);
      setNgoData(ngo);
    } catch (error) {
      console.error('Error loading NGO data:', error);
      toast.error('Error loading NGO information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (date) => {
    if (!date) return 'Date not specified';
    const campDate = date.toDate ? date.toDate() : new Date(date);
    return campDate.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading NGO dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">NGO Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {!ngoData ? (
            /* NGO Not Registered */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">NGO Not Registered</h3>
              <p className="text-gray-600 mb-6">
                Register your NGO to create and manage blood donation camp news.
              </p>
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Register NGO
              </button>
            </div>
          ) : (
            /* NGO Dashboard Content */
            <div className="space-y-8">
              {/* NGO Status Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">NGO Verification Status</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(ngoData.verificationStatus)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ngoData.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                      ngoData.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {ngoData.verificationStatus === 'verified' ? 'Verified' :
                       ngoData.verificationStatus === 'pending' ? 'Under Review' : 'Rejected'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">NGO Name</p>
                    <p className="font-medium text-gray-900">{ngoData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registration Number</p>
                    <p className="font-medium text-gray-900">{ngoData.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="font-medium text-gray-900">{ngoData.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{ngoData.phone}</p>
                  </div>
                </div>

                {ngoData.adminNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Admin Notes:</p>
                    <p className="text-sm text-gray-800">{ngoData.adminNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Blood Donation Camps</h3>
                {ngoData.verificationStatus === 'verified' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Camp News
                  </button>
                )}
              </div>

              {/* Verification Status Message */}
              {ngoData.verificationStatus !== 'verified' && (
                <div className={`p-4 rounded-lg ${
                  ngoData.verificationStatus === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm ${
                    ngoData.verificationStatus === 'pending' ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {ngoData.verificationStatus === 'pending' 
                      ? 'Your NGO registration is under review. You will be able to create camp news once verified.'
                      : 'Your NGO registration was rejected. Please contact support for more information.'
                    }
                  </p>
                </div>
              )}

              {/* News List */}
              {ngoNews.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No camps created yet</h3>
                  <p className="text-gray-600">
                    {ngoData.verificationStatus === 'verified' 
                      ? 'Create your first blood donation camp to get started.'
                      : 'Once verified, you can create blood donation camp news here.'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ngoNews.map((camp) => (
                    <div key={camp.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Status Badge */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(camp.status)}`}>
                          {camp.status === 'approved' ? 'Approved' : 
                           camp.status === 'pending' ? 'Under Review' : 'Rejected'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Created {formatDate(camp.createdAt)}
                        </span>
                      </div>

                      {/* Camp Title */}
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{camp.title}</h4>

                      {/* Date and Location */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          <span>{formatDate(camp.campDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          <span>{camp.venue}</span>
                        </div>
                      </div>

                      {/* Permission Status */}
                      {camp.permissionStatus && (
                        <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                          <p className="text-xs font-medium text-green-800">✓ Permission Approved</p>
                          <p className="text-xs text-green-600">{camp.permissionAuthority}</p>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            <span>{camp.views || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <UserGroupIcon className="h-4 w-4 mr-1" />
                            <span>{camp.interestedCount || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Notes */}
                      {camp.adminNotes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">Admin Notes:</p>
                          <p className="text-xs text-gray-800">{camp.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CreateNewsModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />
        )}

        {showRegistrationModal && (
          <NGORegistration
            isOpen={showRegistrationModal}
            onClose={() => setShowRegistrationModal(false)}
            onSuccess={() => {
              loadNGOData();
              setShowRegistrationModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default NGODashboard;
