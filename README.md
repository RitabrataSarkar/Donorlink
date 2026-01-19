# DonorLink - Blood Donation Platform

DonorLink is a comprehensive React web application that connects blood donors with those in need. The platform allows registered users to upload their information, update their availability through map locations, and enables needy individuals to search for donors within specific distances.

## Features

### 🔐 Authentication & User Management
- User registration with comprehensive profile information
- Secure login/logout functionality
- Profile management and editing
- Firebase Authentication integration

### 🗺️ Location-Based Services
- Google Maps integration for location services
- Real-time location updates for donors
- Distance-based donor search
- Interactive map with donor markers

### 🩸 Blood Donation Management
- Blood group-specific donor search
- Availability status management
- Donor listing with contact information
- Distance calculation and filtering

### 📱 Modern UI/UX
- Responsive design with Tailwind CSS
- Beautiful and intuitive user interface
- Real-time notifications with toast messages
- Loading states and error handling

## Tech Stack

- **Frontend**: React 18, React Router DOM
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Maps**: Google Maps JavaScript API
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Build Tool**: Create React App

## Prerequisites

Before running this application, you need:

1. **Node.js** (version 14 or higher)
2. **npm** or **yarn**
3. **Firebase Account** with a project set up
4. **Google Maps API Key**

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd donorlink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a Firebase project and get your configuration:
   
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select existing one
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web icon (</>) to add a web app
   - Copy the configuration object

4. **Update Firebase Configuration**
   
   Open `src/firebase/config.js` and replace the placeholder configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Configure Google Maps API**
   
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Maps JavaScript API
   - Create credentials (API Key)
   - Replace `YOUR_GOOGLE_MAPS_API_KEY` in the following files:
     - `src/pages/DonorMap.js`
     - `src/pages/SearchDonors.js`

6. **Set up Firestore Database**
   
   In your Firebase Console:
   - Go to Firestore Database
   - Create a database in test mode (for development)
   - The application will automatically create the necessary collections

## Running the Application

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
donorlink/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Navbar.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── firebase/
│   │   └── config.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── DonorMap.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Profile.js
│   │   ├── Register.js
│   │   └── SearchDonors.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Key Features Explained

### User Registration
- Collects comprehensive user information including name, age, blood group, contact details, and location
- Validates all input fields with proper error handling
- Stores user data in Firebase Firestore

### Location Management
- Users can set their current location using Google Maps
- Supports both manual location selection and GPS-based location detection
- Updates availability status along with location

### Donor Search
- Search for donors by blood group and distance
- Real-time filtering based on user's location
- Interactive map showing donor locations with custom markers
- Distance calculation using Haversine formula

### Profile Management
- Complete profile editing capabilities
- Real-time status updates
- Account security features (placeholder for future implementation)

## Environment Variables

For production deployment, consider using environment variables:

```bash
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

## Security Considerations

- Firebase Security Rules should be configured for Firestore
- Google Maps API key should be restricted to your domain
- Implement proper input validation and sanitization
- Consider implementing rate limiting for API calls

## Future Enhancements

- [ ] Real-time messaging between donors and recipients
- [ ] Push notifications for emergency blood requests
- [ ] Blood donation history tracking
- [ ] Integration with blood banks and hospitals
- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Dark mode theme

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a demonstration application. For production use, ensure proper security measures, data validation, and compliance with local healthcare regulations. 