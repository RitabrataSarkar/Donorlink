# Account Creation Troubleshooting Guide

## 🔍 **Issue: "Failed to create account"**

Your DonorLink application is experiencing issues with account creation. This is most likely due to Firebase configuration problems.

## 🚀 **Quick Fix Steps**

### **Step 1: Check Firebase Configuration**
1. Open your browser and go to **http://localhost:3000**
2. Scroll down to the "Firebase Debug Panel" section
3. Click "Check Firebase Configuration"
4. Look at the "Environment Variables" section

### **Step 2: Verify Your `.env.local` File**
Make sure your `.env.local` file in the project root contains:

```bash
REACT_APP_FIREBASE_API_KEY=your-actual-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Replace all placeholder values with your actual Firebase configuration.**

### **Step 3: Get Your Firebase Configuration**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create one if you haven't)
3. Click the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click the web icon (</>) to add a web app
7. Register your app and copy the configuration

### **Step 4: Restart the Development Server**
After updating your `.env.local` file:
1. Stop the current server (Ctrl+C in terminal)
2. Run `npm start` again
3. The environment variables will be loaded

## 🛠️ **Common Issues & Solutions**

### **Issue 1: "Firebase not initialized"**
**Symptoms:**
- Firebase Auth shows "❌ Not Initialized"
- Firestore DB shows "❌ Not Initialized"

**Solution:**
- Check that your `.env.local` file exists in the project root
- Verify all environment variables are set correctly
- Restart the development server after making changes

### **Issue 2: "Missing Firebase config"**
**Symptoms:**
- Debug panel shows missing environment variables
- Console shows configuration validation errors

**Solution:**
- Add missing environment variables to `.env.local`
- Make sure variable names start with `REACT_APP_`
- Restart the server

### **Issue 3: "auth/unauthorized-domain"**
**Symptoms:**
- Account creation fails with domain error

**Solution:**
1. Go to Firebase Console > Authentication > Settings
2. Add `localhost` to "Authorized domains"
3. For production, add your actual domain

### **Issue 4: "auth/email-already-in-use"**
**Symptoms:**
- Error when trying to register with existing email

**Solution:**
- Use a different email address
- Or try logging in instead of registering

### **Issue 5: "auth/weak-password"**
**Symptoms:**
- Password validation error

**Solution:**
- Use a password with at least 6 characters
- Include a mix of letters, numbers, and symbols

## 🔧 **Firebase Console Setup**

### **Enable Authentication:**
1. Go to Firebase Console > Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

### **Create Firestore Database:**
1. Go to Firebase Console > Firestore Database
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location close to your users
5. Click "Done"

### **Update Security Rules:**
Go to Firestore Database > Rules and update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

## 🧪 **Testing Your Setup**

### **Use the Debug Panel:**
1. Go to http://localhost:3000
2. Scroll to "Firebase Debug Panel"
3. Click "Check Firebase Configuration"
4. Try "Test Signup" with test credentials
5. Check the status indicators

### **Expected Results:**
- ✅ Firebase Auth: Initialized
- ✅ Firestore DB: Initialized
- ✅ All environment variables: Set
- ✅ Test signup: Success

## 📞 **If Problems Persist**

### **Check Browser Console:**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages
4. Share any specific error codes

### **Common Error Codes:**
- `auth/invalid-api-key`: Check your API key
- `auth/unauthorized-domain`: Add localhost to authorized domains
- `auth/network-request-failed`: Check internet connection
- `firestore/permission-denied`: Update security rules

### **Debug Information:**
The debug panel will show you:
- Which environment variables are missing
- Firebase service initialization status
- Detailed error messages for authentication tests

## 🎯 **Next Steps After Fixing**

1. **Remove Debug Panel**: Once working, remove the FirebaseDebug component from Home.js
2. **Test Registration**: Try creating a real account
3. **Test Login**: Verify login works with created account
4. **Test Features**: Try updating location and searching for donors

---

**Your account creation should work once Firebase is properly configured!** 🎉 