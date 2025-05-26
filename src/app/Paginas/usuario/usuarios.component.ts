import { Component } from '@angular/core';
import { Usuario } from '../../Clases/Usuario';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent {
  public miUsuario: Usuario = new Usuario();
  public rolesDisponibles: string[] = ['Administrador', 'Programador', 'Administrativo', 'Editor', 'Cliente', 'Invitado'];

  constructor(
    public activeRoute: ActivatedRoute,
    public usuarioService: UsuarioService
  ) {
    this.activeRoute.paramMap.subscribe(param => {
      const idParametro = param.get("idUsuario") ?? "";
      if (idParametro === "") {
        this.miUsuario = new Usuario();
      } else {
        const usuarioExistente = this.usuarioService.Usuario.find(
          u => u._id.toString() === idParametro
        );
        if (usuarioExistente) {
          this.miUsuario = new Usuario();
          this.miUsuario._id = usuarioExistente._id;
          this.miUsuario._nombre = usuarioExistente._nombre;
          this.miUsuario._apellido = usuarioExistente._apellido;
          this.miUsuario._email = usuarioExistente._email;
          this.miUsuario._password = usuarioExistente._password;
          this.miUsuario._rol = usuarioExistente._rol;
          this.miUsuario._fechaNacimiento = new Date(usuarioExistente._fechaNacimiento);
          this.miUsuario._telefono = usuarioExistente._telefono;
          this.miUsuario._direccion = usuarioExistente._direccion;
        } else {
          this.miUsuario = new Usuario();
        }
      }
    });
  }

  public Guardar() {
    const usuarios = this.usuarioService.Usuario;
    const esNuevo = !this.miUsuario._id;

    if (!this.miUsuario._nombre || this.miUsuario._nombre.trim().length < 3) {
      alert("Nombre inválido.");
      return;
    }

    if (!this.miUsuario._apellido || this.miUsuario._apellido.trim().length < 3) {
      alert("Apellido inválido.");
      return;
    }

    if (!this.miUsuario._email || !this.miUsuario._email.includes("@")) {
      alert("Email inválido.");
      return;
    }

    const emailExiste = usuarios.some(
      u => u._email === this.miUsuario._email && u._id !== this.miUsuario._id
    );
    if (emailExiste) {
      alert("Ya existe un usuario con ese email.");
      return;
    }

    if (!this.miUsuario._password || this.miUsuario._password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!/^\d{10}$/.test(this.miUsuario._telefono)) {
      alert("El teléfono debe tener 10 dígitos numéricos.");
      return;
    }

    const telefonoExiste = usuarios.some(
      u => u._telefono === this.miUsuario._telefono && u._id !== this.miUsuario._id
    );
    if (telefonoExiste) {
      alert("Ya existe un usuario con ese número de teléfono.");
      return;
    }

    if (!this.rolesDisponibles.includes(this.miUsuario._rol)) {
      alert("Rol inválido. Seleccione un rol permitido.");
      return;
    }

    const fecha = new Date(this.miUsuario._fechaNacimiento);
    const hoy = new Date();
    if (isNaN(fecha.getTime()) || fecha > hoy || fecha.getFullYear() < 1900) {
      alert("Fecha de nacimiento inválida.");
      return;
    }

    if (!this.miUsuario._direccion || this.miUsuario._direccion.trim().length < 5) {
      alert("La dirección debe tener al menos 5 caracteres.");
      return;
    }

    if (esNuevo) {
      this.miUsuario.id = usuarios.length + 1;
      usuarios.push(this.miUsuario);
    } else {
      const idx = usuarios.findIndex(u => u._id === this.miUsuario._id);
      if (idx > -1) {
        usuarios[idx] = this.miUsuario;
      }
    }

    this.usuarioService.saveUsuario(usuarios);
      alert("Usuario guardado con éxito.");
    }

    public Limpiar() {
      this.miUsuario = new Usuario();
    }
}