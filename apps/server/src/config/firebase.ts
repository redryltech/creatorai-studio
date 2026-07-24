// ============================================================
// CreatorAI Studio — Firebase Admin SDK Configuration
// ============================================================

import * as admin from 'firebase-admin';
import { env } from './env';
import * as path from 'path';
import * as fs from 'fs';

let initialized = false;

export function initializeFirebase(): void {
  if (initialized) return;

  try {
    let credential: admin.credential.Credential;

    if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const key = env.FIREBASE_SERVICE_ACCOUNT_KEY;

      if (key.startsWith('{')) {
        // JSON string passed directly
        const serviceAccount = JSON.parse(key);
        credential = admin.credential.cert(serviceAccount);
      } else {
        // File path — resolve relative to project root
        let keyPath = key;
        if (!path.isAbsolute(keyPath)) {
          // Try relative to project root (../../ from apps/server/src/config/)
          const projectRoot = path.resolve(__dirname, '../../../../');
          keyPath = path.resolve(projectRoot, key);
        }

        if (!fs.existsSync(keyPath)) {
          console.error(`❌ Service account key file not found: ${keyPath}`);
          console.warn('   Download a NEW key from Firebase Console:');
          console.warn('   → Project Settings → Service Accounts → Generate New Private Key');
          console.warn(`   → Save as: ${keyPath}`);
          return;
        }

        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
        credential = admin.credential.cert(serviceAccount);
      }
    } else {
      credential = admin.credential.applicationDefault();
    }

    admin.initializeApp({
      credential,
      projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'creatorai-studio-e4de0',
      storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'creatorai-studio-e4de0.firebasestorage.app',
    });

    initialized = true;
    console.log('✅ Firebase Admin SDK initialized (project: creatorai-studio-e4de0)');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
    console.warn('⚠️  To fix:');
    console.warn('   1. Go to Firebase Console → Project Settings → Service Accounts');
    console.warn('   2. Generate a NEW Private Key (revoke the old exposed one!)');
    console.warn('   3. Save the JSON file as: creatorai-studio/service-account-key.json');
  }
}

export function getFirestore(): admin.firestore.Firestore {
  return admin.firestore();
}

export function getAuth(): admin.auth.Auth {
  return admin.auth();
}

export function getStorageBucket(): ReturnType<typeof admin.storage>['bucket'] {
  return admin.storage().bucket();
}
