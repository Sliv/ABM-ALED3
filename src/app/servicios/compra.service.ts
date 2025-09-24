import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, deleteDoc, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Compra } from '../Modelos/compra.model';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private comprasRef: CollectionReference;

  constructor(private firestore: Firestore) {
    this.comprasRef = collection(this.firestore, 'Compras'); 
  }

  getComprasRef(): CollectionReference {
    return this.comprasRef;
  }

  obtenerCompras(): Observable<Compra[]> {
    return collectionData(this.comprasRef, { idField: 'id' }) as Observable<Compra[]>;
  }

  agregarCompra(compra: Compra): Observable<void> {
    return new Observable<void>(observer => {
      addDoc(this.comprasRef, compra)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(err => observer.error(err));
    });
  }

  async actualizarCompra(id: string, compra: Partial<Compra>): Promise<void> {
    const docRef = doc(this.firestore, 'Compras', id);
    await updateDoc(docRef, compra);
  }

  async eliminarCompra(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'Compras', id);
    await deleteDoc(docRef);
  }
}