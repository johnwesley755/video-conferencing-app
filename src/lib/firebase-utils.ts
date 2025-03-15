import { db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  limit, 
  query, 
  setDoc, 
  DocumentReference, 
  SetOptions,
  WithFieldValue,
  DocumentData 
} from 'firebase/firestore';
import { showToast } from './toast-utils';

// Maximum retry attempts for Firestore operations
const MAX_RETRIES = 3;

export async function verifyFirestoreConnection() {
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      console.log(`Verifying Firestore connection (attempt ${retryCount + 1})...`);
      
      // Try to fetch a single document from any collection with a timeout
      const testQuery = query(collection(db, 'users'), limit(1));
      
      // Create a promise that will reject after 10 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Firestore connection timeout')), 10000);
      });
      
      // Race between the query and the timeout
      await Promise.race([getDocs(testQuery), timeoutPromise]);
      
      console.log("Firestore connection successful");
      return true;
    } catch (error: unknown) {
      retryCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Firestore connection error (attempt ${retryCount}):`, errorMessage);
      
      if (retryCount >= MAX_RETRIES) {
        // If we've reached max retries, show a toast and return false
        showToast.error(`Failed to connect to Firestore after ${MAX_RETRIES} attempts. Some features may not work properly.`);
        return false;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
}

// Function to safely create or update a document with retries
export async function safeSetDoc<T extends DocumentData>(
  docRef: DocumentReference<T>, 
  data: WithFieldValue<T>, 
  options?: SetOptions
) {
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      // Check if options is provided before passing it to setDoc
      if (options) {
        await setDoc(docRef, data, options);
      } else {
        await setDoc(docRef, data);
      }
      return true;
    } catch (error: unknown) {
      retryCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error setting document (attempt ${retryCount}):`, errorMessage);
      
      if (retryCount >= MAX_RETRIES) {
        throw error;
      }
      
      // Wait before retrying
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return false;
}

// Function to check if Firestore is available and handle offline mode
export function handleOfflineMode() {
  // Listen for online/offline events
  window.addEventListener('online', () => {
    showToast.success('You are back online. Reconnecting to services...');
    verifyFirestoreConnection();
  });
  
  window.addEventListener('offline', () => {
    showToast.warning('You are offline. Some features may not be available.');
  });
  
  // Initial check
  if (!navigator.onLine) {
    showToast.warning('You are offline. Some features may not be available.');
    return false;
  }
  
  return true;
}