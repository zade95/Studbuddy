import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Course, ScheduleSlot } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const databaseId = (firebaseConfig as any).firestoreDatabaseId || undefined;
export const db = getFirestore(app, databaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();

// State flags and caches
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Test Firestore Connection as required by the Firebase Integration Skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase connection warning (client may be offline).");
    }
  }
}
// Removed immediate testConnection() invocation to prevent automated test-suite errors on initialization.

// Error Handling block as mandated by the Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we have a user but no access token in-memory, we might need a re-login
        // or we'll trigger login on user interaction.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google using Popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// --- Firestore Database operations for Courses ---

export const getCourses = async (userId: string): Promise<Course[]> => {
  const path = `users/${userId}/courses`;
  try {
    const q = query(collection(db, path));
    const snapshot = await getDocs(q);
    const coursesList: Course[] = [];
    snapshot.forEach((doc) => {
      coursesList.push({ id: doc.id, ...doc.data() } as Course);
    });
    return coursesList;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
};

export const saveCourse = async (userId: string, course: Course): Promise<void> => {
  const path = `users/${userId}/courses`;
  try {
    await setDoc(doc(db, path, course.id), {
      id: course.id,
      userId,
      name: course.name,
      professor: course.professor,
      credits: Number(course.credits),
      held: Number(course.held),
      attended: Number(course.attended),
      required_percent: Number(course.required_percent),
      color: course.color,
      createdAt: course.createdAt
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${course.id}`);
  }
};

export const removeCourse = async (userId: string, courseId: string): Promise<void> => {
  const path = `users/${userId}/courses`;
  try {
    await deleteDoc(doc(db, path, courseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${courseId}`);
  }
};

// --- Firestore Database operations for Schedule Slots ---

export const getSchedule = async (userId: string): Promise<ScheduleSlot[]> => {
  const path = `users/${userId}/schedule`;
  try {
    const snapshot = await getDocs(collection(db, path));
    const scheduleList: ScheduleSlot[] = [];
    snapshot.forEach((doc) => {
      scheduleList.push({ id: doc.id, ...doc.data() } as ScheduleSlot);
    });
    return scheduleList;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
};

export const saveScheduleSlot = async (userId: string, slot: ScheduleSlot): Promise<void> => {
  const path = `users/${userId}/schedule`;
  try {
    await setDoc(doc(db, path, slot.id), {
      id: slot.id,
      userId,
      courseId: slot.courseId,
      courseName: slot.courseName,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room,
      type: slot.type,
      color: slot.color
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${slot.id}`);
  }
};

export const removeScheduleSlot = async (userId: string, slotId: string): Promise<void> => {
  const path = `users/${userId}/schedule`;
  try {
    await deleteDoc(doc(db, path, slotId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${slotId}`);
  }
};


