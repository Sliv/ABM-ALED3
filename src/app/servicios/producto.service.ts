import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Producto } from '../Modelos/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private productosRef;

  constructor(private firestore: Firestore) {
    this.productosRef = collection(this.firestore, 'Productos'); // debe existir exactamente
  }

  obtenerProductos(): Observable<Producto[]> {
    // Evitamos orderBy por ahora para descartar errores
    return collectionData(this.productosRef, { idField: 'id' }) as Observable<Producto[]>;
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