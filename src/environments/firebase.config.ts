import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyAO5JFQOHT0Ii6VnibSgmW8ERbqOw7AwEM",
  authDomain: "comercio-905d9.firebaseapp.com",
  projectId: "comercio-905d9",
  storageBucket: "comercio-905d9.appspot.com",
  messagingSenderId: "1071223036687",
  appId: "1:1071223036687:web:6f34bdebc2f65fd961bc7a",
  measurementId: "G-BF3JBCEHNF"
};

export const appFirebase = initializeApp(firebaseConfig);

export const db = getFirestore(appFirebase);

export const auth = getAuth(appFirebase);