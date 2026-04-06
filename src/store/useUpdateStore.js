import { create } from 'zustand';
import { db, storage } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useUpdateStore = create((set, get) => ({
  updates: [],
  partnerUpdate: null,
  loading: false,

  subscribeToUpdates: (pairId, uid) => {
    set({ loading: true });
    const q = query(
      collection(db, 'pairs', pairId, 'updates'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ updates, loading: false });

      const partnerUpdate = updates.find(u => u.uid !== uid);
      if (partnerUpdate) set({ partnerUpdate });
    });
    return unsubscribe;
  },

  postUpdate: async (pairId, uid, type, content, mediaUri = null) => {
    set({ loading: true });
    try {
      let mediaUrl = null;
      if (mediaUri) {
        const response = await fetch(mediaUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `pairs/${pairId}/media/${Date.now()}`);
        await uploadBytes(storageRef, blob);
        mediaUrl = await getDownloadURL(storageRef);
      }

      const updateData = {
        uid,
        type,
        content,
        mediaUrl,
        createdAt: serverTimestamp(),
        reactions: {}
      };

      // Add to feed
      await addDoc(collection(db, 'pairs', pairId, 'updates'), updateData);
      
      // Also add to timeline (never deleted)
      await addDoc(collection(db, 'pairs', pairId, 'timeline'), {
        ...updateData,
        source: 'update_feed'
      });
    } catch (error) {
      console.error("Error posting update:", error);
    } finally {
      set({ loading: false });
    }
  },

  setReaction: async (pairId, updateId, uid, emoji) => {
    try {
      await updateDoc(doc(db, 'pairs', pairId, 'updates', updateId), {
        [`reactions.${uid}`]: emoji
      });
    } catch (error) {
      console.error("Error setting reaction:", error);
    }
  }
}));
