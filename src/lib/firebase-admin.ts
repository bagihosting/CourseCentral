import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

try {
  // Check if the environment variables are set and are not empty strings
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount: ServiceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines from the environment variable
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    // Initialize Firebase Admin SDK only once
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized successfully.');
    }
    
    db = admin.firestore();
    auth = admin.auth();
  } else {
    // This warning will be shown in development if .env is not set up
    if (process.env.NODE_ENV !== 'production') {
        console.warn('Firebase environment variables are not set. Firestore database will not be available. Please set them in your .env file.');
    } else {
        // In production, this should be a hard error.
        console.error('CRITICAL: Firebase environment variables are not set. Application cannot connect to the database.');
    }
  }
} catch (error: any) {
  console.error('Firebase admin initialization error. This can happen if your service account credentials in .env are incorrect or malformed.', error.message);
}

export { db, auth };
