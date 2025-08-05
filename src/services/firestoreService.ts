
// src/services/firestoreService.ts
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp, Timestamp, FieldValue, getDoc, where, runTransaction, increment } from 'firebase/firestore';

// --- Journal Entries ---
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
}

interface StoredJournalEntry extends Omit<JournalEntry, 'date' | 'id'> {
  userId: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  date: string; 
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
  mood: string;
  emoji: string; 
  date: string;
}

interface StoredMoodEntry extends Omit<MoodEntry, 'id'> {
  userId: string;
  date: string;
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
  targetDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  createdAt: string;
  updatedAt: string;
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
        await deleteDoc(doc(db, 'goals', goalId));
        return true;
    } catch (error) {
        console.error("Error deleting goal:", error);
        return false;
    }
}

// --- Community Posts ---
export interface Reply {
  id: string;
  userId: string;
  authorEmail: string;
  content: string;
  createdAt: string; // ISO string
}
export interface CommunityPost {
  id: string;
  userId: string;
  authorEmail: string;
  content: string;
  createdAt: string; // ISO string
  replyCount: number;
  repostCount: number;
  bookmarkCount: number;
  replies?: Reply[];
}

interface StoredCommunityPost {
  userId: string;
  authorEmail: string;
  content: string;
  createdAt: Timestamp;
  replyCount: number;
  repostCount: number;
  bookmarkCount: number;
}
export async function createCommunityPost(userId: string, authorEmail: string, content: string): Promise<CommunityPost | null> {
  if (!userId || !authorEmail || !content.trim()) {
    console.error("User ID, author email, and content are required for createCommunityPost.");
    return null;
  }
  try {
    const postToSave = {
      userId,
      authorEmail,
      content: content.trim(),
      createdAt: serverTimestamp(),
      replyCount: 0,
      repostCount: 0,
      bookmarkCount: 0,
    };
    const docRef = await addDoc(collection(db, 'communityPosts'), postToSave);
    
    // Instead of re-fetching, construct the return object directly.
    // This is more efficient and avoids potential race conditions.
    return {
      id: docRef.id,
      userId,
      authorEmail,
      content: content.trim(),
      createdAt: new Date().toISOString(), // Use current date as a good approximation
      replyCount: 0,
      repostCount: 0,
      bookmarkCount: 0,
    };
  } catch (error: any) {
    console.error("Error in createCommunityPost while adding document to Firestore:", error);
    // Log the actual Firestore error
    if (error.code) {
      console.error(`Firestore error code: ${error.code}`);
    }
    return null;
  }
}

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  try {
    const q = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const posts: CommunityPost[] = querySnapshot.docs.map((docSnap) => { 
      const data = docSnap.data() as StoredCommunityPost;
      const createdAtISO = (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString();
      return {
        id: docSnap.id,
        ...data,
        createdAt: createdAtISO, 
      };
    });
    console.log(`Fetched ${posts.length} community posts from Firestore.`);
    return posts;
  } catch (error) {
    console.error("Error fetching community posts from Firestore: ", error);
    return [];
  }
}
// --- Post Interactions ---
export type InteractionType = 'repost' | 'bookmark';
export async function interactWithPost(userId: string, postId: string, interactionType: InteractionType) {
  const postRef = doc(db, 'communityPosts', postId);
  const interactionCollectionName = interactionType === 'repost' ? 'reposts' : 'bookmarks';
  const interactionRef = doc(db, 'communityPosts', postId, interactionCollectionName, userId);
  const countField = interactionType === 'repost' ? 'repostCount' : 'bookmarkCount';

  try {
    let userHasInteracted = false;
    const newCount = await runTransaction(db, async (transaction) => {
      const interactionDoc = await transaction.get(interactionRef);
      const postDoc = await transaction.get(postRef);

      if (!postDoc.exists()) {
        throw "Postingan tidak ditemukan.";
      }

      let currentCount = postDoc.data()[countField] || 0;
      if (interactionDoc.exists()) {
        transaction.delete(interactionRef);
        transaction.update(postRef, { [countField]: increment(-1) });
        userHasInteracted = false;
        return currentCount > 0 ? currentCount - 1 : 0;
      } else {
        transaction.set(interactionRef, { interactedAt: serverTimestamp(), userId: userId });
        transaction.update(postRef, { [countField]: increment(1) });
        userHasInteracted = true;
        return currentCount + 1;
      }
    });
    return { newCount, userHasInteracted };
  } catch (error) {
    console.error(`Error processing ${interactionType} interaction:`, error);
    throw new Error(`Gagal memproses interaksi ${interactionType}.`);
  }
}

export async function getUserPostInteractions(userId: string, postIds: string[]) {
  const reposted = new Set<string>();
  const bookmarked = new Set<string>();

  if (!userId || postIds.length === 0) {
    return { reposted: [], bookmarked: [] };
  }
  try {
    for (const postId of postIds) {
      const repostRef = doc(db, 'communityPosts', postId, 'reposts', userId);
      const bookmarkRef = doc(db, 'communityPosts', postId, 'bookmarks', userId);
      const [repostSnap, bookmarkSnap] = await Promise.all([getDoc(repostRef), getDoc(bookmarkRef)]);
      if (repostSnap.exists()) reposted.add(postId);
      if (bookmarkSnap.exists()) bookmarked.add(postId);
    }
    return { reposted: Array.from(reposted), bookmarked: Array.from(bookmarked) };
  } catch (error) {
      console.error("Error fetching user post interactions:", error);
      return { reposted: [], bookmarked: [] };
  }
}

// --- Replies ---
export async function createReply(postId: string, userId: string, authorEmail: string, content: string): Promise<Reply | null> {
    if (!postId || !userId || !authorEmail || !content.trim()) {
        console.error("All fields are required to create a reply.");
        return null;
    }
    try {
        const postRef = doc(db, 'communityPosts', postId);
        const repliesCollectionRef = collection(postRef, 'replies');
        
        const replyToSave = {
            userId,
            authorEmail,
            content,
            createdAt: serverTimestamp(),
        };

        const replyDocRef = await addDoc(repliesCollectionRef, replyToSave);
        await updateDoc(postRef, { replyCount: increment(1) });
        
        const newReplySnap = await getDoc(replyDocRef);
        if (!newReplySnap.exists()) {
            throw new Error("Failed to fetch newly created reply.");
        }
        const data = newReplySnap.data();

        return {
            id: newReplySnap.id,
            userId,
            authorEmail,
            content,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        };
    } catch (error) {
        console.error("Error creating reply:", error);
        return null;
    }
}

export async function getReplies(postId: string): Promise<Reply[]> {
    if (!postId) return [];
    try {
        const repliesCollectionRef = collection(db, 'communityPosts', postId, 'replies');
        const q = query(repliesCollectionRef, orderBy('createdAt', 'asc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                userId: data.userId,
                authorEmail: data.authorEmail,
                content: data.content,
                createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            }
        });
    } catch (error) {
        console.error("Error fetching replies:", error);
        return [];
    }
}
