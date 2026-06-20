import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyB5jUK7Zo19gCtfbnZ1AUbt5DHCmlbLxH0",
  authDomain: "lightup-nigeria.firebaseapp.com",
  databaseURL: "https://lightup-nigeria-default-rtdb.firebaseio.com",
  projectId: "lightup-nigeria",
  storageBucket: "lightup-nigeria.firebasestorage.app",
  messagingSenderId: "849273354776",
  appId: "1:849273354776:web:11dcca268b4954419616d"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };