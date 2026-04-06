const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

admin.initializeApp();

// 1. Generate Agora Token
exports.generateAgoraToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated');
  
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_PRIMARY_CERTIFICATE;
  const channelName = data.channelName;
  const uid = data.uid || 0;
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId, 
    appCertificate, 
    channelName, 
    uid, 
    role, 
    privilegeExpiredTs
  );

  return { token };
});

// 2. Send Push Notification on new update
exports.sendPushNotification = functions.firestore
  .document("pairs/{pairId}/updates/{updateId}")
  .onCreate(async (snapshot, context) => {
    const update = snapshot.data();
    const pairId = context.params.pairId;
    
    const pairSnap = await admin.firestore().doc(`pairs/${pairId}`).get();
    const userData = pairSnap.data();
    const partnerId = userData.users.find(id => id !== update.uid);

    const partnerSnap = await admin.firestore().doc(`users/${partnerId}`).get();
    const pushToken = partnerSnap.data().pushToken;

    if (pushToken) {
      await admin.messaging().send({
        token: pushToken,
        notification: {
          title: "New Update from Partner!",
          body: update.type === 'text' ? update.content : "Shared a photo/video"
        },
        data: { screen: "Updates" }
      });
    }
  });

// 3. Check Connection Streak (Daily at Midnight UTC)
exports.checkStreak = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("UTC")
  .onRun(async (context) => {
    const pairsSnap = await admin.firestore().collection("pairs").get();
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    for (const doc of pairsSnap.docs) {
      const pairId = doc.id;
      const updatesSnap = await admin.firestore()
        .collection(`pairs/${pairId}/updates`)
        .where("createdAt", ">=", yesterday)
        .get();

      // Check if both users posted yesterday
      const posters = new Set(updatesSnap.docs.map(u => u.data().uid));
      const users = doc.data().users;
      
      if (users.every(u => posters.has(u))) {
        await doc.ref.update({ streak: admin.firestore.FieldValue.increment(1) });
      } else {
        await doc.ref.update({ streak: 0 });
      }
    }
  });

// 4. Expire Feed Updates (Every Hour)
exports.expireUpdates = functions.pubsub
  .schedule("0 * * * *")
  .onRun(async (context) => {
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pairsSnap = await admin.firestore().collection("pairs").get();

    for (const doc of pairsSnap.docs) {
      const expiredSnap = await admin.firestore()
        .collection(`pairs/${doc.id}/updates`)
        .where("createdAt", "<", threshold)
        .get();
      
      const batch = admin.firestore().batch();
      expiredSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  });

// 5. Clear Status (Every Hour)
exports.clearStatus = functions.pubsub
  .schedule("0 * * * *")
  .onRun(async (context) => {
    const threshold = new Date(Date.now() - 4 * 60 * 60 * 1000);
    const pairsSnap = await admin.firestore().collection("pairs").get();

    for (const doc of pairsSnap.docs) {
      const data = doc.data();
      const newStatus = { ...data.partnerStatus };
      let changed = false;

      Object.keys(newStatus).forEach(uid => {
        if (newStatus[uid].updatedAt.toDate() < threshold) {
          delete newStatus[uid];
          changed = true;
        }
      });

      if (changed) {
        await doc.ref.update({ partnerStatus: newStatus });
      }
    }
  });

// 6. Stop Location Sharing (Every 5 minutes)
exports.stopLocationShare = functions.pubsub
  .schedule("*/5 * * * *")
  .onRun(async (context) => {
    const now = new Date();
    const pairsSnap = await admin.firestore().collection("pairs").get();

    for (const doc of pairsSnap.docs) {
      const data = doc.data();
      const newLoc = { ...data.partnerLocation };
      let changed = false;

      Object.keys(newLoc).forEach(uid => {
        if (newLoc[uid].expiresAt.toDate() < now) {
          delete newLoc[uid];
          changed = true;
        }
      });

      if (changed) {
        await doc.ref.update({ partnerLocation: newLoc });
      }
    }
  });
