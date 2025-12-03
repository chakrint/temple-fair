import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgY8LtzHjWazxYgqBLrFDm0wDwIAsbjfw",
  authDomain: "starcatcher-s.firebaseapp.com",
  projectId: "starcatcher-s",
  storageBucket: "starcatcher-s.firebasestorage.app",
  messagingSenderId: "638666794776",
  appId: "1:638666794776:web:010a6ebbdab77a6a37606d",
  measurementId: "G-7C07T1GKBX"
};

// เริ่มต้นระบบ Firebase
const app = initializeApp(firebaseConfig);

// ส่งออกตัวจัดการ Database (db)
export const db = getFirestore(app);
