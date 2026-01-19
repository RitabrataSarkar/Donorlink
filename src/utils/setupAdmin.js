import { createAdminUser } from '../services/adminService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

// Utility function to create the first admin user
// This should be run once to set up the initial admin account
export const setupFirstAdmin = async (adminEmail, adminPassword, adminName) => {
  try {
    console.log('Setting up first admin user...');
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('Firebase user created:', user.uid);
    
    // Create admin record in Firestore
    const adminId = await createAdminUser({
      userId: user.uid,
      email: adminEmail,
      name: adminName,
      role: 'admin',
      permissions: ['manage_ngos', 'manage_news', 'view_analytics']
    });
    
    console.log('Admin user created successfully:', adminId);
    return { success: true, adminId, userId: user.uid };
    
  } catch (error) {
    console.error('Error setting up admin user:', error);
    throw error;
  }
};

// Quick setup function for development
export const setupDevAdmin = () => {
  return setupFirstAdmin(
    'admin@donorlink.com',
    'admin123456',
    'DonorLink Admin'
  );
};
