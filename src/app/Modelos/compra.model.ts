// src/app/Modelos/compra.model.ts
export interface CompraProducto {
  producto: {
    id: string;
    nombre: string;
    precio: number;
    categoria?: string;  // opcional
    imagen?: string;     // opcional
  };
  cantidad: number;
}

export interface Compra {
  id?: string;
  username: string;
  fecha: string;
  productos: CompraProducto[];
  total?: number; // opcional si querés calcularlo al generar la compra
}