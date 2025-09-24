import { Producto } from '../Modelos/producto';

export interface CompraProducto {
  producto: Producto;
  cantidad: number;
  total: number;
}

export interface Compra {
  id?: string;
  usuarioId: string;
  username: string;
  fecha: string; 
  productos: CompraProducto[];
  total?: number; 
}