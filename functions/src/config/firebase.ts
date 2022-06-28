import * as functions from "firebase-functions";

import * as firebaseAdmin from "firebase-admin";
// import { applicationDefault } from "firebase-admin/app";
import { Firestore } from "firebase-admin/firestore";

// NOTE: Had to use this import syntax due to throwing an undefined error
//       when using other import syntax
const firestore = require("firebase-admin/firestore");

firebaseAdmin.initializeApp();

functions.logger.info("Initialized Firebase");

const db: Firestore = firestore.getFirestore();
export default db;
