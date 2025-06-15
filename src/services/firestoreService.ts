
// src/services/firestoreService.ts
import { db } from '@/lib/firebase';
import type { JournalEntry } from '@/app/journal/page';
import type { MoodEntry } from '@/app/mood-tracker/page';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp, FieldValue, getDoc } from 'firebase/firestore';

// --- Journal Entries ---

interface StoredJournalEntry extends Omit<JournalEntry, 'date' | 'id'> {
  userId: string;
  createdAt: Timestamp; // Firestore timestamp for creation
  updatedAt: Timestamp; // Firestore timestamp for updates
  originalDate: string; // The original date string from the client
}

export async function saveJournalEntry(userId: string, entry: JournalEntry): Promise<string | null> {
  if (!userId) {
    console.error("User ID is required to save journal entry to Firestore.");
    return null;
  }
  try {
    const entryToSave: StoredJournalEntry = {
      title: entry.title,
      content: entry.content,
      userId: userId,
      originalDate: entry.date, // Keep the original date string
      createdAt: serverTimestamp() as Timestamp, // Let Firestore handle this
      updatedAt: serverTimestamp() as Timestamp, // And this
    };
    const docRef = await addDoc(collection(db, 'users', userId, 'journalEntries'), entryToSave);
    console.log("Journal entry saved to Firestore with ID: ", docRef.id);
    return docRef.id; // Return Firestore document ID
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
    const entryRef = doc(db, 'users', userId, 'journalEntries', entryId);
    const dataToUpdate: Partial<StoredJournalEntry> = { ...entryData, updatedAt: serverTimestamp() as Timestamp };
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
    const q = query(collection(db, 'users', userId, 'journalEntries'), orderBy('originalDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as StoredJournalEntry;
      entries.push({
        id: doc.id, // Use Firestore doc ID as the entry ID
        title: data.title,
        content: data.content,
        date: data.originalDate, // Use the original date string
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
        await deleteDoc(doc(db, 'users', userId, 'journalEntries', entryId));
        console.log("Journal entry deleted from Firestore: ", entryId);
        return true;
    } catch (error) {
        console.error("Error deleting journal entry from Firestore: ", error);
        return false;
    }
}

// --- Mood Entries ---

interface StoredMoodEntry extends Omit<MoodEntry, 'date' | 'id'> {
  userId: string;
  loggedAt: Timestamp; // Firestore timestamp
  originalDate: string; // The original date string from the client
}

export async function saveMoodEntry(userId: string, entry: MoodEntry): Promise<string | null> {
  if (!userId) {
    console.error("User ID is required to save mood entry to Firestore.");
    return null;
  }
  try {
     const entryToSave: StoredMoodEntry = {
      mood: entry.mood,
      emoji: entry.emoji,
      userId: userId,
      originalDate: entry.date,
      loggedAt: serverTimestamp() as Timestamp,
    };
    const docRef = await addDoc(collection(db, 'users', userId, 'moodEntries'), entryToSave);
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
    const q = query(collection(db, 'users', userId, 'moodEntries'), orderBy('originalDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const entries: MoodEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as StoredMoodEntry;
      entries.push({
        id: doc.id,
        mood: data.mood,
        emoji: data.emoji,
        date: data.originalDate,
      });
    });
    console.log(`Fetched ${entries.length} mood entries from Firestore for user ${userId}`);
    return entries;
  } catch (error) {
    console.error("Error fetching mood entries from Firestore: ", error);
    return [];
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
