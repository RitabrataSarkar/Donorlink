import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../firebase/config';
import toast from 'react-hot-toast';

const FirebaseTest = () => {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpass123');
  const { signup, login, logout, currentUser } = useAuth();

  const testFirebaseConnection = () => {
    if (!auth) {
      toast.error('Firebase Authentication not initialized');
      return;
    }
    if (!db) {
      toast.error('Firestore Database not initialized');
      return;
    }
    toast.success('Firebase is properly configured!');
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
      toast.error(`Signup failed: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      await login(testEmail, testPassword);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(`Login failed: ${error.message}`);
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      toast.success('Logout successful!');
    } catch (error) {
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Firebase Connection Test
      </h2>
      
      <div className="space-y-4">
        <button
          onClick={testFirebaseConnection}
          className="w-full btn-primary"
        >
          Test Firebase Connection
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
      </div>
    </div>
  );
};

export default FirebaseTest; 