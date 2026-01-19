import { doc, updateDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

// Temporary admin utility to verify NGO accounts for testing
export const verifyNGOByEmail = async (email) => {
  try {
    // Find NGO by email
    const q = query(
      collection(db, 'ngos'),
      where('email', '==', email),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('NGO not found with this email');
    }
    
    const ngoDoc = snapshot.docs[0];
    const ngoRef = doc(db, 'ngos', ngoDoc.id);
    
    // Update verification status
    await updateDoc(ngoRef, {
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('NGO verified successfully:', email);
    return { success: true, message: 'NGO verified successfully' };
  } catch (error) {
    console.error('Error verifying NGO:', error);
    return { success: false, message: error.message };
  }
};

// Get all pending NGOs for admin review
export const getPendingNGOs = async () => {
  try {
    const q = query(
      collection(db, 'ngos'),
      where('isVerified', '==', false),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting pending NGOs:', error);
    return [];
  }
};

// Verify NGO by ID
export const verifyNGOById = async (ngoId) => {
  try {
    const ngoRef = doc(db, 'ngos', ngoId);
    
    await updateDoc(ngoRef, {
      isVerified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date(),
      updatedAt: new Date()
    });
    
    return { success: true, message: 'NGO verified successfully' };
  } catch (error) {
    console.error('Error verifying NGO:', error);
    return { success: false, message: error.message };
  }
};
