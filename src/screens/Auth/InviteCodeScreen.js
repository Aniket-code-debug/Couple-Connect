import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Clipboard, Share } from 'react-native';
import { auth, db } from '../../services/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';

const InviteCodeScreen = () => {
  const { user } = useAuthStore();
  const [inviteCode, setInviteCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Check if user already has a pending invite code in Firestore
    const fetchInviteCode = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().inviteCode) {
        setInviteCode(userDoc.data().inviteCode);
      }
    };
    fetchInviteCode();
  }, []);

  const generateInviteCode = async () => {
    setIsGenerating(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await updateDoc(doc(db, 'users', user.uid), { inviteCode: code });
      // Also store in a separate collection for quick lookup
      await setDoc(doc(db, 'inviteCodes', code), { 
        creatorId: user.uid,
        createdAt: new Date()
      });
      setInviteCode(code);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJoinPartner = async () => {
    if (inputCode.length !== 6) return;
    setLoading(true);
    try {
      const q = doc(db, 'inviteCodes', inputCode.toUpperCase());
      const inviteSnap = await getDoc(q);

      if (inviteSnap.exists()) {
        const partnerId = inviteSnap.data().creatorId;
        const pairId = [user.uid, partnerId].sort().join('_');

        // Create pair document
        await setDoc(doc(db, 'pairs', pairId), {
          users: [user.uid, partnerId],
          createdAt: new Date(),
          streak: 0,
          focusMode: { [user.uid]: false, [partnerId]: false }
        });

        // Update both users
        await updateDoc(doc(db, 'users', user.uid), { pairId, isPaired: true });
        await updateDoc(doc(db, 'users', partnerId), { pairId, isPaired: true });

        Alert.alert("Success!", "You are now connected with your partner.");
      } else {
        Alert.alert("Error", "Invalid invite code.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Your Couple Connect invite code is: ${inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-20 justify-between">
      <View>
        <Text className="text-3xl font-bold text-gray-900 mb-2">Connect with Your Partner</Text>
        <Text className="text-gray-500 mb-10">To use Couple Connect, you need to be paired with one other person.</Text>

        {!inviteCode ? (
          <TouchableOpacity 
            onPress={generateInviteCode}
            disabled={isGenerating}
            className="bg-rose-100 border border-rose-200 rounded-3xl p-8 items-center mb-10"
          >
            {isGenerating ? <ActivityIndicator color="#f43f5e" /> : (
              <View className="items-center">
                <Text className="text-rose-600 font-semibold text-lg">Generate Invite Code</Text>
                <Text className="text-rose-400 text-sm mt-1">Send this code to your partner</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View className="bg-rose-600 rounded-3xl p-8 items-center mb-10">
            <Text className="text-white opacity-80 text-sm mb-2">Your Invite Code</Text>
            <Text className="text-white text-5xl font-black tracking-widest">{inviteCode}</Text>
            <TouchableOpacity onPress={handleShare} className="mt-6 bg-white/20 px-6 py-2 rounded-full">
              <Text className="text-white font-bold">Share Code</Text>
            </TouchableOpacity>
          </View>
        )}

        <View>
          <Text className="text-gray-400 text-center mb-4 italic">OR</Text>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Enter Partner's Code</Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 mb-6 text-2xl text-center font-bold tracking-widest"
            placeholder="ABC123"
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <TouchableOpacity 
            onPress={handleJoinPartner}
            disabled={loading || inputCode.length < 6}
            className="bg-gray-900 rounded-2xl py-4 items-center"
          >
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Join Partner</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-gray-400 text-center text-xs">
        Connecting is permanent unless a reset is requested.
      </Text>
    </View>
  );
};

export default InviteCodeScreen;
