const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("/Users/bijanpanda/Desktop/Personal/Trainings/Budget App/budget-app-7a169-firebase-adminsdk-fbsvc-11b4b36c8a.json");

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function deleteAllAuthUsers() {
  let deleted = 0;
  let nextPageToken;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    if (result.users.length === 0) break;
    const uids = result.users.map((u) => u.uid);
    await auth.deleteUsers(uids);
    deleted += uids.length;
    console.log(`  Deleted ${deleted} auth users so far...`);
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  console.log(`✅ Auth: deleted ${deleted} users total`);
}

async function deleteCollection(colRef, batchSize = 400) {
  while (true) {
    const snap = await colRef.limit(batchSize).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    for (const doc of snap.docs) {
      const subcols = await doc.ref.listCollections();
      for (const sub of subcols) {
        await deleteCollection(sub, batchSize);
      }
    }
  }
}

async function deleteAllFirestore() {
  const cols = await db.listCollections();
  for (const col of cols) {
    console.log(`  Deleting collection: ${col.id}`);
    await deleteCollection(col);
    console.log(`  ✅ ${col.id} cleared`);
  }
  console.log(`✅ Firestore: cleared`);
}

(async () => {
  console.log("🗑️  Starting full data purge...\n");
  await deleteAllAuthUsers();
  await deleteAllFirestore();
  console.log("\n✅ All done. Firebase is clean for fresh testing.");
  process.exit(0);
})();
