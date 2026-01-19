# Firebase Setup Guide for DonorLink

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "donorlink-app")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Add a Web App to Your Firebase Project

1. In the Firebase Console, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "DonorLink Web App")
6. Click "Register app"
7. Copy the configuration object that appears

## Step 3: Configure Firebase in Your App

### Option A: Using Environment Variables (Recommended)

1. Create a `.env.local` file in your project root:
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key-here
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Google Maps API Key (for location services)
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

2. Replace the placeholder values with your actual Firebase configuration

### Option B: Direct Configuration

1. Open `src/firebase/config.js`
2. Replace the placeholder values in the `firebaseConfig` object with your actual Firebase configuration

## Step 4: Set Up Firebase Authentication

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

### Firestore Security Rules

Update your Firestore security rules to allow authenticated users to read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read other users' profiles (for donor search)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Step 6: Test Your Firebase Connection

1. Start your development server: `npm start`
2. Open the browser console
3. You should see "Firebase initialized successfully" if everything is configured correctly
4. Try registering a new user to test the connection

## Step 7: Get Google Maps API Key (Optional but Recommended)

For the location features to work:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your existing project
3. Enable the "Maps JavaScript API"
4. Create credentials (API Key)
5. Add the API key to your environment variables

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check that your API key is correct
   - Ensure you're using the web app configuration, not the server key

2. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console > Authentication > Settings > Authorized domains

3. **"Firebase: Error (firestore/permission-denied)"**
   - Check your Firestore security rules
   - Ensure you're in test mode or have proper rules set up

4. **Environment variables not working**
   - Make sure your `.env.local` file is in the project root
   - Restart your development server after adding environment variables
   - Ensure all variable names start with `REACT_APP_`

### Getting Help:

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Firebase Documentation](https://firebase.google.com/docs/web/setup)
- Check the browser console for detailed error messages 