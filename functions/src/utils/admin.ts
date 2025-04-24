import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp(); // 👈 initialize only once
}

export { admin };