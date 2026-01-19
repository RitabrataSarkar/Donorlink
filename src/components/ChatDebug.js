import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const ChatDebug = () => {
  const { currentUser } = useAuth();
  const { chats, messages, activeChat } = useChat();
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setTestResults([]);
    
    // Test 1: Check if user is authenticated
    addTestResult('User Authentication', currentUser ? '✅ PASS' : '❌ FAIL', 
      currentUser ? `User ID: ${currentUser.uid}` : 'No user logged in');

    if (!currentUser) return;

    // Test 2: Check Firebase connection
    try {
      if (db) {
        addTestResult('Firebase Connection', '✅ PASS', 'Firestore database initialized');
      } else {
        addTestResult('Firebase Connection', '❌ FAIL', 'Firestore database not initialized');
        return;
      }
    } catch (error) {
      addTestResult('Firebase Connection', '❌ FAIL', error.message);
      return;
    }

    // Test 3: Try to read chats collection
    try {
      const chatsRef = collection(db, 'chats');
      const snapshot = await getDocs(chatsRef);
      addTestResult('Read Chats Collection', '✅ PASS', `Found ${snapshot.size} chat documents`);
    } catch (error) {
      addTestResult('Read Chats Collection', '❌ FAIL', `Error: ${error.message}`);
    }

    // Test 4: Try to read users collection
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      addTestResult('Read Users Collection', '✅ PASS', `Found ${snapshot.size} user documents`);
    } catch (error) {
      addTestResult('Read Users Collection', '❌ FAIL', `Error: ${error.message}`);
    }

    // Test 5: Check current user document
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      addTestResult('Read Current User', userDoc.exists() ? '✅ PASS' : '⚠️ WARN', 
        userDoc.exists() ? `User document exists` : 'User document not found');
    } catch (error) {
      addTestResult('Read Current User', '❌ FAIL', `Error: ${error.message}`);
    }

    // Test 6: Check chat context state
    addTestResult('Chat Context - Chats', chats.length > 0 ? '✅ PASS' : '⚠️ WARN', 
      `${chats.length} chats in context`);
    
    addTestResult('Chat Context - Messages', messages.length > 0 ? '✅ PASS' : '⚠️ WARN', 
      `${messages.length} messages in context`);
    
    addTestResult('Chat Context - Active Chat', activeChat ? '✅ PASS' : '⚠️ WARN', 
      activeChat ? `Active chat: ${activeChat.id}` : 'No active chat');
  };

  useEffect(() => {
    setDebugInfo({
      currentUser: currentUser ? {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName
      } : null,
      chatsCount: chats.length,
      messagesCount: messages.length,
      activeChat: activeChat?.id || null,
      dbInitialized: !!db
    });
  }, [currentUser, chats, messages, activeChat]);

  if (!currentUser) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Chat Debug - Not Authenticated</h3>
        <p className="text-yellow-700">Please log in to debug the chat system.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 m-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 Chat System Debug Panel</h3>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-700 mb-2">Current State</h4>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-700 mb-2">Chat Context</h4>
          <div className="text-sm space-y-1">
            <p>Chats: {chats.length}</p>
            <p>Messages: {messages.length}</p>
            <p>Active Chat: {activeChat?.id || 'None'}</p>
            <p>DB Status: {db ? '✅ Connected' : '❌ Not Connected'}</p>
          </div>
        </div>
      </div>

      <button
        onClick={runTests}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
      >
        Run Diagnostic Tests
      </button>

      {testResults.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3">Test Results</h4>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start space-x-3 text-sm">
                <span className="font-mono text-xs text-gray-500">{result.timestamp}</span>
                <span className="font-medium">{result.test}:</span>
                <span className={result.result.includes('✅') ? 'text-green-600' : 
                               result.result.includes('❌') ? 'text-red-600' : 'text-yellow-600'}>
                  {result.result}
                </span>
                {result.details && <span className="text-gray-600">- {result.details}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDebug;
