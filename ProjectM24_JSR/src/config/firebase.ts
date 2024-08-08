import { getStorage } from "firebase/storage";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDrUiG-VSnkOF0g_0SfnOlSmr0QtaTpZoo",
  authDomain: "khaa-4a9da.firebaseapp.com",
  projectId: "khaa-4a9da",
  storageBucket: "khaa-4a9da.appspot.com",
  messagingSenderId: "403366899793",
  appId: "1:403366899793:web:779077662623f0091e0870",
  measurementId: "G-03QQK121J2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
