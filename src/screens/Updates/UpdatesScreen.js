import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Camera, Image as ImageIcon, Video, Send, Heart, ThumbsUp, Laugh, Frown, Fire } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/useAuthStore';
import { usePairStore } from '../../store/usePairStore';
import { useUpdateStore } from '../../store/useUpdateStore';

const UpdatesScreen = () => {
  const { user } = useAuthStore();
  const { pairId } = usePairStore();
  const { postUpdate, loading } = useUpdateStore();
  
  const [updateType, setUpdateType] = useState('text');
  const [content, setContent] = useState('');
  const [mediaUri, setMediaUri] = useState(null);

  const pickImage = async (useCamera = false) => {
    let result;
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    };

    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission required", "Allow camera access to take photos.");
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setUpdateType('media');
    }
  };

  const handlePost = async () => {
    if (!pairId || !user) return;
    await postUpdate(pairId, user.uid, updateType, content, mediaUri);
    setContent('');
    setMediaUri(null);
    setUpdateType('text');
    Alert.alert("Posted!", "Your update is now live for 24 hours.");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5 pt-4">
          <Text className="text-3xl font-bold text-gray-900 mb-6">Quick Update</Text>

          {/* Type Selector */}
          <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-8">
            <TouchableOpacity 
              onPress={() => setUpdateType('text')}
              className={`flex-1 py-3 rounded-xl items-center ${updateType === 'text' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold ${updateType === 'text' ? 'text-gray-900' : 'text-gray-400'}`}>Text</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setUpdateType('media')}
              className={`flex-1 py-3 rounded-xl items-center ${updateType === 'media' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold ${updateType === 'media' ? 'text-gray-900' : 'text-gray-400'}`}>Media</Text>
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-8 min-h-[300px] justify-center items-center overflow-hidden">
            {updateType === 'text' ? (
              <TextInput
                multiline
                maxLength={120}
                placeholder="What's on your mind?"
                className="text-2xl font-semibold text-center text-gray-800 w-full"
                value={content}
                onChangeText={setContent}
              />
            ) : mediaUri ? (
              <View className="w-full h-full relative">
                <Image source={{ uri: mediaUri }} className="w-full h-full rounded-2xl" />
                <TouchableOpacity 
                  onPress={() => setMediaUri(null)}
                  className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                >
                  <Text className="text-white font-bold">X</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row space-x-6">
                <TouchableOpacity 
                  onPress={() => pickImage(true)}
                  className="bg-rose-600 p-6 rounded-full items-center justify-center"
                >
                  <Camera size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => pickImage(false)}
                  className="bg-rose-100 p-6 rounded-full items-center justify-center"
                >
                  <ImageIcon size={32} color="#f43f5e" />
                </TouchableOpacity>
              </View>
            )}
            {updateType === 'text' && (
              <Text className="absolute bottom-4 right-6 text-gray-300 text-xs font-bold">
                {content.length}/120
              </Text>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity 
          onPress={handlePost}
          disabled={loading || (updateType === 'text' && !content) || (updateType === 'media' && !mediaUri)}
          className="mx-5 mb-8 bg-rose-600 rounded-2xl py-5 items-center flex-row justify-center"
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">Post Instantly</Text>
              <Send size={18} color="white" />
            </>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UpdatesScreen;
