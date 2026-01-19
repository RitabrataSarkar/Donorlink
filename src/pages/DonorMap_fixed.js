import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';
import CitySelector from '../components/CitySelector';

const DonorMap = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState('');

  useEffect(() => {
    const loadGoogleMaps = async () => {
      const { Loader } = await import('@googlemaps/js-api-loader');
      const loader = new Loader({
        apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
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

    loadGoogleMaps();
  }, []);

  const initMap = (google) => {
    const defaultLocation = { lat: 20.5937, lng: 78.9629 };
    
    const mapInstance = new google.maps.Map(document.getElementById('map'), {
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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(pos);
          mapInstance.setCenter(pos);
          addMarker(pos, mapInstance, google);
        },
        () => {
          addMarker(defaultLocation, mapInstance, google);
        }
      );
    } else {
      addMarker(defaultLocation, mapInstance, google);
    }

    mapInstance.addListener('click', (event) => {
      const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setCurrentLocation(clickedLocation);
      addMarker(clickedLocation, mapInstance, google);
    });
  };

  const addMarker = (location, mapInstance, google) => {
    if (marker) {
      marker.setMap(null);
    }

    const newMarker = new google.maps.Marker({
      position: location,
      map: mapInstance,
      draggable: true,
      title: 'Your Location'
    });

    newMarker.addListener('dragend', (event) => {
      const draggedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setCurrentLocation(draggedLocation);
    });

    setMarker(newMarker);
  };

  const handleUpdateLocation = async () => {
    if (!currentLocation) {
      toast.error('Please select a location on the map');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(currentUser.uid, {
        location: currentLocation,
        isAvailable: isAvailable,
        lastUpdated: new Date()
      });
      
      toast.success('Location and availability updated successfully!');
    } catch (error) {
      toast.error('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(pos);
          if (map) {
            map.setCenter(pos);
            addMarker(pos, map, window.google);
          }
          toast.success('Current location set!');
        },
        () => {
          toast.error('Unable to get your current location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    setSelectedLocationName(location.name + (location.state ? `, ${location.state}` : ''));
    
    if (map) {
      map.setCenter({ lat: location.lat, lng: location.lng });
      addMarker({ lat: location.lat, lng: location.lng }, map, window.google);
    }
    
    toast.success(`Location set to ${location.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Update Your Location & Availability</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your Location</h2>
                <p className="text-gray-600 text-sm">
                  Click on the map to set your location or use your current location
                </p>
              </div>
              
              <div 
                id="map" 
                className="w-full h-96 rounded-lg border border-gray-300"
                style={{ minHeight: '400px' }}
              ></div>
              
              <div className="mt-4 flex flex-col space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCitySelector(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Select City
                  </button>
                  <button
                    onClick={handleGetCurrentLocation}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Use GPS
                  </button>
                </div>
                {currentLocation && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium">{selectedLocationName || 'Current Location'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      I am available to donate blood
                    </span>
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    When enabled, other users can find you when searching for donors
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Current Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Availability:</span>
                      <span className={`text-sm font-medium ${
                        isAvailable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Location Set:</span>
                      <span className={`text-sm font-medium ${
                        currentLocation ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {currentLocation ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpdateLocation}
                  disabled={loading || !currentLocation}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Location & Availability'}
                </button>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Click on the map to set your location</li>
                    <li>• Drag the marker to adjust your position</li>
                    <li>• Toggle availability when you're ready to donate</li>
                    <li>• Your location will be shared with those searching for donors</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CitySelector
        isOpen={showCitySelector}
        onClose={() => setShowCitySelector(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={currentLocation}
      />
    </div>
  );
};

export default DonorMap;
