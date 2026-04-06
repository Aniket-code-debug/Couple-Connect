import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, BlurView, StyleSheet, Modal } from 'react-native';
import { Phone, Video, X, Mic, MicOff, Volume2, VolumeX, Camera, CameraOff, Languages } from 'lucide-react-native';

const CallScreen = () => {
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState('audio');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => {
    let timer;
    if (inCall) {
      timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(timer);
  }, [inCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = (type) => {
    setCallType(type);
    setInCall(true);
  };

  const endCall = () => {
    setInCall(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {!inCall ? (
        <View className="flex-1 px-5 pt-8 items-center justify-center">
          <View className="w-40 h-40 rounded-full border-4 border-rose-500 overflow-hidden mb-8">
            {/* Partner Avatar Placeholder */}
            <View className="w-full h-full bg-gray-200" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Connect Now</Text>
          <Text className="text-gray-400 mb-16 text-center text-lg px-10">Start a private call with your partner.</Text>

          <View className="flex-row space-x-6 w-full px-10">
            <TouchableOpacity 
              onPress={() => startCall('audio')}
              className="flex-1 aspect-square bg-rose-50 rounded-3xl items-center justify-center border border-rose-100"
            >
              <View className="bg-rose-500 p-4 rounded-full mb-3 shadow-lg shadow-rose-200">
                <Phone size={28} color="white" />
              </View>
              <Text className="text-rose-600 font-bold text-lg">Audio Call</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => startCall('video')}
              className="flex-1 aspect-square bg-gray-900 rounded-3xl items-center justify-center"
            >
              <View className="bg-white/10 p-4 rounded-full mb-3">
                <Video size={28} color="white" />
              </View>
              <Text className="text-white font-bold text-lg">Video Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Modal animationType="slide" visible={inCall} transparent={false}>
          <View className={`flex-1 ${callType === 'video' ? 'bg-black' : 'bg-rose-600'}`}>
            {/* In-Call Header */}
            <View className="pt-20 items-center">
              <View className="w-24 h-24 rounded-full border-2 border-white/30 overflow-hidden mb-4">
                <View className="w-full h-full bg-white/10" />
              </View>
              <Text className="text-white text-2xl font-bold">Partner Name</Text>
              <Text className="text-white/60 font-medium text-lg mt-1">{formatDuration(duration)}</Text>
            </View>

            {/* Video View Placeholder */}
            {callType === 'video' && (
              <View className="absolute inset-0 z-0">
                <View className="flex-1 bg-gray-800" />
              </View>
            )}

            {/* Controls */}
            <View className="absolute bottom-20 left-0 right-0 px-8 flex-row justify-between items-center">
              <TouchableOpacity 
                onPress={() => (callType === 'video' ? setIsCameraOff(!isCameraOff) : setIsSpeaker(!isSpeaker))}
                className="w-14 h-14 rounded-full bg-white/10 items-center justify-center"
              >
                {callType === 'video' ? (
                  isCameraOff ? <CameraOff size={24} color="white" /> : <Camera size={24} color="white" />
                ) : (
                  isSpeaker ? <VolumeX size={24} color="white" /> : <Volume2 size={24} color="white" />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={endCall}
                className="w-20 h-20 rounded-full bg-red-500 items-center justify-center shadow-lg shadow-red-900/50"
              >
                <X size={32} color="white" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 rounded-full ${isMuted ? 'bg-white' : 'bg-white/10'} items-center justify-center`}
              >
                {isMuted ? <MicOff size={24} color="#f43f5e" /> : <Mic size={24} color="white" />}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default CallScreen;
