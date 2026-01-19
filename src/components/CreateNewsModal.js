import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createCampNews } from '../services/newsService';
import { getNGOByUserId } from '../services/ngoService';
import { XMarkIcon, MapPinIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CitySelector from './CitySelector';

const CreateNewsModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [ngoData, setNgoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    address: '',
    campDate: '',
    campTime: '',
    expectedDonors: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    permissionStatus: false,
    permissionAuthority: '',
    permissionNumber: '',
    permissionDocument: '',
    requirements: '',
    facilities: ''
  });

  useEffect(() => {
    if (currentUser && isOpen) {
      loadNGOData();
    }
  }, [currentUser, isOpen]);

  const loadNGOData = async () => {
    try {
      const ngo = await getNGOByUserId(currentUser.uid);
      if (ngo) {
        setNgoData(ngo);
        setFormData(prev => ({
          ...prev,
          contactPerson: ngo.contactPerson || '',
          contactPhone: ngo.phone || '',
          contactEmail: ngo.email || ''
        }));
      }
    } catch (error) {
      console.error('Error loading NGO data:', error);
      toast.error('Error loading NGO information');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowCitySelector(false);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!ngoData) {
      errors.push('NGO information not found');
    }
    
    if (!formData.title.trim()) {
      errors.push('Camp title is required');
    }
    
    if (!formData.venue.trim()) {
      errors.push('Venue name is required');
    }
    
    if (!selectedLocation) {
      errors.push('Please select a location for the camp');
    }
    
    if (!formData.address.trim()) {
      errors.push('Complete address is required');
    }
    
    if (!formData.campDate) {
      errors.push('Camp date is required');
    } else {
      const selectedDate = new Date(formData.campDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push('Camp date must be in the future');
      }
    }
    
    if (!formData.campTime) {
      errors.push('Camp time is required');
    }
    
    if (!formData.contactPerson.trim()) {
      errors.push('Contact person is required');
    }
    
    if (!formData.contactPhone.trim()) {
      errors.push('Contact phone is required');
    }
    
    if (!formData.permissionStatus) {
      errors.push('Government permission approval is mandatory for organizing blood donation camps');
    }
    
    if (formData.permissionStatus && !formData.permissionAuthority.trim()) {
      errors.push('Permission authority details are required');
    }
    
    if (formData.permissionStatus && !formData.permissionNumber.trim()) {
      errors.push('Permission number/reference is required');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setLoading(true);

    try {
      const newsData = {
        ...formData,
        ngoId: ngoData.id,
        ngoName: ngoData.name,
        ngoRegistrationNumber: ngoData.registrationNumber,
        userId: currentUser.uid,
        location: selectedLocation,
        campDate: new Date(formData.campDate),
        expectedDonors: parseInt(formData.expectedDonors) || 0
      };

      await createCampNews(newsData);
      toast.success('Camp news created successfully! It will be reviewed before publishing.');
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        venue: '',
        address: '',
        campDate: '',
        campTime: '',
        expectedDonors: '',
        contactPerson: ngoData.contactPerson || '',
        contactPhone: ngoData.phone || '',
        contactEmail: ngoData.email || '',
        permissionStatus: false,
        permissionAuthority: '',
        permissionNumber: '',
        permissionDocument: '',
        requirements: '',
        facilities: ''
      });
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error creating news:', error);
      toast.error('Error creating camp news');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Blood Donation Camp</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camp Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Blood Donation Camp - Save Lives Together"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Describe the camp, its purpose, and any special information..."
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Community Hall, Hospital, School"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City/Location *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={selectedLocation ? selectedLocation.name : ''}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="Select city/location"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCitySelector(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <MapPinIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Complete address with landmarks"
                />
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Camp Date *
                </label>
                <input
                  type="date"
                  name="campDate"
                  value={formData.campDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  name="campTime"
                  value={formData.campTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Donors
                </label>
                <input
                  type="number"
                  name="expectedDonors"
                  value={formData.expectedDonors}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., 100"
                />
              </div>
            </div>
          </div>

          {/* Permission Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Permission & Authorization</h3>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="permissionStatus"
                checked={formData.permissionStatus}
                onChange={handleInputChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                I have obtained permission from relevant authorities to conduct this blood donation camp *
              </label>
            </div>

            {formData.permissionStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permission Authority *
                  </label>
                  <input
                    type="text"
                    name="permissionAuthority"
                    value={formData.permissionAuthority}
                    onChange={handleInputChange}
                    required={formData.permissionStatus}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., District Health Department, Municipal Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permission Number/Reference
                  </label>
                  <input
                    type="text"
                    name="permissionNumber"
                    value={formData.permissionNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Permission reference number"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requirements
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Any special requirements for donors (age, health conditions, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facilities Available
                </label>
                <textarea
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Refreshments, certificates, medical checkup, etc."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Camp News'}
            </button>
          </div>
        </form>

        {/* City Selector Modal */}
        {showCitySelector && (
          <CitySelector
            isOpen={showCitySelector}
            onClose={() => setShowCitySelector(false)}
            onLocationSelect={handleLocationSelect}
          />
        )}
      </div>
    </div>
  );
};

export default CreateNewsModal;
