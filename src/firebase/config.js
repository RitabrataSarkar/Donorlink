import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Replace these values with your actual Firebase project configuration
// You can find these values in your Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id"
};

// Validate Firebase configuration
const validateFirebaseConfig = (config) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field] || config[field] === `your-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
  
  if (missingFields.length > 0) {
    console.error('Missing or invalid Firebase configuration fields:', missingFields);
    console.error('Please update your Firebase configuration in src/firebase/config.js or set environment variables');
    return false;
  }
  return true;
};

// Initialize Firebase
let app;
try {
  if (validateFirebaseConfig(firebaseConfig)) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } else {
    throw new Error('Invalid Firebase configuration');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // You can still export the services, but they won't work without proper config
  app = null;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = app ? getAuth(app) : null;

// Initialize Cloud Firestore and get a reference to the service
export const db = app ? getFirestore(app) : null;

export default app; 