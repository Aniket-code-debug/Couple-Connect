import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { User, LogOut, Moon, Music, Shield, RefreshCw, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../context/ThemeContext';

const SettingsScreen = () => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  const handleResetPartner = () => {
    Alert.alert(
      "Request Reset",
      "This will disconnect you from your partner. Both users must confirm, and there is a 48-hour cooldown. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Request Reset", style: "destructive", onPress: () => console.log("Reset requested") }
      ]
    );
  };

  const menuItems = [
    { id: 'profile', icon: <User size={22} color="#4b5563" />, label: 'Profile Settings', type: 'link' },
    { id: 'theme', icon: <Moon size={22} color="#4b5563" />, label: 'Dark Mode', type: 'switch', value: isDark, onValueChange: toggleTheme },
    { id: 'spotify', icon: <Music size={22} color="#1db954" />, label: 'Connect Spotify', type: 'switch', value: isSpotifyConnected, onValueChange: setIsSpotifyConnected },
    { id: 'privacy', icon: <Shield size={22} color="#4b5563" />, label: 'Privacy & Security', type: 'link' },
    { id: 'reset', icon: <RefreshCw size={22} color="#ef4444" />, label: 'Disconnect Partner', type: 'link', action: handleResetPartner, destructive: true },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-8">Settings</Text>

        {/* Profile Card */}
        <View className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-10 flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-rose-100 items-center justify-center mr-4">
            <User size={32} color="#f43f5e" />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">Your Name</Text>
            <Text className="text-gray-400 font-medium">Joined Oct 2023</Text>
          </View>
        </View>

        {/* Settings List */}
        <View className="space-y-4">
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id}
              onPress={item.action}
              disabled={item.type === 'switch'}
              className="flex-row items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl"
            >
              <View className="flex-row items-center">
                <View className="p-2 rounded-xl bg-white shadow-sm mr-4">
                  {item.icon}
                </View>
                <Text className={`font-bold text-lg ${item.destructive ? 'text-red-500' : 'text-gray-700'}`}>{item.label}</Text>
              </View>
              
              {item.type === 'switch' ? (
                <Switch 
                  value={item.value} 
                  onValueChange={item.onValueChange}
                  trackColor={{ false: "#e5e7eb", true: "#fecdd3" }}
                  thumbColor={item.value ? "#f43f5e" : "#f3f4f6"}
                />
              ) : (
                <ChevronRight size={20} color="#9ca3af" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity 
          onPress={logout}
          className="mt-12 flex-row items-center justify-center p-5 bg-rose-50 border border-rose-100 rounded-2xl"
        >
          <LogOut size={22} color="#f43f5e" />
          <Text className="ml-2 text-rose-600 font-bold text-lg">Log Out</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-300 text-xs mt-10 mb-20 font-bold tracking-widest uppercase">Couple Connect v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
