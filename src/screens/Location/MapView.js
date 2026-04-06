import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { usePairStore } from '../../store/usePairStore';
import { db } from '../../services/firebase';
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { MapPin, Navigation, X, Clock } from 'lucide-react-native';

const MapViewScreen = () => {
  const { pairId, user, partnerId, partnerLocation } = usePairStore();
  const [location, setLocation] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [duration, setDuration] = useState('15m');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permissions are required for this feature.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const startSharing = async () => {
    setSharing(true);
    try {
      // Start location watching
      const watcher = await Location.watchPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000, // 30 seconds
        distanceInterval: 50,
      }, async (loc) => {
        setLocation(loc);
        if (pairId && user) {
          await updateDoc(doc(db, 'pairs', pairId), {
            [`partnerLocation.${user.uid}`]: {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              updatedAt: serverTimestamp(),
              expiresAt: new Date(Date.now() + 15 * 60 * 1000) // Placeholder for duration logic
            }
          });
        }
      });

      return () => watcher.remove();
    } catch (error) {
      console.error("Error sharing location:", error);
      setSharing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 relative">
        {location ? (
          <MapView
            className="flex-1"
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* User Marker */}
            <Marker coordinate={location.coords} title="You">
              <View className="bg-rose-500 p-2 rounded-full border-2 border-white">
                <Navigation size={16} color="white" />
              </View>
            </Marker>

            {/* Partner Marker */}
            {partnerLocation?.[partnerId] && (
              <Marker 
                coordinate={{
                  latitude: partnerLocation[partnerId].latitude,
                  longitude: partnerLocation[partnerId].longitude
                }} 
                title="Partner"
              >
                <View className="bg-blue-500 p-2 rounded-full border-2 border-white">
                   <MapPin size={16} color="white" />
                </View>
              </Marker>
            )}
          </MapView>
        ) : (
          <ActivityIndicator className="flex-1" color="#f43f5e" />
        )}

        {/* Controls Overlay */}
        <View className="absolute bottom-10 left-0 right-0 px-6">
          {!sharing ? (
            <View className="bg-white p-6 rounded-[40px] shadow-2xl shadow-rose-200">
              <Text className="text-xl font-bold text-gray-900 mb-4 text-center">Share Live Location</Text>
              <View className="flex-row justify-between mb-6">
                {['15m', '1h', '∞'].map(d => (
                  <TouchableOpacity 
                    key={d} 
                    onPress={() => setDuration(d)}
                    className={`px-6 py-3 rounded-2xl ${duration === d ? 'bg-rose-100 border border-rose-200' : 'bg-gray-50'}`}
                  >
                    <Text className={`font-bold ${duration === d ? 'text-rose-600' : 'text-gray-400'}`}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity 
                onPress={startSharing}
                className="bg-rose-600 py-5 rounded-3xl items-center flex-row justify-center"
              >
                <Clock size={20} color="white" className="mr-2" />
                <Text className="text-white font-black text-lg">Start Sharing</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-gray-900 p-6 rounded-[40px] flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-rose-500 rounded-full animate-pulse mr-3" />
                <Text className="text-white font-bold text-lg">Sharing Location...</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setSharing(false)}
                className="bg-white/10 p-3 rounded-full"
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MapViewScreen;
