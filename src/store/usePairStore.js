import { create } from 'zustand';
import { db } from '../services/firebase';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';

export const usePairStore = create((set, get) => ({
  pairId: null,
  partnerData: null,
  streak: 0,
  focusMode: {},
  partnerStatus: null,
  partnerLocation: null,
  loading: false,

  setPairId: (pairId) => set({ pairId }),
  setPartnerData: (partnerData) => set({ partnerData }),
  setStreak: (streak) => set({ streak }),
  setFocusMode: (focusMode) => set({ focusMode }),
  setPartnerStatus: (partnerStatus) => set({ partnerStatus }),
  setPartnerLocation: (partnerLocation) => set({ partnerLocation }),

  initializePair: async (uid) => {
    set({ loading: true });
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists() && userDoc.data().pairId) {
        const pairId = userDoc.data().pairId;
        set({ pairId });

        // Subscribe to real-time pair updates
        const unsubscribe = onSnapshot(doc(db, 'pairs', pairId), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            set({ 
              streak: data.streak || 0,
              focusMode: data.focusMode || {},
              partnerStatus: data.partnerStatus || {},
              partnerLocation: data.partnerLocation || {}
            });

            // Fetch partner data (once or subscribe)
            const partnerId = data.users.find(id => id !== uid);
            if (partnerId) {
              onSnapshot(doc(db, 'users', partnerId), (partnerSnap) => {
                if (partnerSnap.exists()) {
                  set({ partnerData: partnerSnap.data() });
                }
              });
            }
          }
        });
        set({ loading: false });
        return unsubscribe;
      }
    } catch (error) {
      console.error("Error initializing pair:", error);
    } finally {
      set({ loading: false });
    }
  },

  updateFocusMode: async (uid, value) => {
    const { pairId } = get();
    if (!pairId) return;
    try {
      await updateDoc(doc(db, 'pairs', pairId), {
        [`focusMode.${uid}`]: value
      });
    } catch (error) {
      console.error("Error updating focus mode:", error);
    }
  },

  clearPair: () => set({ pairId: null, partnerData: null, streak: 0, focusMode: {}, partnerStatus: null, partnerLocation: null })
}));
