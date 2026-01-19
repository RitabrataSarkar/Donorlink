import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password, userData) {
    if (!auth) {
      return Promise.reject(new Error('Firebase not initialized. Please check your configuration.'));
    }
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Update profile with display name
        return updateProfile(userCredential.user, {
          displayName: userData.name
        }).then(() => {
          // Save additional user data to Firestore
          if (!db) {
            console.warn('Firestore not initialized. User data will not be saved.');
            return Promise.resolve();
          }
          return setDoc(doc(db, 'users', userCredential.user.uid), {
            ...userData,
            email: email,
            createdAt: new Date(),
            isAvailable: false,
            location: null
          });
        });
      });
  }

  function login(email, password) {
    if (!auth) {
      return Promise.reject(new Error('Firebase not initialized. Please check your configuration.'));
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    if (!auth) {
      return Promise.reject(new Error('Firebase not initialized. Please check your configuration.'));
    }
    return signOut(auth);
  }

  function updateUserProfile(userId, data) {
    if (!db) {
      return Promise.reject(new Error('Firestore not initialized. Please check your configuration.'));
    }
    return setDoc(doc(db, 'users', userId), data, { merge: true });
  }

  function getUserProfile(userId) {
    if (!db) {
      return Promise.reject(new Error('Firestore not initialized. Please check your configuration.'));
    }
    return getDoc(doc(db, 'users', userId));
  }

  useEffect(() => {
    if (!auth) {
      console.error('Firebase Authentication not initialized. Please check your configuration.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateUserProfile,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 