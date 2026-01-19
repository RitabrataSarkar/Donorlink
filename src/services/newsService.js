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
  limit
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Create a new blood donation camp news
export const createCampNews = async (newsData) => {
  try {
    const docRef = await addDoc(collection(db, 'campNews'), {
      ...newsData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending', // pending, approved, rejected
      views: 0,
      interestedCount: 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating camp news:', error);
    throw error;
  }
};

// Get news within 100km radius of user location
export const getNearbyNews = (userLocation, callback, errorCallback) => {
  try {
    // Simple query that works without any index requirements
    // This will demonstrate the empty state functionality
    const q = query(
      collection(db, 'campNews'),
      limit(50) // Limit for performance
    );
    
    // Original query (requires composite index - restore after creating index):
    // const q = query(
    //   collection(db, 'campNews'),
    //   where('status', '==', 'approved'),
    //   where('campDate', '>=', new Date()), // Only future camps
    //   orderBy('campDate', 'asc'),
    //   limit(50) // Limit for performance
    // );

    return onSnapshot(q, (snapshot) => {
      const allNews = [];
      const currentDate = new Date();
      
      snapshot.forEach((doc) => {
        const newsData = { id: doc.id, ...doc.data() };
        
        // Client-side filtering for approved and future camps
        if (newsData.status === 'approved' && 
            newsData.campDate && 
            (newsData.campDate.toDate ? newsData.campDate.toDate() : new Date(newsData.campDate)) >= currentDate) {
          
          // Calculate distance from user location
          if (userLocation && newsData.location) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              newsData.location.lat,
              newsData.location.lng
            );
            
            // Only include news within 100km
            if (distance <= 100) {
              newsData.distance = Math.round(distance * 10) / 10; // Round to 1 decimal
              allNews.push(newsData);
            }
          } else {
            // If no user location, include all approved news
            allNews.push(newsData);
          }
        }
      });
      
      // Sort by date on client side
      allNews.sort((a, b) => {
        const dateA = a.campDate?.toDate ? a.campDate.toDate() : new Date(a.campDate);
        const dateB = b.campDate?.toDate ? b.campDate.toDate() : new Date(b.campDate);
        return dateA - dateB;
      });
      
      callback(allNews);
    }, (error) => {
      console.error('Error in news snapshot listener:', error);
      if (errorCallback) {
        errorCallback(error);
      }
    });
  } catch (error) {
    console.error('Error setting up news listener:', error);
    if (errorCallback) {
      errorCallback(error);
    } else {
      throw error;
    }
  }
};

// Get all news for admin/NGO management
export const getAllNews = (callback) => {
  try {
    const q = query(
      collection(db, 'campNews'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const allNews = [];
      snapshot.forEach((doc) => {
        allNews.push({ id: doc.id, ...doc.data() });
      });
      callback(allNews);
    });
  } catch (error) {
    console.error('Error fetching all news:', error);
    throw error;
  }
};

// Get news by NGO
export const getNewsByNGO = (ngoId, callback) => {
  try {
    const q = query(
      collection(db, 'campNews'),
      where('ngoId', '==', ngoId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const ngoNews = [];
      snapshot.forEach((doc) => {
        ngoNews.push({ id: doc.id, ...doc.data() });
      });
      callback(ngoNews);
    });
  } catch (error) {
    console.error('Error fetching NGO news:', error);
    throw error;
  }
};

// Update news status (approve/reject)
export const updateNewsStatus = async (newsId, status, adminNotes = '') => {
  try {
    const newsRef = doc(db, 'campNews', newsId);
    await updateDoc(newsRef, {
      status,
      adminNotes,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating news status:', error);
    throw error;
  }
};

// Increment view count
export const incrementViewCount = async (newsId) => {
  try {
    const newsRef = doc(db, 'campNews', newsId);
    const newsDoc = await getDocs(query(collection(db, 'campNews'), where('__name__', '==', newsId)));
    
    if (!newsDoc.empty) {
      const currentViews = newsDoc.docs[0].data().views || 0;
      await updateDoc(newsRef, {
        views: currentViews + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

// Mark user as interested in a camp
export const markInterested = async (newsId, userId) => {
  try {
    await addDoc(collection(db, 'campInterest'), {
      newsId,
      userId,
      createdAt: serverTimestamp()
    });

    // Increment interested count
    const newsRef = doc(db, 'campNews', newsId);
    const newsDoc = await getDocs(query(collection(db, 'campNews'), where('__name__', '==', newsId)));
    
    if (!newsDoc.empty) {
      const currentCount = newsDoc.docs[0].data().interestedCount || 0;
      await updateDoc(newsRef, {
        interestedCount: currentCount + 1
      });
    }
  } catch (error) {
    console.error('Error marking interest:', error);
    throw error;
  }
};
