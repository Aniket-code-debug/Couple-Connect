import { create } from 'zustand';
import { db, functions } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

export const useCallStore = create((set, get) => ({
  callStatus: 'idle', // 'idle'|'ringing'|'active'|'ended'
  callType: 'audio',
  agoraToken: null,
  channelName: null,
  callerId: null,
  loading: false,

  initiateCall: async (pairId, uid, type) => {
    set({ loading: true, callStatus: 'ringing', callType: type, channelName: pairId, callerId: uid });
    try {
      // Get Agora Token from Cloud Function
      const generateToken = httpsCallable(functions, 'generateAgoraToken');
      const response = await generateToken({ channelName: pairId, uid: uid });
      const token = response.data.token;
      set({ agoraToken: token });

      // Write call document to Firestore for signaling
      await setDoc(doc(db, 'pairs', pairId, 'call', 'active'), {
        callerId: uid,
        callType: type,
        channelName: pairId,
        createdAt: serverTimestamp(),
        status: 'ringing'
      });
    } catch (error) {
      console.error("Error initiating call:", error);
      set({ callStatus: 'idle' });
    } finally {
      set({ loading: false });
    }
  },

  endCall: async (pairId) => {
    try {
      await deleteDoc(doc(db, 'pairs', pairId, 'call', 'active'));
      set({ callStatus: 'idle', agoraToken: null, channelName: null, callerId: null });
    } catch (error) {
      console.error("Error ending call:", error);
    }
  },

  setCallStatus: (status) => set({ callStatus: status }),
  setAgoraToken: (token) => set({ agoraToken: token }),
  setIncomingCall: (callData) => set({ 
    callStatus: 'ringing', 
    callType: callData.callType, 
    channelName: callData.channelName, 
    callerId: callData.callerId 
  })
}));
