import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Register NGO for verification
export const registerNGO = async (ngoData) => {
  try {
    const docRef = await addDoc(collection(db, 'ngos'), {
      ...ngoData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      verificationStatus: 'pending', // pending, verified, rejected
      isActive: true,
      newsCount: 0,
      rating: 0,
      reviewCount: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error registering NGO:', error);
    throw error;
  }
};

// Create NGO (alias for registerNGO)
export const createNGO = registerNGO;

// Get NGO by user ID
export const getNGOByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, 'ngos'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching NGO by user ID:', error);
    throw error;
  }
};

// Get NGO by ID
export const getNGOById = async (ngoId) => {
  try {
    const docRef = doc(db, 'ngos', ngoId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching NGO by ID:', error);
    throw error;
  }
};

// Get all NGOs for admin management
export const getAllNGOs = (callback) => {
  try {
    const q = query(
      collection(db, 'ngos'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const allNGOs = [];
      snapshot.forEach((doc) => {
        allNGOs.push({ id: doc.id, ...doc.data() });
      });
      callback(allNGOs);
    });
  } catch (error) {
    console.error('Error fetching all NGOs:', error);
    throw error;
  }
};

// Get verified NGOs
export const getVerifiedNGOs = (callback) => {
  try {
    const q = query(
      collection(db, 'ngos'),
      where('verificationStatus', '==', 'verified'),
      where('isActive', '==', true),
      orderBy('rating', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const verifiedNGOs = [];
      snapshot.forEach((doc) => {
        verifiedNGOs.push({ id: doc.id, ...doc.data() });
      });
      callback(verifiedNGOs);
    });
  } catch (error) {
    console.error('Error fetching verified NGOs:', error);
    throw error;
  }
};

// Update NGO verification status
export const updateNGOVerification = async (ngoId, status, adminNotes = '') => {
  try {
    const ngoRef = doc(db, 'ngos', ngoId);
    await updateDoc(ngoRef, {
      verificationStatus: status,
      adminNotes,
      verifiedAt: status === 'verified' ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating NGO verification:', error);
    throw error;
  }
};

// Check if user is a verified NGO
export const isVerifiedNGO = async (userId) => {
  try {
    const ngo = await getNGOByUserId(userId);
    // Check both isVerified field and verificationStatus for backward compatibility
    return ngo && (ngo.isVerified === true || ngo.verificationStatus === 'verified');
  } catch (error) {
    console.error('Error checking NGO verification:', error);
    return false;
  }
};

// Update NGO profile
export const updateNGOProfile = async (ngoId, updateData) => {
  try {
    const ngoRef = doc(db, 'ngos', ngoId);
    await updateDoc(ngoRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating NGO profile:', error);
    throw error;
  }
};
