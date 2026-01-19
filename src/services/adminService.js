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

// Admin user management
export const createAdminUser = async (adminData) => {
  try {
    const docRef = await addDoc(collection(db, 'admins'), {
      ...adminData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      role: 'admin'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Check if user is admin
export const isAdmin = async (userId) => {
  try {
    const q = query(
      collection(db, 'admins'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get admin by user ID
export const getAdminByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, 'admins'),
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
    console.error('Error getting admin:', error);
    return null;
  }
};

// Get all pending NGOs for admin review
export const getPendingNGOs = async () => {
  try {
    const q = query(
      collection(db, 'ngos'),
      where('verificationStatus', '==', 'pending'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting pending NGOs:', error);
    throw error;
  }
};

// Get all pending news for admin review
export const getPendingNews = async () => {
  try {
    const q = query(
      collection(db, 'campNews'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting pending news:', error);
    throw error;
  }
};

// Approve/Reject NGO
export const updateNGOStatus = async (ngoId, status, adminNotes = '') => {
  try {
    const ngoRef = doc(db, 'ngos', ngoId);
    await updateDoc(ngoRef, {
      verificationStatus: status,
      isVerified: status === 'approved',
      adminNotes,
      verifiedAt: status === 'approved' ? serverTimestamp() : null,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating NGO status:', error);
    throw error;
  }
};

// Approve/Reject News
export const updateNewsStatus = async (newsId, status, adminNotes = '') => {
  try {
    const newsRef = doc(db, 'campNews', newsId);
    await updateDoc(newsRef, {
      status,
      adminNotes,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating news status:', error);
    throw error;
  }
};

// Get admin dashboard stats
export const getAdminStats = async () => {
  try {
    // Get pending NGOs count
    const pendingNGOsQuery = query(
      collection(db, 'ngos'),
      where('verificationStatus', '==', 'pending'),
      where('isActive', '==', true)
    );
    const pendingNGOsSnapshot = await getDocs(pendingNGOsQuery);
    
    // Get pending news count
    const pendingNewsQuery = query(
      collection(db, 'campNews'),
      where('status', '==', 'pending')
    );
    const pendingNewsSnapshot = await getDocs(pendingNewsQuery);
    
    // Get total verified NGOs
    const verifiedNGOsQuery = query(
      collection(db, 'ngos'),
      where('verificationStatus', '==', 'verified'),
      where('isActive', '==', true)
    );
    const verifiedNGOsSnapshot = await getDocs(verifiedNGOsQuery);
    
    // Get total approved news
    const approvedNewsQuery = query(
      collection(db, 'campNews'),
      where('status', '==', 'approved')
    );
    const approvedNewsSnapshot = await getDocs(approvedNewsQuery);
    
    return {
      pendingNGOs: pendingNGOsSnapshot.size,
      pendingNews: pendingNewsSnapshot.size,
      totalVerifiedNGOs: verifiedNGOsSnapshot.size,
      totalApprovedNews: approvedNewsSnapshot.size
    };
  } catch (error) {
    console.error('Error getting admin stats:', error);
    throw error;
  }
};

// Real-time listener for pending items
export const subscribeToPendingItems = (callback) => {
  const unsubscribeNGOs = onSnapshot(
    query(
      collection(db, 'ngos'),
      where('verificationStatus', '==', 'pending'),
      where('isActive', '==', true)
    ),
    (snapshot) => {
      const pendingNGOs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback({ type: 'ngos', data: pendingNGOs });
    }
  );
  
  const unsubscribeNews = onSnapshot(
    query(
      collection(db, 'campNews'),
      where('status', '==', 'pending')
    ),
    (snapshot) => {
      const pendingNews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback({ type: 'news', data: pendingNews });
    }
  );
  
  return () => {
    unsubscribeNGOs();
    unsubscribeNews();
  };
};
