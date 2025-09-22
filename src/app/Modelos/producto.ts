export interface Producto {
  id?: string; // importante: string, no number
  nombre: string;
  descripcion?: string;
  categoria?: string;
  imagen?: string;
  precio: number;
}