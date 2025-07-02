import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

// Check if the environment variables are set
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Firebase environment variables are not set.');
    } else {
        console.warn('Firebase environment variables are not set. Using mock data will not work. Please set them in your .env file.');
    }
}

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Replace escaped newlines from the environment variable
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (error: any) {
    console.error('Firebase admin initialization error. Make sure your service account credentials in .env are correct.', error.stack);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
