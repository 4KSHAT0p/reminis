// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDl02wsYAWXxID_iK68qvn3fYtmXv0zNkc",
  authDomain: "reminis-f95d1.firebaseapp.com",
  projectId: "reminis-f95d1",
  storageBucket: "reminis-f95d1.firebasestorage.app",
  messagingSenderId: "124889103264",
  appId: "1:124889103264:web:6308a11f231dfd437dc2c5"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});