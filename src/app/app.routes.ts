import { Routes } from '@angular/router';
import { HomeComponent } from './Paginas/home/home.component';
import { LoginComponent } from './Paginas/login/login.component';
import { SignUpComponent } from './Paginas/sign-up/sign-up.component';
import { ProductoComponent } from './Paginas/producto/producto.component';
import { ComprarProductosComponent } from './Paginas/comprar-productos/comprar-productos.component';
import { MisComprasComponent } from './Paginas/mis-compras/mis-compras.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'sign-up', component: SignUpComponent },
    { path: 'comprar-productos', component: ComprarProductosComponent },
    { path: 'mis-compras', component: MisComprasComponent },
    { path: 'producto', component: ProductoComponent },
];
