import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase/config';
import toast from 'react-hot-toast';

const FirebaseDebug = () => {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpass123');
  const { signup, login, logout, currentUser } = useAuth();

  const checkFirebaseConfig = () => {
    const config = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID
    };

    const missingFields = Object.entries(config)
      .filter(([key, value]) => !value || value === `your-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      toast.error(`Missing Firebase config: ${missingFields.join(', ')}`);
      console.error('Missing Firebase configuration fields:', missingFields);
      return false;
    }

    toast.success('Firebase configuration looks good!');
    return true;
  };

  const testSignup = async () => {
    try {
      const userData = {
        name: 'Test User',
        age: 25,
        bloodGroup: 'O+',
        phone: '1234567890',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country'
      };
      await signup(testEmail, testPassword, userData);
      toast.success('Test user created successfully!');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(`Signup failed: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      await login(testEmail, testPassword);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(`Login failed: ${error.message}`);
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      toast.success('Logout successful!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Firebase Debug Panel
      </h2>
      
      <div className="space-y-4">
        <button
          onClick={checkFirebaseConfig}
          className="w-full btn-primary"
        >
          Check Firebase Configuration
        </button>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Authentication Tests</h3>
          
          <div className="space-y-2 mb-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Test Email"
              className="input-field"
            />
            <input
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Test Password"
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={testSignup}
              className="w-full btn-secondary"
            >
              Test Signup
            </button>
            
            <button
              onClick={testLogin}
              className="w-full btn-secondary"
            >
              Test Login
            </button>
            
            <button
              onClick={testLogout}
              className="w-full btn-secondary"
            >
              Test Logout
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Current Status</h3>
          <div className="text-sm space-y-1">
            <p><strong>Firebase Auth:</strong> {auth ? '✅ Initialized' : '❌ Not Initialized'}</p>
            <p><strong>Firestore DB:</strong> {db ? '✅ Initialized' : '❌ Not Initialized'}</p>
            <p><strong>Current User:</strong> {currentUser ? `✅ ${currentUser.email}` : '❌ Not Logged In'}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
          <div className="text-xs space-y-1 bg-gray-100 p-2 rounded">
            <p><strong>API Key:</strong> {process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>Auth Domain:</strong> {process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>Project ID:</strong> {process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>Storage Bucket:</strong> {process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>Messaging Sender ID:</strong> {process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>App ID:</strong> {process.env.REACT_APP_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebug; 