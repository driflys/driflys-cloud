import * as firebaseAdmin from "firebase-admin";
import { applicationDefault } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

// NOTE: Had to use this import syntax due to throwing an undefined error
//       when using other import syntax
const firestore = require("firebase-admin/firestore");

firebaseAdmin.initializeApp({
  credential: applicationDefault(),
  databaseURL: "https://driflys-80cfb.firebaseio.com",
});

const db: Firestore = firestore.getFirestore();
export default db;
