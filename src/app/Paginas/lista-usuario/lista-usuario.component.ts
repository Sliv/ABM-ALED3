import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../Clases/Usuario';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { UsuarioService } from '../../servicios/usuario.service';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-lista-usuario',
  imports: [
    MatListModule,
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatInputModule,
    MatPaginatorModule
  ],
  templateUrl: './lista-usuario.component.html',
  styleUrls: ['./lista-usuario.component.css']
})
export class ListaUsuarioComponent implements OnInit {
  public usuarios: Array<Usuario>;
  public filtrarUsuarios: Array<Usuario>;
  public Columnas: string[] = ['id','nombre', 'apellido', 'fechaNacimiento', 'rol', 'direccion', 'email', 'telefono', 'acciones'];

  constructor(public route: Router, public usuarioService: UsuarioService) {
    this.usuarios = this.usuarioService.Usuario;
    this.filtrarUsuarios = [...this.usuarios]; 
  }

  ngOnInit(): void {}

  public BuscarUsuario(event: Event): void {
    const filtradorValor = (event.target as HTMLInputElement).value.toLowerCase();
    this.filtrarUsuarios = this.usuarios.filter(user => 
      user._nombre.toLowerCase().includes(filtradorValor) ||
      user._email.toLowerCase().includes(filtradorValor)
    );
  }

  public editar(id: number): void {
    this.route.navigateByUrl("usuario/" + id.toString());
  }

  public eliminar(id: number): void {
    this.usuarioService.eliminarUsuario(id);
    this.usuarios = this.usuarios.filter(usuario => usuario._id !== id);
    this.filtrarUsuarios = [...this.usuarios]; 
  }
}