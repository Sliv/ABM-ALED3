import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDocs } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor(private firestore: Firestore) {}

  async saveUser(user: any) {
    const ref = doc(collection(this.firestore, 'usuarios'));
    await setDoc(ref, user);
  }

  async getUsers() {
    const querySnapshot = await getDocs(collection(this.firestore, 'usuarios'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}