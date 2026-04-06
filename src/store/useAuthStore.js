import { create } from 'zustand';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useAuthStore = create((set) => ({
  user: null,
  userData: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
  setLoading: (loading) => set({ loading }),

  initialize: () => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch user document from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        set({ user, userData: userDoc.exists() ? userDoc.data() : null, loading: false });
      } else {
        set({ user: null, userData: null, loading: false });
      }
    });
    return unsubscribe;
  },

  logout: async () => {
    try {
      await auth().signOut();
      set({ user: null, userData: null });
    } catch (error) {
      set({ error: error.message });
    }
  }
}));
