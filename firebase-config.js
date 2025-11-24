import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTd7eVgcJeHTf-nUeeaDlCEdXbl5f5A6k",
  authDomain: "student-teacher-booking-109d6.firebaseapp.com",
  projectId: "student-teacher-booking-109d6",
  storageBucket: "student-teacher-booking-109d6.firebasestorage.app",
  messagingSenderId: "1034882451465",
  appId: "1:1034882451465:web:6d8fe236f7c057503d10d8",
  measurementId: "G-F0QRGP3T7F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase connected successfully!");

// Export these for use in script.js
export { auth, db };