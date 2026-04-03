import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  doc,
  deleteDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";

export interface PhotoData {
  id?: string;
  src: string;
  title: string;
  category: string;
  alt: string;
  layout?: string;
  createdAt?: any;
  exif?: {
    make?: string;
    model?: string;
    exposureTime?: number;
    fNumber?: number;
    iso?: number;
    focalLength?: number;
    lensModel?: string;
  };
  story?: string;
}

const COLLECTION_NAME = "photos";

// Get all photos from Firestore
export const getPhotos = async (): Promise<PhotoData[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PhotoData[];
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
};

/**
 * Firestore doesn't like 'undefined' values. 
 * This helper recursively removes them from any object.
 */
const sanitize = (obj: any) => {
  const result = { ...obj };
  Object.keys(result).forEach(key => {
    if (result[key] === undefined) {
      delete result[key];
    } else if (result[key] !== null && typeof result[key] === 'object') {
      result[key] = sanitize(result[key]);
    }
  });
  return result;
};

// Upload an image to Storage and save metadata to Firestore
export const addPhoto = async (
  file: File, 
  photoInfo: Omit<PhotoData, "src" | "createdAt" | "id">
): Promise<PhotoData | null> => {
  try {
    // 1. Upload file to Storage
    const storageRef = ref(storage, `${COLLECTION_NAME}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 2. Save metadata to Firestore
    const newPhoto: Omit<PhotoData, "id"> = {
      ...photoInfo,
      src: downloadURL,
      createdAt: serverTimestamp(),
    };

    // Sanitize to remove 'undefined' fields (Firestore requirement)
    const sanitizedPhoto = sanitize(newPhoto);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizedPhoto);
    return { id: docRef.id, ...sanitizedPhoto } as PhotoData;
  } catch (error) {
    console.error("Error adding photo:", error);
    return null;
  }
};
// Real-time listener for photos
export const subscribeToPhotos = (callback: (photos: PhotoData[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const photos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as PhotoData[];
    callback(photos);
  }, (error) => {
    console.error("Error subscribing to photos:", error);
  });
};

// Delete a photo from Storage and Firestore
export const deletePhoto = async (id: string, src: string): Promise<boolean> => {
  try {
    // 1. Delete from Firestore
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    // 2. Delete from Storage
    // Use the URL to get a reference
    const storageRef = ref(storage, src);
    await deleteObject(storageRef);

    return true;
  } catch (error) {
    console.error("Error deleting photo:", error);
    return false;
  }
};
