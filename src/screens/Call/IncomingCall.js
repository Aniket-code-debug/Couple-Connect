import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { Phone, PhoneOff, Video, Mic, MicOff, Volume2, User } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { usePairStore } from '../../store/usePairStore';
import { useCallStore } from '../../store/useCallStore';
import { db } from '../../services/firebase';
import { doc, onSnapshot, deleteDoc } from 'firebase/firestore';

const IncomingCall = () => {
  const { user } = useAuthStore();
  const { pairId, partnerData } = usePairStore();
  const { callStatus, setIncomingCall, setCallStatus, endCall } = useCallStore();

  useEffect(() => {
    if (!pairId || !user) return;

    // Listen for active call signaling
    const unsubscribe = onSnapshot(doc(db, 'pairs', pairId, 'call', 'active'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.callerId !== user.uid && data.status === 'ringing') {
          setIncomingCall(data);
        }
      } else {
        setCallStatus('idle');
      }
    });

    return () => unsubscribe();
  }, [pairId, user]);

  const handleAccept = () => {
    setCallStatus('active');
    // Navigation to CallScreen will happen via store state or parent navigator
  };

  const handleDecline = async () => {
    if (pairId) {
      await deleteDoc(doc(db, 'pairs', pairId, 'call', 'active'));
      setCallStatus('idle');
    }
  };

  if (callStatus !== 'ringing' || !user) return null;

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView className="flex-1 bg-gray-900 justify-between py-20 px-8">
        <View className="items-center">
          <View className="w-32 h-32 rounded-full bg-rose-500 items-center justify-center mb-6 animate-pulse">
            <User size={64} color="white" />
          </View>
          <Text className="text-white text-3xl font-bold mb-2">{partnerData?.displayName || 'Partner'}</Text>
          <Text className="text-rose-400 font-bold uppercase tracking-widest">Incoming Call</Text>
        </View>

        <View className="flex-row justify-around items-center">
          <TouchableOpacity 
            onPress={handleDecline}
            className="w-20 h-20 bg-red-500 rounded-full items-center justify-center shadow-lg shadow-red-900"
          >
            <PhoneOff size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleAccept}
            className="w-20 h-20 bg-green-500 rounded-full items-center justify-center shadow-lg shadow-green-900"
          >
            <Phone size={32} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default IncomingCall;
