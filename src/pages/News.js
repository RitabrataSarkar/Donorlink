import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNearbyNews, markInterested, incrementViewCount } from '../services/newsService';
import { isVerifiedNGO } from '../services/ngoService';
import { verifyNGOByEmail } from '../utils/adminUtils';
import { setupDevAdmin } from '../utils/setupAdmin';
import { MapPinIcon, CalendarIcon, ClockIcon, UserGroupIcon, EyeIcon, HeartIcon, CogIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import CreateNewsModal from '../components/CreateNewsModal';
import NGODashboard from '../components/NGODashboard';
import NGONewsManagement from '../components/NGONewsManagement';

const News = () => {
  const { currentUser } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [isNGO, setIsNGO] = useState(false);
  const [ngoVerificationLoading, setNgoVerificationLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNGODashboard, setShowNGODashboard] = useState(false);
  const [showNewsManagement, setShowNewsManagement] = useState(false);
  const [interestedCamps, setInterestedCamps] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to get your location. Showing all available news.';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Showing all available news.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable. Showing all available news.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Showing all available news.';
              break;
            default:
              errorMessage = 'Unable to get your location. Showing all available news.';
              break;
          }
          
          toast.error(errorMessage);
          setLocationLoading(false);
        },
        {
          timeout: 10000, // 10 second timeout
          enableHighAccuracy: false
        }
      );
    } else {
      toast.error('Geolocation not supported. Showing all available news.');
      setLocationLoading(false);
    }

    // Check if user is verified NGO
    if (currentUser) {
      console.log('Checking NGO verification for user:', currentUser.uid);
      setNgoVerificationLoading(true);
      isVerifiedNGO(currentUser.uid)
        .then((verified) => {
          console.log('NGO verification result:', verified);
          setIsNGO(verified);
          setNgoVerificationLoading(false);
        })
        .catch((error) => {
          console.error('Error checking NGO verification:', error);
          setIsNGO(false);
          setNgoVerificationLoading(false);
        });
    } else {
      setIsNGO(false);
      setNgoVerificationLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    // Only start fetching news after location loading is complete
    if (!locationLoading) {
      try {
        const unsubscribe = getNearbyNews(userLocation, (newsData) => {
          setNews(newsData);
          setLoading(false);
          setError(null);
        }, (error) => {
          console.error('Error fetching news:', error);
          if (error.code === 'failed-precondition') {
            setError('Database configuration required. Please contact administrator.');
          } else {
            setError('Failed to load news. Please try again.');
          }
          setLoading(false);
        });

        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (err) {
        console.error('Error setting up news listener:', err);
        setError('Failed to initialize news loading. Please refresh the page.');
        setLoading(false);
      }
    }
  }, [userLocation, locationLoading]);

  const handleViewNews = async (newsId) => {
    await incrementViewCount(newsId);
  };

  const handleMarkInterested = async (newsId) => {
    if (!currentUser) {
      toast.error('Please login to show interest');
      return;
    }

    try {
      await markInterested(newsId, currentUser.uid);
      setInterestedCamps(prev => new Set([...prev, newsId]));
      toast.success('Marked as interested!');
    } catch (error) {
      toast.error('Error marking interest');
    }
  };

  // Temporary admin function to verify NGO for testing
  const handleTempVerifyNGO = async () => {
    if (!currentUser) {
      toast.error('Please login first');
      return;
    }

    try {
      const result = await verifyNGOByEmail(currentUser.email);
      if (result.success) {
        toast.success('NGO verified successfully! Refreshing page...');
        // Refresh the NGO verification status
        const verified = await isVerifiedNGO(currentUser.uid);
        setIsNGO(verified);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error verifying NGO: ' + error.message);
    }
  };

  // Temporary admin setup function for testing
  const handleSetupAdmin = async () => {
    try {
      toast.loading('Setting up admin user...');
      const result = await setupDevAdmin();
      if (result.success) {
        toast.dismiss();
        toast.success('Admin user created! Email: admin@donorlink.com, Password: admin123456');
        toast.success('You can now login at /admin/login');
      }
    } catch (error) {
      toast.dismiss();
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Admin user already exists! Use admin@donorlink.com / admin123456');
      } else {
        toast.error('Error setting up admin: ' + error.message);
      }
    }
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

  const getStatusBadge = (status) => {
    const badges = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status] || badges.pending;
  };

  if (loading || locationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {locationLoading ? 'Getting your location...' : 'Loading blood donation camps...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading News</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blood Donation Camps</h1>
            <p className="mt-2 text-gray-600">
              {userLocation 
                ? `Showing camps within 100km of your location (${news.length} camps found)`
                : `Showing all upcoming camps (${news.length} camps found)`
              }
            </p>
          </div>
          
          <div className="flex space-x-3">
            {/* NGO Post News Button - Always Visible */}
            <button
              onClick={() => {
                if (!currentUser) {
                  toast.error('Please login to post camp news');
                  return;
                }
                if (ngoVerificationLoading) {
                  toast.error('Please wait while we verify your NGO status...');
                  return;
                }
                if (!isNGO) {
                  toast.error('Only verified NGOs can post camp news. Please register as an NGO first.');
                  window.open('/ngo/register', '_blank');
                  return;
                }
                setShowCreateModal(true);
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center shadow-lg"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Camp News
            </button>
            
            {/* NGO Management Buttons - Only for Verified NGOs */}
            {isNGO && (
              <>
                <button
                  onClick={() => setShowNewsManagement(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                >
                  <EyeIcon className="h-5 w-5 mr-2" />
                  Manage News
                </button>
                <button
                  onClick={() => setShowNGODashboard(true)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center"
                >
                  <CogIcon className="h-5 w-5 mr-2" />
                  NGO Dashboard
                </button>
              </>
            )}
          </div>
        </div>

        {/* Information Sections */}
        {isNGO && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">NGO News Posting Guidelines</h3>
                <div className="text-blue-800 space-y-2">
                  <p><strong>Requirements for posting camp news:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Valid government permission/approval for organizing blood donation camps</li>
                    <li>Complete venue and contact information</li>
                    <li>Future date and time for the camp</li>
                    <li>NGO verification status (automatically checked)</li>
                  </ul>
                  <p className="mt-3"><strong>Approval Process:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>All camp news submissions are reviewed before publication</li>
                    <li>Approval typically takes 24-48 hours</li>
                    <li>You'll be notified via email about the approval status</li>
                    <li>Approved camps appear in the public news feed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* News Grid */}
        {news.length === 0 ? (
          <div className="text-center py-12">
            <MapPinIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No camps found</h3>
            <p className="text-gray-600 mb-4">
              {userLocation 
                ? 'No blood donation camps found within 100km of your location.'
                : 'No upcoming blood donation camps available at the moment.'
              }
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Check back later for new camp announcements</p>
              <p>• Only verified NGOs can post camp news</p>
              <p>• Camps must have proper permissions to be displayed</p>
            </div>
            {isNGO && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Create First Camp News
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((camp) => (
              <div
                key={camp.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                onClick={() => handleViewNews(camp.id)}
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(camp.status)}`}>
                    {camp.status === 'approved' ? 'Approved' : camp.status}
                  </span>
                  {camp.distance && (
                    <span className="text-sm text-gray-500">{camp.distance} km away</span>
                  )}
                </div>

                {/* Camp Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{camp.title}</h3>

                {/* NGO Info */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Organized by:</p>
                  <p className="text-sm text-gray-600">{camp.ngoName}</p>
                  {camp.ngoRegistrationNumber && (
                    <p className="text-xs text-gray-500">Reg: {camp.ngoRegistrationNumber}</p>
                  )}
                </div>

                {/* Permission Status */}
                {camp.permissionStatus && (
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">✓ Permission Approved</p>
                    <p className="text-xs text-green-600">Authority: {camp.permissionAuthority}</p>
                    {camp.permissionNumber && (
                      <p className="text-xs text-green-600">Ref: {camp.permissionNumber}</p>
                    )}
                  </div>
                )}

                {/* Date and Time */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatDate(camp.campDate)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatTime(camp.campTime)}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-4">
                  <div className="flex items-start text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{camp.venue}</p>
                      <p className="text-xs text-gray-500">{camp.address}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {camp.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{camp.description}</p>
                )}

                {/* Stats and Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      <span>{camp.views || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      <span>{camp.interestedCount || 0} interested</span>
                    </div>
                  </div>

                  {currentUser && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkInterested(camp.id);
                      }}
                      className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                      disabled={interestedCamps.has(camp.id)}
                    >
                      {interestedCamps.has(camp.id) ? (
                        <HeartSolidIcon className="h-5 w-5" />
                      ) : (
                        <HeartIcon className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showCreateModal && (
          <CreateNewsModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
          />
        )}
        
        {showNGODashboard && (
          <NGODashboard
            isOpen={showNGODashboard}
            onClose={() => setShowNGODashboard(false)}
          />
        )}
        
        {showNewsManagement && (
          <NGONewsManagement
            isOpen={showNewsManagement}
            onClose={() => setShowNewsManagement(false)}
          />
        )}
      </div>
    </div>
  );
};

export default News;
