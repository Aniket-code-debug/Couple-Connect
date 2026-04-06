import "./global.css";
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from './src/store/useAuthStore';
import { usePairStore } from './src/store/usePairStore';
import { ThemeProvider } from './src/context/ThemeContext';
import { View, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';

// Screens
import LoginScreen from './src/screens/Auth/LoginScreen';
import InviteCodeScreen from './src/screens/Auth/InviteCodeScreen';
import MainTabs from './src/navigation/MainTabs';

const Stack = createStackNavigator();

export default function App() {
  const { user, loading, initialize } = useAuthStore();
  const { initializePair } = usePairStore();

  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.uid) {
      const unsubscribePair = initializePair(user.uid);
      
      // Setup Notifications
      const setupNotifications = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          await updateDoc(doc(db, 'users', user.uid), { pushToken: token });
          console.log("Push Token Saved:", token);
        }
      };
      setupNotifications();

      return () => {
        if (typeof unsubscribePair === 'function') unsubscribePair();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f43f5e" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : !user.isPaired ? ( 
            <Stack.Screen name="InviteCode" component={InviteCodeScreen} />
          ) : (
            <Stack.Screen name="Home" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
