import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { isAdmin, getAdminByUserId, getAdminStats } from '../services/adminService';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    pendingNGOs: 0,
    pendingNews: 0,
    totalVerifiedNGOs: 0,
    totalApprovedNews: 0
  });

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser) {
        try {
          setAdminLoading(true);
          const adminStatus = await isAdmin(currentUser.uid);
          setIsAdminUser(adminStatus);
          
          if (adminStatus) {
            const adminInfo = await getAdminByUserId(currentUser.uid);
            setAdminData(adminInfo);
            
            // Load dashboard stats
            const stats = await getAdminStats();
            setDashboardStats(stats);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdminUser(false);
          setAdminData(null);
        } finally {
          setAdminLoading(false);
        }
      } else {
        setIsAdminUser(false);
        setAdminData(null);
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  // Refresh dashboard stats
  const refreshStats = useCallback(async () => {
    try {
      const stats = await getAdminStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error refreshing admin stats:', error);
    }
  }, []);

  const value = {
    isAdminUser,
    adminData,
    adminLoading,
    dashboardStats,
    refreshStats
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
