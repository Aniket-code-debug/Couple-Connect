# Couple Connect - Private Pair App

A production-ready React Native + Expo application for two people.

## Features
- **Pair Lock:** Secure phone-auth pairing with random 6-digit codes.
- **Quick Updates:** 24h ephemeral updates (Text/Photo/Video).
- **Status Sync:** Real-time "Busy/Free/Studying" status updates.
- **AV Calls:** Secure audio and video calls via Agora.
- **Focus Mode:** Silence distractions with partner-aware focus state.
- **Music Sync:** Share current Spotify track in real-time.
- **Live Location:** 15m/1h/Always-on GPS sharing on private maps.
- **Memory Timeline:** Permanent gallery of shared moments.
- **Daily Streak:** Visual connection streaks using UTC calendar logic.

## Tech Stack
- **Frontend:** React Native (Expo SDK 54), NativeWind (Tailwind), Reanimated.
- **Backend:** Firebase (Auth, Firestore, Storage, Functions).
- **External APIs:** Agora (RTC), Spotify (Web API).
- **State Mgmt:** Zustand.

## Setup Instructions

### 1. Prerequisites
- Node.js (Latest LTS)
- Expo CLI (`npm install -g expo-cli`)
- Firebase Account
- Agora Developer Account

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Rename `.env.example` to `.env` and fill in your API keys.

### 4. Firebase Configuration
1. Enable **Phone Auth** and **Firestore** in Firebase Console.
2. Copy your config into `src/services/firebase.js` or set via environment variables.
3. Deploy Firestore rules: `firebase deploy --only firestore:rules`.

### 5. Running the App
```bash
npx expo start --dev-client
```
*Note: Due to Agora and Phone Auth native requirements, you must use a development build (`npx expo run:android` or `npx expo run:ios`).*

## API Key Setup
- **Agora:** Get App ID and Primary Certificate from Agora Console.
- **Spotify:** Create an app in Spotify Developer Dashboard and whitelist your redirect URI.
- **Firebase:** Standard web config.

## Deployment Checklist
- [ ] Configure FCM for Push Notifications.
- [ ] Set up production Cloud Functions for streak/status cleanup.
- [ ] Set up Agora token generation backend.
- [ ] Configure App Store/Play Store metadata and assets.
