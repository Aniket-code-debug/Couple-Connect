import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Coffee, Briefcase, Moon, Book, Sparkles, Send } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { usePairStore } from '../../store/usePairStore';
import { db } from '../../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const StatusScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { pairId } = usePairStore();
  const [selectedStatus, setSelectedStatus] = useState('Free');
  const [customStatus, setCustomStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedStatuses = [
    { id: 'Free', icon: <Sparkles size={24} color="#10b981" />, label: 'Free', color: 'bg-emerald-50' },
    { id: 'Busy', icon: <Briefcase size={24} color="#ef4444" />, label: 'Busy', color: 'bg-red-50' },
    { id: 'Sleeping', icon: <Moon size={24} color="#6366f1" />, label: 'Sleeping', color: 'bg-indigo-50' },
    { id: 'Studying', icon: <Book size={24} color="#f59e0b" />, label: 'Studying', color: 'bg-amber-50' },
    { id: 'Coffee', icon: <Coffee size={24} color="#8b4513" />, label: 'Break', color: 'bg-orange-50' },
  ];

  const handleUpdateStatus = async () => {
    if (!pairId || !user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'pairs', pairId), {
        [`partnerStatus.${user.uid}`]: {
          label: selectedStatus,
          note: customStatus,
          updatedAt: serverTimestamp()
        }
      });
      Alert.alert("Status Updated", "Your partner can now see what you're up to.");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Could not update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-2">My Status</Text>
        <Text className="text-gray-400 mb-10 text-base">Let your partner know what you're up to.</Text>

        {/* Current Status Preview */}
        <View className="bg-rose-50 rounded-3xl p-8 items-center border border-rose-100 mb-10">
          <Text className="text-rose-400 text-xs font-bold uppercase tracking-widest mb-2">Current Status</Text>
          <Text className="text-rose-600 text-4xl font-black mb-1">{selectedStatus}</Text>
          {customStatus ? <Text className="text-rose-400 font-medium italic mt-2">"{customStatus}"</Text> : null}
        </View>

        {/* Status Selection Grid */}
        <View className="flex-row flex-wrap justify-between mb-10">
          {predefinedStatuses.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSelectedStatus(s.id)}
              className={`w-[48%] aspect-square rounded-3xl p-6 items-center justify-center mb-4 ${selectedStatus === s.id ? s.color + ' border-2 border-current' : 'bg-gray-50 border border-gray-100'}`}
              style={{ borderColor: selectedStatus === s.id ? '#f43f5e' : 'transparent' }}
            >
              <View className="p-4 rounded-full bg-white shadow-sm mb-3">
                {s.icon}
              </View>
              <Text className={`font-bold text-lg ${selectedStatus === s.id ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Status Input */}
        <View className="mb-10">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Add Note (Optional)</Text>
          <View className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 flex-row items-center">
            <TextInput
              placeholder="Doing homework... (max 30 chars)"
              className="flex-1 text-lg font-medium text-gray-800"
              maxLength={30}
              value={customStatus}
              onChangeText={setCustomStatus}
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        onPress={handleUpdateStatus}
        disabled={loading}
        className="mx-5 mb-8 bg-rose-600 rounded-2xl py-5 items-center justify-center flex-row shadow-lg shadow-rose-200"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text className="text-white font-bold text-lg mr-2">Update Partner</Text>
            <Send size={18} color="white" />
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default StatusScreen;
