import { Injectable } from '@angular/core';
import { Usuario } from '../Clases/Usuario';

@Injectable({
  providedIn: 'root'
})

export class UsuarioService {

  private _usuarios: Array<Usuario>;

  constructor() {
    this._usuarios = JSON.parse(localStorage.getItem("usuarios") ?? '[]');
  }

  public get Usuario(): Array<Usuario> {
    return this._usuarios;
  }

  public getUsuarios(): void {
    this._usuarios = JSON.parse(localStorage.getItem("usuarios") ?? '[]');
  }

  public saveUsuario(usuarios: Array<Usuario>) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    this.getUsuarios();
  }

  public eliminarUsuario(id: number): void {
    this._usuarios = this._usuarios.filter(usuario => usuario._id !== id);
    this.saveUsuario(this._usuarios); 
  }
}