import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, deleteDoc, doc, query, where } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { Compra } from '../Modelos/compra.model';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  constructor(private firestore: Firestore) {}

  private obtenerUsername(): string | null {
    const userData = localStorage.getItem('usuario');
    if (!userData) return null;
    try {
      const user = JSON.parse(userData);
      return typeof user.username === 'string' ? user.username : null;
    } catch {
      return null;
    }
  }

  obtenerCompras(): Observable<Compra[]> {
    const username = this.obtenerUsername();
    if (!username) return of([]);

    const comprasRef = collection(this.firestore, 'compras');
    const q = query(comprasRef, where('username', '==', username));

    return from(
      getDocs(q).then(snapshot =>
        snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Compra))
      )
    );
  }

  agregarCompra(compra: Compra): Observable<Compra> {
    const username = this.obtenerUsername();
    if (!username) throw new Error('Usuario no autenticado');

    const comprasRef = collection(this.firestore, 'compras');

    // Creamos un objeto serializable para Firebase
    const compraData = {
      username,
      productos: compra.productos.map(p => ({
        id: p.producto.id,
        nombre: p.producto.nombre,
        precio: p.producto.precio,
        cantidad: p.cantidad
      })),
      total: compra.productos.reduce((sum, p) => sum + p.producto.precio * p.cantidad, 0),
      fecha: compra.fecha // ya es string
    };

    return from(
      addDoc(comprasRef, compraData).then(docRef => ({
        ...compra,
        id: docRef.id,
        username
      }))
    );
  }

  limpiarHistorial(): Observable<void> {
    const username = this.obtenerUsername();
    if (!username) throw new Error('Usuario no autenticado');

    const comprasRef = collection(this.firestore, 'compras');
    const q = query(comprasRef, where('username', '==', username));

    return from(
      getDocs(q).then(snapshot => {
        snapshot.forEach(d => deleteDoc(doc(this.firestore, 'compras', d.id)));
      })
    );
  }
}