import { Component, OnInit, ElementRef, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../Modelos/producto';
import { CompraService } from '../../servicios/compra.service';
import { Compra, CompraProducto } from '../../Modelos/compra.model';
import { Auth, User } from '@angular/fire/auth';
import { Firestore, collection, addDoc, doc, setDoc, onSnapshot, query, orderBy } from '@angular/fire/firestore';
import { AlertsComponent } from '../../component/alerts/alerts.component';

interface CarritoItem {
  producto: Producto & { id: string };
  cantidad: number;
}

interface Mensaje {
  id?: string;
  userId: string;
  username: string;
  rol: string;
  texto: string;
  fecha?: string;
}

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertsComponent],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit, OnDestroy {
  producto?: Producto & { id: string };
  cantidad: number = 1;
  preguntaTexto: string = '';
  mensajes: Mensaje[] = [];
  mostrarTodos: boolean = false;

  mostrarAlerta: boolean = false;
  mensajeAlerta: string = '';
  tipoAlerta: 'exito' | 'error' | 'advertencia' | 'info' = 'info';
  duracionAlerta: number = 20000;

  @ViewChild('inputPregunta') inputPregunta!: ElementRef;

  private productoService = inject(ProductoService);
  private compraService = inject(CompraService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  private mensajesUnsubscribe: (() => void) | undefined;
  private alertaTimeout: any;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/comprar-productos']);
      return;
    }
    
    try {
      const productos = await firstValueFrom(this.productoService.obtenerProductos());
      const prod = productos.find(p => p.id === id);
      if (!prod) {
        this.router.navigate(['/comprar-productos']);
        return;
      }
      this.producto = { ...prod, id: prod.id! };
      this.cargarPreguntas();
    } catch (err) {
      console.error('Error al cargar productos:', err);
      this.mostrarNotificacion('No se pudieron cargar los productos. Intente más tarde.', 'error');
      this.router.navigate(['/comprar-productos']);
    }
  }

  ngOnDestroy(): void {
    if (this.mensajesUnsubscribe) this.mensajesUnsubscribe();
    if (this.alertaTimeout) clearTimeout(this.alertaTimeout);
  }

  mostrarNotificacion(mensaje: string, tipo: 'exito' | 'error' | 'advertencia' | 'info' = 'info', duracion: number = this.duracionAlerta) {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    this.mostrarAlerta = true;

    if (this.alertaTimeout) clearTimeout(this.alertaTimeout);
    this.alertaTimeout = setTimeout(() => {
      this.mostrarAlerta = false;
    }, duracion);
  }

  agregarAlCarrito(): void {
    if (!this.producto) return;

    const currentUser: User | null = this.auth.currentUser;
    if (!currentUser) {
      this.mostrarNotificacion('Debes iniciar sesión para agregar productos al carrito.', 'info');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
      return;
    }

    const username = currentUser.email || currentUser.displayName || 'Invitado';
    const carritoKey = 'carrito_' + username;
    let carritoActual: CarritoItem[] = [];

    try {
      const data = localStorage.getItem(carritoKey);
      carritoActual = data ? JSON.parse(data) : [];
    } catch {
      carritoActual = [];
    }

    const existente = carritoActual.find(item => item.producto.id === this.producto!.id);
    if (existente) {
      existente.cantidad += this.cantidad;
    } else {
      carritoActual.push({ producto: { ...this.producto }, cantidad: this.cantidad });
    }

    localStorage.setItem(carritoKey, JSON.stringify(carritoActual));
    this.mostrarNotificacion('Producto agregado al carrito', 'exito');
  }

  comprarAhora(): void {
    if (!this.producto) return;

    const currentUser: User | null = this.auth.currentUser;
    if (!currentUser) {
      this.mostrarNotificacion('Debes iniciar sesión para realizar una compra.', 'info');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
      return;
    }

    const username = currentUser.email || currentUser.displayName || 'Invitado';

    const productosCompra: CompraProducto[] = [{
      producto: {
        id: this.producto.id!,
        nombre: this.producto.nombre,
        precio: this.producto.precio,
        descripcion: this.producto.descripcion,
        categoria: this.producto.categoria || '',
        imagen: this.producto.imagen || ''
      },
      cantidad: this.cantidad,
      total: this.producto.precio * this.cantidad
    }];

    const compra: Compra = {
      usuarioId: currentUser.uid,
      username,
      productos: productosCompra,
      fecha: new Date().toISOString(),
      total: productosCompra.reduce((sum, item) => sum + item.total, 0)
    };

    this.compraService.agregarCompra(compra).subscribe({
      next: () => {
        localStorage.setItem('factura_temp', JSON.stringify(productosCompra));
        this.router.navigate(['/factura']);
      },
      error: (err) => {
        console.error('Error al guardar la compra:', err);
        this.mostrarNotificacion('Error al guardar la compra', 'error');
      }
    });
  }

  private cargarPreguntas() {
    if (!this.producto) return;

    const mensajesRef = collection(this.firestore, `Preguntas/${this.producto.id}/Mensajes`);
    const q = query(mensajesRef, orderBy('fecha', 'asc'));

    this.mensajesUnsubscribe = onSnapshot(q, (snapshot) => {
      this.mensajes = snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data()['userId'] || '',
        username: doc.data()['username'] || 'Invitado',
        rol: doc.data()['rol'] || 'usuario',
        texto: doc.data()['texto'] || '',
        fecha: doc.data()['fecha'] || ''
      }));
    });
  }

  async enviarPregunta() {
    if (!this.preguntaTexto.trim() || !this.producto) return;

    const currentUser: User | null = this.auth.currentUser;

    if (!currentUser) {
      this.mostrarNotificacion('Debes iniciar sesión para realizar una pregunta.', 'info');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
      return;
    }

    const token = await currentUser.getIdTokenResult();
    const esAdmin = token.claims['admin'] === true;

    const usernameBase = currentUser.email || currentUser.displayName || 'Usuario';
    const rol = esAdmin ? 'Admin' : 'Usuario';
    const username = `${usernameBase} (${rol})`;

    const userId = currentUser.uid;

    const padreRef = doc(this.firestore, `Preguntas/${this.producto.id}`);
    await setDoc(padreRef, { productoId: this.producto.id }, { merge: true });

    const mensajesCol = collection(this.firestore, `Preguntas/${this.producto.id}/Mensajes`);
    await addDoc(mensajesCol, {
      userId,
      username,
      rol,
      texto: this.preguntaTexto,
      fecha: new Date().toISOString()
    });

    this.preguntaTexto = '';
    this.inputPregunta.nativeElement.focus();
  }

  toggleMostrarTodos() {
    this.mostrarTodos = !this.mostrarTodos;
  }

  trackById(index: number, item: Mensaje) {
    return item.id;
  }
}