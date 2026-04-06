import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { auth } from '../../services/firebase';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const confirm = await auth().signInWithPhoneNumber(phone);
      setConfirmation(confirm);
    } catch (error) {
      console.error("Error sending code:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    try {
      await confirmation.confirm(code);
    } catch (error) {
      console.error("Error verifying code:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 justify-center">
        <Text className="text-4xl font-bold text-rose-600 mb-2">Couple Connect</Text>
        <Text className="text-gray-500 mb-10">Sign in to connect with your partner</Text>

        {!confirmation ? (
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Phone Number</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 mb-6 text-lg"
              placeholder="+1 234 567 8900"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity 
              onPress={handleSendCode}
              disabled={loading || !phone}
              className="bg-rose-600 rounded-2xl py-4 items-center"
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Send Code</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Verification Code</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 mb-6 text-lg text-center"
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity 
              onPress={handleVerifyCode}
              disabled={loading || code.length < 6}
              className="bg-rose-600 rounded-2xl py-4 items-center"
            >
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Verify & Continue</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmation(null)} className="mt-4 items-center">
              <Text className="text-rose-600">Change Phone Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
