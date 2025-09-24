import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { CompraService } from '../../servicios/compra.service';
import { Compra } from '../../Modelos/compra.model';
import { query, where, getDocs, CollectionReference } from '@angular/fire/firestore';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-compras.component.html',
  styleUrls: ['./mis-compras.component.css']
})
export class MisComprasComponent implements OnInit {
  compras: Compra[] = [];
  private auth = inject(Auth);

  constructor(private compraService: CompraService) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, async (usuario: User | null) => {
      if (!usuario) {
        this.compras = [];
        return;
      }

      const comprasRef: CollectionReference = this.compraService.getComprasRef();
      const comprasQuery = query(comprasRef, where('usuarioId', '==', usuario.uid));

      try {
        const snapshot = await getDocs(comprasQuery);
        this.compras = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Compra));
        console.log('Compras cargadas:', this.compras);
      } catch (err) {
        console.error('Error al consultar Firestore:', err);
      }
    });
  }
}