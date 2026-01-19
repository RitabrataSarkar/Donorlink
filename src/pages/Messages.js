import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatList from '../components/ChatList';

const Messages = () => {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">
            Communicate with blood donors and recipients
          </p>
        </div>

        {!currentUser ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.471L3 21l2.471-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sign in to view messages
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access your conversations with donors and recipients.
            </p>
            <div className="space-x-4">
              <a
                href="/login"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors inline-block"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-colors inline-block"
              >
                Sign Up
              </a>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-1 gap-8">
            <ChatList />
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How to start chatting</h3>
              <div className="text-sm text-gray-600 space-y-2 max-w-md mx-auto">
                <p>1. Go to <strong>Search Donors</strong> to find blood donors near you</p>
                <p>2. Click the <strong>Contact</strong> button on any donor's profile</p>
                <p>3. Start a conversation to coordinate blood donation</p>
                <p>4. Your conversations will appear in this Messages section</p>
              </div>
              <div className="mt-6">
                <a
                  href="/search-donors"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors inline-block"
                >
                  Find Donors
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
