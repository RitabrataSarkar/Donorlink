import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import CitySelector from '../components/CitySelector';

const SearchDonors = () => {
  const { currentUser } = useAuth();
  const { startChat } = useChat();
  const [map, setMap] = useState(null);
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    bloodGroup: '',
    distance: 50, // Default 50km radius
    location: null
  });
  const [userLocation, setUserLocation] = useState(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    loadGoogleMaps();
    fetchDonors();
    // Remove automatic getUserLocation() call
  }, []);

  const loadGoogleMaps = async () => {
    const { Loader } = await import('@googlemaps/js-api-loader');
         const loader = new Loader({
       apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your actual API key
       version: 'weekly',
       libraries: ['places']
     });

    try {
      const google = await loader.load();
      initMap(google);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast.error('Failed to load map');
    }
  };

  const initMap = (google) => {
    const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // India center
    
    const mapInstance = new google.maps.Map(document.getElementById('search-map'), {
      center: defaultLocation,
      zoom: 10,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
          setSearchFilters(prev => ({ ...prev, location: pos }));
          if (map) {
            map.setCenter(pos);
            addUserMarker(pos, window.google);
          }
        },
        () => {
          toast.error('Unable to get your location');
        }
      );
    }
  };

  const addUserMarker = (location, google) => {
    if (map && google) {
      new google.maps.Marker({
        position: location,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(24, 24)
        }
      });
    }
  };

  const handleLocationSelect = (location) => {
    setUserLocation(location);
    setSearchFilters(prev => ({ ...prev, location: location }));
    setSelectedLocationName(location.name + (location.state ? `, ${location.state}` : ''));
    
    if (map) {
      map.setCenter({ lat: location.lat, lng: location.lng });
      addUserMarker({ lat: location.lat, lng: location.lng }, window.google);
    }
    
    toast.success(`Location set to ${location.name}`);
  };

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const donorsQuery = query(
        collection(db, 'users'),
        where('isAvailable', '==', true)
      );
      
      const querySnapshot = await getDocs(donorsQuery);
      const donorsData = [];
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) { // Exclude current user
          donorsData.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });
      
      setDonors(donorsData);
      setFilteredDonors(donorsData);
    } catch (error) {
      toast.error('Failed to fetch donors');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSearch = () => {
    if (!searchFilters.location) {
      toast.error('Please set your location first');
      return;
    }

    let filtered = donors;

    // Filter by blood group
    if (searchFilters.bloodGroup) {
      filtered = filtered.filter(donor => donor.bloodGroup === searchFilters.bloodGroup);
    }

    // Filter by distance
    if (searchFilters.location) {
      filtered = filtered.filter(donor => {
        if (donor.location) {
          const distance = calculateDistance(
            searchFilters.location.lat,
            searchFilters.location.lng,
            donor.location.lat,
            donor.location.lng
          );
          return distance <= searchFilters.distance;
        }
        return false;
      });
    }

    setFilteredDonors(filtered);
    displayDonorsOnMap(filtered, window.google);
  };

  const displayDonorsOnMap = (donorsToShow, google) => {
    if (!map || !google) return;

    // Clear existing markers
    if (window.donorMarkers) {
      window.donorMarkers.forEach(marker => marker.setMap(null));
    }
    window.donorMarkers = [];

    // Add markers for each donor
    donorsToShow.forEach(donor => {
      if (donor.location) {
        const marker = new google.maps.Marker({
          position: donor.location,
          map: map,
          title: `${donor.name} (${donor.bloodGroup})`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#DC2626" stroke="white" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${donor.bloodGroup}</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(24, 24)
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold">${donor.name}</h3>
              <p class="text-red-600 font-medium">${donor.bloodGroup}</p>
              <p class="text-sm">${donor.age} years old</p>
              <p class="text-sm">${donor.city}, ${donor.state}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        window.donorMarkers.push(marker);
      }
    });
  };

  const handleContactDonor = async (donor) => {
    if (!currentUser) {
      toast.error('Please log in to contact donors');
      return;
    }

    try {
      await startChat(donor.id, donor.name);
      toast.success(`Started chat with ${donor.name}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search for Blood Donors</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Filters</h2>
              
              <div className="space-y-4">
                {/* Blood Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group
                  </label>
                  <select
                    value={searchFilters.bloodGroup}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    className="input-field"
                  >
                    <option value="">All Blood Groups</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>

                {/* Distance Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Radius: {searchFilters.distance} km
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={searchFilters.distance}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, distance: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5km</span>
                    <span>100km</span>
                  </div>
                </div>

                {/* Location Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Your Location</h3>
                  {userLocation ? (
                    <div className="text-sm text-gray-600 mb-2">
                      <p className="font-medium">{selectedLocationName || 'Current Location'}</p>
                      <p className="text-xs">Lat: {userLocation.lat.toFixed(6)}, Lng: {userLocation.lng.toFixed(6)}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-600 mb-2">Location not set</p>
                  )}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowCitySelector(true)}
                      className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors"
                    >
                      Select City
                    </button>
                    <button
                      onClick={getUserLocation}
                      className="flex-1 text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-colors"
                    >
                      Use GPS
                    </button>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={loading || !userLocation}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? 'Searching...' : 'Search Donors'}
                </button>
              </div>

              {/* Results Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Search Results</h3>
                <p className="text-sm text-gray-600">
                  Found {filteredDonors.length} available donor{filteredDonors.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Map and Results */}
          <div className="lg:col-span-2">
            {/* Map */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Donor Locations</h2>
              <div 
                id="search-map" 
                className="w-full h-96 rounded-lg border border-gray-300"
                style={{ minHeight: '400px' }}
              ></div>
            </div>

            {/* Donor List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Donors</h2>
              
              {filteredDonors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No donors found matching your criteria</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredDonors.map(donor => (
                    <div key={donor.id} className="donor-card">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{donor.name}</h3>
                          <p className="text-red-600 font-medium">{donor.bloodGroup}</p>
                          <p className="text-sm text-gray-600">{donor.age} years old</p>
                          <p className="text-sm text-gray-600">
                            {donor.city}, {donor.state}
                          </p>
                          {userLocation && donor.location && (
                            <p className="text-sm text-gray-500">
                              {calculateDistance(
                                userLocation.lat,
                                userLocation.lng,
                                donor.location.lat,
                                donor.location.lng
                              ).toFixed(1)} km away
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleContactDonor(donor)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* City Selector Modal */}
      <CitySelector
        isOpen={showCitySelector}
        onClose={() => setShowCitySelector(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={userLocation}
      />
    </div>
  );
};

export default SearchDonors; 