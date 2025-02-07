// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAm8yxQLzRRR94ilh1KocuBDfa6JrIhXzQ",
  authDomain: "db-9baab.firebaseapp.com",
  projectId: "db-9baab",
  storageBucket: "db-9baab.firebasestorage.app",
  messagingSenderId: "712937720418",
  appId: "1:712937720418:web:74fc9ff361255e0a2b1f3b",
  measurementId: "G-V40L55Q4K4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export default db;