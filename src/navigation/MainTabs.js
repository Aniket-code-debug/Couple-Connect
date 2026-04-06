import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, MessageSquare, Phone, Activity, User, Clock, MapPin } from 'lucide-react-native';

// Import Screens
import HomeScreen from '../screens/Home/HomeScreen';
import UpdatesScreen from '../screens/Updates/UpdatesScreen';
import CallScreen from '../screens/Call/CallScreen';
import StatusScreen from '../screens/Status/StatusScreen';
import ProfileScreen from '../screens/Settings/SettingsScreen';
import MemoryGallery from '../screens/Timeline/MemoryGallery';
import MapViewScreen from '../screens/Location/MapView';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home size={size} color={color} />;
          if (route.name === 'Updates') return <MessageSquare size={size} color={color} />;
          if (route.name === 'Call') return <Phone size={size} color={color} />;
          if (route.name === 'Status') return <Activity size={size} color={color} />;
          if (route.name === 'Timeline') return <Clock size={size} color={color} />;
          if (route.name === 'Location') return <MapPin size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
          return null;
        },
        tabBarActiveTintColor: '#f43f5e',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 25,
          paddingTop: 10,
          height: 85,
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: '#fff'
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Updates" component={UpdatesScreen} />
      <Tab.Screen name="Call" component={CallScreen} />
      <Tab.Screen name="Status" component={StatusScreen} />
      <Tab.Screen name="Timeline" component={MemoryGallery} />
      <Tab.Screen name="Location" component={MapViewScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;
