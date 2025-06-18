export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  imagen?: string;
  precio: number; 
}