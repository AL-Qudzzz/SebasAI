
// src/services/firestoreService.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp, FieldValue, getDoc, where } from 'firebase/firestore';

// --- Journal Entries ---
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
}

interface StoredJournalEntry extends Omit<JournalEntry, 'date' | 'id'> {
  userId: string;
  createdAt: Timestamp | FieldValue; // Firestore timestamp for creation
  updatedAt: Timestamp | FieldValue; // Firestore timestamp for updates
  date: string; // The original date string from the client
}

export async function saveJournalEntry(userId: string, entry: Omit<JournalEntry, 'id'>): Promise<string | null> {
  if (!userId) {
    console.error("User ID is required to save journal entry to Firestore.");
    return null;
  }
  try {
    const entryToSave: StoredJournalEntry = {
      ...entry,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'journalEntries'), entryToSave);
    console.log("Journal entry saved to Firestore with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving journal entry to Firestore: ", error);
    return null;
  }
}

export async function updateJournalEntryInFirestore(userId: string, entryId: string, entryData: Partial<Omit<JournalEntry, 'id' | 'date'>>): Promise<boolean> {
  if (!userId || !entryId) {
    console.error("User ID and Entry ID are required to update journal entry in Firestore.");
    return false;
  }
  try {
    const entryRef = doc(db, 'journalEntries', entryId);
    // Add security check here in a real app to ensure doc belongs to user
    const dataToUpdate = { ...entryData, updatedAt: serverTimestamp() };
    await updateDoc(entryRef, dataToUpdate);
    console.log("Journal entry updated in Firestore: ", entryId);
    return true;
  } catch (error) {
    console.error("Error updating journal entry in Firestore: ", error);
    return false;
  }
}

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'journalEntries'), where("userId", "==", userId), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as StoredJournalEntry;
      entries.push({
        id: doc.id,
        title: data.title,
        content: data.content,
        date: data.date,
      });
    });
    console.log(`Fetched ${entries.length} journal entries from Firestore for user ${userId}`);
    return entries;
  } catch (error) {
    console.error("Error fetching journal entries from Firestore: ", error);
    return [];
  }
}

export async function deleteJournalEntryFromFirestore(userId: string, entryId: string): Promise<boolean> {
    if (!userId || !entryId) {
        console.error("User ID and Entry ID are required to delete journal entry from Firestore.");
        return false;
    }
    try {
        // Add security check here in a real app to ensure doc belongs to user before deleting
        await deleteDoc(doc(db, 'journalEntries', entryId));
        console.log("Journal entry deleted from Firestore: ", entryId);
        return true;
    } catch (error) {
        console.error("Error deleting journal entry from Firestore: ", error);
        return false;
    }
}

// --- Mood Entries ---
export interface MoodEntry {
  id: string;
  mood: string; // Adjective
  emoji: string; 
  date: string; // ISO string
}

interface StoredMoodEntry extends Omit<MoodEntry, 'id'> {
  userId: string;
  date: string; // The original date string from the client
  loggedAt: Timestamp | FieldValue;
}

export async function saveMoodEntry(userId: string, entry: Omit<MoodEntry, 'id'>): Promise<string | null> {
  if (!userId) {
    console.error("User ID is required to save mood entry to Firestore.");
    return null;
  }
  try {
     const entryToSave: StoredMoodEntry = {
      ...entry,
      userId: userId,
      loggedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'moodEntries'), entryToSave);
    console.log("Mood entry saved to Firestore with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving mood entry to Firestore: ", error);
    return null;
  }
}

export async function getMoodEntries(userId: string): Promise<MoodEntry[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'moodEntries'), where("userId", "==", userId), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const entries: MoodEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as StoredMoodEntry;
      entries.push({
        id: doc.id,
        mood: data.mood,
        emoji: data.emoji,
        date: data.date,
      });
    });
    console.log(`Fetched ${entries.length} mood entries from Firestore for user ${userId}`);
    return entries;
  } catch (error) {
    console.error("Error fetching mood entries from Firestore: ", error);
    return [];
  }
}

// --- Goals ---
export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetDate?: string; // ISO string
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

interface StoredGoal extends Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> {
    userId: string;
    createdAt: Timestamp | FieldValue;
    updatedAt: Timestamp | FieldValue;
}

export async function saveGoal(userId: string, goal: Omit<Goal, 'id'>): Promise<string | null> {
    if (!userId) return null;
    try {
        const goalToSave: StoredGoal = {
            ...goal,
            userId: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }
        const docRef = await addDoc(collection(db, 'goals'), goalToSave);
        return docRef.id;
    } catch (error) {
        console.error("Error saving goal:", error);
        return null;
    }
}

export async function getGoals(userId: string): Promise<Goal[]> {
    if (!userId) return [];
    try {
        const q = query(collection(db, 'goals'), where("userId", "==", userId), orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                description: data.description,
                targetDate: data.targetDate,
                status: data.status,
                createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
                updatedAt: (data.updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as Goal;
        });
    } catch (error) {
        console.error("Error getting goals:", error);
        return [];
    }
}

export async function updateGoal(userId: string, goalId: string, data: Partial<Goal>): Promise<boolean> {
    if (!userId) return false;
    try {
        const goalRef = doc(db, 'goals', goalId);
        // Add security check here
        const dataToUpdate = {...data, updatedAt: serverTimestamp()};
        await updateDoc(goalRef, dataToUpdate);
        return true;
    } catch (error) {
        console.error("Error updating goal:", error);
        return false;
    }
}

export async function deleteGoal(userId: string, goalId: string): Promise<boolean> {
    if (!userId) return false;
    try {
        // Add security check here
        await deleteDoc(doc(db, 'goals', goalId));
        return true;
    } catch (error) {
        console.error("Error deleting goal:", error);
        return false;
    }
}


// --- Community Posts ---
// Interface for data structure in Firestore
interface StoredCommunityPost {
  userId: string;
  authorEmail: string;
  content: string;
  createdAt: Timestamp; // Will be a Firestore Timestamp object
}

// Interface for data structure used in the frontend and returned by API
export interface CommunityPost {
  id: string; // Firestore document ID
  userId: string;
  authorEmail: string;
  content: string;
  createdAt: string; // ISO string date for client-side
}

// Data structure for adding a new post
interface NewCommunityPostData {
  userId: string;
  authorEmail: string;
  content: string;
  createdAt: FieldValue; // Specifically FieldValue from serverTimestamp()
}

export async function createCommunityPost(userId: string, authorEmail: string, content: string): Promise<CommunityPost | null> {
  if (!userId || !authorEmail || !content.trim()) {
    console.error("User ID, author email, and content are required for createCommunityPost.");
    return null;
  }
  try {
    const postToSave: NewCommunityPostData = {
      userId,
      authorEmail,
      content: content.trim(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'communityPosts'), postToSave);
    
    // Fetch the just-created document to get the server-generated timestamp
    const newDocSnap = await getDoc(doc(db, 'communityPosts', docRef.id));
    if (!newDocSnap.exists()) {
        console.error("Failed to fetch newly created community post from Firestore:", docRef.id);
        return null; 
    }

    const savedData = newDocSnap.data() as StoredCommunityPost;

    let createdAtISO = new Date().toISOString(); // Fallback timestamp
    if (savedData.createdAt && typeof (savedData.createdAt as Timestamp).toDate === 'function') {
        createdAtISO = (savedData.createdAt as Timestamp).toDate().toISOString();
    } else {
        console.warn("Community post createdAt field was not a valid Firestore Timestamp after fetch. Original data:", savedData.createdAt);
        // Using a fallback current timestamp. Ideally, serverTimestamp should always resolve to a Timestamp.
    }

    console.log("Community post saved and fetched from Firestore with ID: ", newDocSnap.id);
    return {
        id: newDocSnap.id,
        userId: savedData.userId,
        authorEmail: savedData.authorEmail,
        content: savedData.content,
        createdAt: createdAtISO,
    };

  } catch (error) {
    console.error("Error in createCommunityPost (saving or fetching post) to Firestore: ", error);
    return null;
  }
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const posts: CommunityPost[] = [];
    querySnapshot.forEach((docSnap) => { 
      const data = docSnap.data() as StoredCommunityPost;
      
      let createdAtISO = new Date().toISOString(); // Fallback timestamp
      if (data.createdAt && typeof (data.createdAt as Timestamp).toDate === 'function') {
          createdAtISO = (data.createdAt as Timestamp).toDate().toISOString();
      } else {
          console.warn(`Community post (ID: ${docSnap.id}) fetched with invalid createdAt field. Original data:`, data.createdAt);
      }

      posts.push({
        id: docSnap.id,
        userId: data.userId,
        authorEmail: data.authorEmail,
        content: data.content,
        createdAt: createdAtISO, 
      });
    });
    console.log(`Fetched ${posts.length} community posts from Firestore.`);
    return posts;
  } catch (error) {
    console.error("Error fetching community posts from Firestore: ", error);
    return [];
  }
}
