import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const serviceAccount = require("/Users/bijanpanda/Desktop/Personal/Trainings/Budget App/budget-app-7a169-firebase-adminsdk-fbsvc-11b4b36c8a.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const auth = admin.auth();
const db = admin.firestore();

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
  let deleted = 0;
  while (true) {
    const snap = await colRef.limit(batchSize).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.docs.length;

    // Delete subcollections for each doc
    for (const doc of snap.docs) {
      const subcols = await doc.ref.listCollections();
      for (const sub of subcols) {
        await deleteCollection(sub, batchSize);
      }
    }
  }
  return deleted;
}

async function deleteAllFirestore() {
  const cols = await db.listCollections();
  let total = 0;
  for (const col of cols) {
    console.log(`  Deleting collection: ${col.id}`);
    await deleteCollection(col);
    console.log(`  ✅ ${col.id} cleared`);
    total++;
  }
  console.log(`✅ Firestore: cleared ${total} top-level collections`);
}

(async () => {
  console.log("🗑️  Starting full data purge...\n");
  await deleteAllAuthUsers();
  await deleteAllFirestore();
  console.log("\n✅ All done. Firebase is clean for fresh testing.");
  process.exit(0);
})();
