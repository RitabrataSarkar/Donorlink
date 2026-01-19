// Debug script to check environment variables
console.log('=== Environment Variables Debug ===');
console.log('REACT_APP_FIREBASE_API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY);
console.log('REACT_APP_FIREBASE_AUTH_DOMAIN:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);
console.log('REACT_APP_FIREBASE_PROJECT_ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID);
console.log('REACT_APP_FIREBASE_STORAGE_BUCKET:', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET);
console.log('REACT_APP_FIREBASE_MESSAGING_SENDER_ID:', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID);
console.log('REACT_APP_FIREBASE_APP_ID:', process.env.REACT_APP_FIREBASE_APP_ID);
console.log('=====================================');

// Check if values are still placeholders
const hasPlaceholders = [
  process.env.REACT_APP_FIREBASE_API_KEY,
  process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  process.env.REACT_APP_FIREBASE_PROJECT_ID,
  process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  process.env.REACT_APP_FIREBASE_APP_ID
].some(value => !value || value.includes('your-') || value.includes('here'));

if (hasPlaceholders) {
  console.error('❌ Environment variables contain placeholder values or are missing!');
} else {
  console.log('✅ Environment variables appear to be properly set');
}
