import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../Modelos/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private productosRef;

  constructor(private firestore: Firestore) {
    this.productosRef = collection(this.firestore, 'Productos');
  }

  obtenerProductos(): Observable<Producto[]> {
    return from(getDocs(this.productosRef)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto)))
    );
  }

  async agregarProducto(producto: Producto): Promise<void> {
    const { id, ...data } = producto;
    await addDoc(this.productosRef, data);
  }

  async actualizarProducto(producto: Producto): Promise<void> {
    if (!producto.id) throw new Error('Producto sin id');
    const docRef = doc(this.firestore, 'Productos', producto.id);
    await updateDoc(docRef, { ...producto });
  }

  async eliminarProducto(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'Productos', id);
    await deleteDoc(docRef);
  }
}