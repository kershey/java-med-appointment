import { getApps, initializeApp, cert } from 'firebase-admin/app';

export const initFirebaseAdmin = () => {
  if (getApps().length === 0) {
    // Make sure the environment variables are set
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error(
        'Missing Firebase Admin SDK credentials in environment variables'
      );
    }

    // Initialize the app
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Make sure to replace escaped newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }
};
