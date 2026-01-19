# 🔥 Quick Firebase Setup - Fix "Firebase not configured" Error

## 🚨 **Immediate Fix Required**

You're seeing "Firebase not configured" because you need to set up your Firebase project and create a `.env.local` file.

## ⚡ **Quick Steps (5 minutes)**

### **Step 1: Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `donorlink-app`
4. Click "Continue" (skip Google Analytics for now)
5. Click "Create project"

### **Step 2: Get Your Firebase Config**
1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register app with name: `DonorLink Web App`
6. **Copy the config object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "donorlink-app.firebaseapp.com",
  projectId: "donorlink-app",
  storageBucket: "donorlink-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### **Step 3: Create .env.local File**
1. In your project root (`D:\VS Codes\donorlink`), create a new file called `.env.local`
2. Copy the content from `env.template` and replace the values:

```bash
REACT_APP_FIREBASE_API_KEY=AIzaSyC... (your actual apiKey)
REACT_APP_FIREBASE_AUTH_DOMAIN=donorlink-app.firebaseapp.com (your actual authDomain)
REACT_APP_FIREBASE_PROJECT_ID=donorlink-app (your actual projectId)
REACT_APP_FIREBASE_STORAGE_BUCKET=donorlink-app.appspot.com (your actual storageBucket)
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789 (your actual messagingSenderId)
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123 (your actual appId)
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key (optional for now)
```

### **Step 4: Enable Authentication**
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

### **Step 5: Create Firestore Database**
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select a location (choose closest to you)
5. Click "Done"

### **Step 6: Restart Your App**
1. Stop the current server (Ctrl+C in terminal)
2. Run `npm start` again
3. Go to http://localhost:3000
4. Scroll to "Firebase Debug Panel" and test

## ✅ **Expected Results**
After setup, the debug panel should show:
- ✅ Firebase Auth: Initialized
- ✅ Firestore DB: Initialized
- ✅ All environment variables: Set

## 🆘 **If You Still See Errors**
1. Make sure `.env.local` file is in the project root
2. Restart the development server after creating `.env.local`
3. Check that all values are copied correctly (no extra spaces)
4. Verify your Firebase project is created and configured

## 🎯 **Next Steps**
Once Firebase is working:
1. Test account creation in the debug panel
2. Try registering a real account
3. Test the donor search functionality

---

**This should fix your "Firebase not configured" error!** 🎉 