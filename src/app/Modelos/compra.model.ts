export interface Compra {
  username: string;
  fecha: string;
  productos: {
    producto: {
      id: number;
      nombre: string;
      precio: number;
    };
    cantidad: number;
  }[];
}