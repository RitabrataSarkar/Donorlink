import React, { useState } from 'react';
import { setupDevAdmin } from '../utils/setupAdmin';
import toast from 'react-hot-toast';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleSetupAdmin = async () => {
    try {
      setLoading(true);
      toast.loading('Creating admin user...', { id: 'setup' });
      
      const result = await setupDevAdmin();
      
      if (result.success) {
        toast.success('Admin user created successfully!', { id: 'setup' });
        setSetupComplete(true);
      }
    } catch (error) {
      console.error('Setup error:', error);
      let errorMessage = 'Failed to create admin user';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Admin user already exists! You can now login.';
        setSetupComplete(true);
        toast.success(errorMessage, { id: 'setup' });
      } else {
        toast.error(errorMessage, { id: 'setup' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <ShieldCheckIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            One-time setup to create the admin user
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {!setupComplete ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Admin User
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This will create an admin user with the following credentials:
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <div>Email: admin@donorlink.com</div>
                <div>Password: admin123456</div>
              </div>
              
              <button
                onClick={handleSetupAdmin}
                disabled={loading}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Admin User...
                  </div>
                ) : (
                  '🛠️ Setup Admin User'
                )}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Setup Complete!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Admin user has been created successfully. You can now:</p>
                    <ul className="list-disc list-inside mt-2">
                      <li>Login at <a href="/admin/login" className="underline">/admin/login</a></li>
                      <li>Use email: admin@donorlink.com</li>
                      <li>Use password: admin123456</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center">
            <a
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
