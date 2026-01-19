import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { createNGO } from '../services/ngoService';
import toast from 'react-hot-toast';
import { 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  MapPinIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const NGORegister = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Validate Firebase configuration
      if (!auth || !db) {
        throw new Error('Firebase not properly configured. Please check your setup.');
      }

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: data.contactPersonName
      });

      // Create user document in Firestore (for authentication purposes)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: data.contactPersonName,
        email: data.email,
        userType: 'ngo',
        createdAt: new Date(),
        isAvailable: false,
        location: null
      });

      // Create NGO profile in Firestore
      const ngoData = {
        name: data.ngoName,
        registrationNumber: data.registrationNumber,
        contactPersonName: data.contactPersonName,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country || 'India'
        },
        website: data.website || '',
        description: data.description || '',
        establishedYear: data.establishedYear ? parseInt(data.establishedYear) : null,
        userId: userCredential.user.uid,
        isVerified: false, // NGOs need admin verification
        verificationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await createNGO(ngoData);

      toast.success('NGO registration successful! Your account is pending verification.');
      navigate('/login');
    } catch (error) {
      console.error('NGO registration error:', error);
      
      let errorMessage = 'Failed to create NGO account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('Firebase not properly configured')) {
        errorMessage = 'System configuration error. Please contact support.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <BuildingOfficeIcon className="mx-auto h-16 w-16 text-red-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Register Your NGO
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join DonorLink to organize blood donation camps
          </p>
        </div>

        {/* Information Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                NGO Verification Required
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>All NGO registrations require admin verification</li>
                  <li>Verification typically takes 2-3 business days</li>
                  <li>You'll receive an email once your account is verified</li>
                  <li>Only verified NGOs can post blood donation camp news</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit(onSubmit)}>
          {/* NGO Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              NGO Information
            </h3>
            
            {/* NGO Name */}
            <div>
              <label htmlFor="ngoName" className="block text-sm font-medium text-gray-700">
                NGO Name *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('ngoName', { 
                    required: 'NGO name is required',
                    minLength: { value: 3, message: 'NGO name must be at least 3 characters' }
                  })}
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Enter NGO name"
                />
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              {errors.ngoName && <p className="mt-1 text-sm text-red-600">{errors.ngoName.message}</p>}
            </div>

            {/* Registration Number */}
            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                Registration Number *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('registrationNumber', { 
                    required: 'Registration number is required',
                    pattern: {
                      value: /^[A-Za-z0-9\/\-]+$/,
                      message: 'Please enter a valid registration number'
                    }
                  })}
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="e.g., NGO/2023/123456"
                />
                <DocumentTextIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              {errors.registrationNumber && <p className="mt-1 text-sm text-red-600">{errors.registrationNumber.message}</p>}
            </div>

            {/* Established Year */}
            <div>
              <label htmlFor="establishedYear" className="block text-sm font-medium text-gray-700">
                Established Year
              </label>
              <input
                {...register('establishedYear', {
                  min: { value: 1900, message: 'Please enter a valid year' },
                  max: { value: new Date().getFullYear(), message: 'Year cannot be in the future' }
                })}
                type="number"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="e.g., 2010"
              />
              {errors.establishedYear && <p className="mt-1 text-sm text-red-600">{errors.establishedYear.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                NGO Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Brief description of your NGO's mission and activities"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website URL
              </label>
              <input
                {...register('website', {
                  pattern: {
                    value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                    message: 'Please enter a valid website URL'
                  }
                })}
                type="url"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="https://www.example.org"
              />
              {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Contact Information
            </h3>

            {/* Contact Person Name */}
            <div>
              <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700">
                Contact Person Name *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('contactPersonName', { 
                    required: 'Contact person name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Enter contact person name"
                />
                <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              {errors.contactPersonName && <p className="mt-1 text-sm text-red-600">{errors.contactPersonName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  type="email"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="ngo@example.org"
                />
                <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: 'Please enter a valid 10-digit phone number'
                    }
                  })}
                  type="tel"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="9876543210"
                />
                <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Address Information
            </h3>

            {/* Street Address */}
            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                Street Address *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('street', { required: 'Street address is required' })}
                  type="text"
                  className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Enter street address"
                />
                <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>}
            </div>

            {/* City and State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  {...register('city', { required: 'City is required' })}
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Enter city"
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State *
                </label>
                <input
                  {...register('state', { required: 'State is required' })}
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Enter state"
                />
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
              </div>
            </div>

            {/* Pincode and Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                  Pincode *
                </label>
                <input
                  {...register('pincode', { 
                    required: 'Pincode is required',
                    pattern: {
                      value: /^[1-9][0-9]{5}$/,
                      message: 'Please enter a valid 6-digit pincode'
                    }
                  })}
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="123456"
                />
                {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode.message}</p>}
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  {...register('country')}
                  type="text"
                  defaultValue="India"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Account Security
            </h3>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating NGO Account...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Register NGO
                </div>
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an NGO account?{' '}
              <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                Sign in here
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Are you a blood donor?{' '}
              <Link to="/register" className="font-medium text-red-600 hover:text-red-500">
                Register as donor
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NGORegister;
