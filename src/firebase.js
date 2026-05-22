// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANWqO52wjFfg1mAMYHtLXNSlH3z6u-MEI",
  authDomain: "game-uber.firebaseapp.com",
  projectId: "game-uber",
  storageBucket: "game-uber.firebasestorage.app",
  messagingSenderId: "232043733602",
  appId: "1:232043733602:web:8da7b1829451c9a469a73b",
  measurementId: "G-J3GYMD8GN5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);