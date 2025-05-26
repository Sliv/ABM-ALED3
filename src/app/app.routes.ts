import { Routes } from '@angular/router';
import { UsuarioComponent } from './Paginas/usuario/usuarios.component';
import { ListaUsuarioComponent } from './Paginas/lista-usuario/lista-usuario.component';
import { HomeComponent } from './Paginas/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'usuario', component: UsuarioComponent },
    { path: 'usuario/:idUsuario', component: UsuarioComponent },
    { path: 'listaUsuario', component: ListaUsuarioComponent }
];
