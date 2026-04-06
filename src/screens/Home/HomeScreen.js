import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { Flame, Bell, Settings, Music, MapPin, Zap, Heart, ThumbsUp, Laugh, Frown, Fire } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { usePairStore } from '../../store/usePairStore';
import { useUpdateStore } from '../../store/useUpdateStore';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  const { pairId, partnerData, streak, focusMode, partnerStatus, updateFocusMode } = usePairStore();
  const { partnerUpdate, subscribeToUpdates, setReaction } = useUpdateStore();

  useEffect(() => {
    if (pairId && user) {
      const unsubscribe = subscribeToUpdates(pairId, user.uid);
      return () => unsubscribe();
    }
  }, [pairId, user]);

  const reactions = [
    { id: 'heart', icon: <Heart size={18} color="#f43f5e" /> },
    { id: 'like', icon: <ThumbsUp size={18} color="#3b82f6" /> },
    { id: 'laugh', icon: <Laugh size={18} color="#f59e0b" /> },
    { id: 'sad', icon: <Frown size={18} color="#6b7280" /> },
    { id: 'fire', icon: <Fire size={18} color="#ef4444" /> },
  ];

  if (!pairId) return <ActivityIndicator className="flex-1" />;

  const isUserInFocus = focusMode[user.uid] || false;
  const isPartnerInFocus = partnerData && focusMode[partnerData.uid] || false;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-10">
          <View className="flex-row items-center bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            <Flame size={20} color="#f43f5e" />
            <Text className="ml-1 text-rose-600 font-bold text-lg">{streak}</Text>
          </View>
          <View className="flex-row space-x-4">
            <TouchableOpacity onPress={() => navigation.navigate('Status')} className="p-2 bg-gray-100 rounded-full">
              <Zap size={22} color="#4b5563" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="p-2 bg-gray-100 rounded-full">
              <Settings size={22} color="#4b5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Focus Banner */}
        {isUserInFocus && (
          <View className="bg-gray-900 rounded-3xl p-4 mb-8 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Bell size={18} color="#fda4af" />
              <Text className="text-white ml-2 font-semibold">Focus Active 🔕</Text>
            </View>
            <TouchableOpacity 
              onPress={() => updateFocusMode(user.uid, false)}
              className="bg-white/10 px-4 py-1.5 rounded-full"
            >
              <Text className="text-white text-xs font-bold">End</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Partner Status Section */}
        <View className="items-center mb-10">
          <View className="relative">
            <View className="w-32 h-32 rounded-full border-4 border-rose-500 p-1">
              <View className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
                {partnerData?.avatarUrl && <Image source={{ uri: partnerData.avatarUrl }} className="w-full h-full" />}
              </View>
            </View>
            {partnerStatus?.[partnerData?.uid] && (
              <View className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow-sm">
                <View className="w-6 h-6 rounded-full bg-rose-500 items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">!</Text>
                </View>
              </View>
            )}
          </View>
          <Text className="mt-4 text-xl font-bold text-gray-900">
            {partnerData?.displayName || 'Partner'} is {partnerStatus?.[partnerData?.uid]?.label || 'Active'}
          </Text>
          {isPartnerInFocus && <Text className="text-rose-500 text-sm font-bold mt-1">Partner is in Focus Mode</Text>}
        </View>

        {/* Latest Partner Update */}
        {partnerUpdate && (
          <View className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-8">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Partner's Latest</Text>
            {partnerUpdate.type === 'text' ? (
              <Text className="text-xl font-semibold text-gray-800 mb-6">{partnerUpdate.content}</Text>
            ) : (
              <Image source={{ uri: partnerUpdate.mediaUrl }} className="w-full aspect-square rounded-2xl mb-6" />
            )}
            
            {/* Quick Reactions */}
            <View className="flex-row space-x-2">
              {reactions.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setReaction(pairId, partnerUpdate.id, user.uid, r.id)}
                  className={`p-3 rounded-2xl ${partnerUpdate.reactions?.[user.uid] === r.id ? 'bg-rose-100' : 'bg-white border border-gray-100'}`}
                >
                  {r.icon}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Music Card */}
        {partnerData?.spotifyNowPlaying && (
          <View className="bg-rose-50 rounded-3xl p-6 mb-8 border border-rose-100">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">Partner is Listening</Text>
                <Text className="text-gray-900 font-bold text-lg">{partnerData.spotifyNowPlaying.track}</Text>
                <Text className="text-gray-500 text-sm">{partnerData.spotifyNowPlaying.artist}</Text>
              </View>
              <Music size={24} color="#f43f5e" />
            </View>
          </View>
        )}

        {/* Location Section */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Location')}
          className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-20 flex-row items-center"
        >
          <View className="bg-white p-3 rounded-2xl shadow-sm mr-4">
            <MapPin size={24} color="#6366f1" />
          </View>
          <View>
            <Text className="text-gray-900 font-bold text-base">Live Location</Text>
            <Text className="text-gray-500 text-sm">
              {partnerStatus?.[partnerData?.uid]?.locationNote || 'Tap to view map'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
