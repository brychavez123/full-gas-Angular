import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { CurrencyClPipe } from '../../shared/pipes/currency-cl.pipe';
import { FechaClPipe } from '../../shared/pipes/fecha-cl.pipe';

/** Datos de la sesion activa del usuario */
interface Sesion {
  /** Nombre completo del usuario */
  name: string;
  /** Correo electronico del usuario */
  email: string;
  /** Numero de telefono */
  phone: string;
  /** Direccion de domicilio */
  address: string;
  /** Rol del usuario: Cliente, Tecnico o Administrador */
  role: string;
}

/** Representa una orden de compra o servicio registrada en el sistema */
interface Pedido {
  /** Identificador unico del pedido */
  id: string;
  /** Tipo de pedido: Pedido o Servicio */
  type: string;
  /** Nombre del cliente que realizo el pedido */
  customerName: string;
  /** Correo electronico del cliente */
  email: string;
  /** Monto total del pedido en pesos chilenos */
  total: number;
  /** Lista de items incluidos en el pedido */
  items: unknown[];
  /** Estado actual del pedido */
  status: string;
  /** Fecha de creacion en formato ISO 8601 */
  createdAt: string;
}

/** Datos del cliente registrado en el sistema */
interface Cliente {
  /** Identificador unico del cliente */
  id: string;
  /** Nombre completo del cliente */
  name: string;
  /** Correo electronico del cliente */
  email: string;
  /** Tipo de vehiculo del cliente */
  vehicle?: string;
}

/**
 * Pagina de historial de compras del usuario autenticado.
 * Muestra los pedidos filtrados por el email de la sesion activa y el total gastado.
 */
@Component({
  selector: 'app-mis-compras',
  imports: [RouterLink, CurrencyClPipe, FechaClPipe, NavbarComponent],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css',
})
export class MisComprasComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  /** Datos de la sesion activa del usuario */
  sesion = signal<Sesion | null>(null);
  /** Lista de pedidos del usuario autenticado */
  pedidos = signal<Pedido[]>([]);
  /** Tipo de vehiculo registrado del usuario */
  vehiculo = signal('No registrado');

  /** Suma total de todos los pedidos del usuario */
  totalGastado = computed(() => this.pedidos().reduce((s, p) => s + Number(p.total ?? 0), 0));

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const sesion: Sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null') ?? { name: 'Cliente Demo', email: 'cliente@fullgasdetail.cl', phone: '912345678', address: 'Coronel, Concepcion', role: 'Cliente' };
    this.sesion.set(sesion);

    const todosLosPedidos: Pedido[] = JSON.parse(localStorage.getItem('fullgas_orders') ?? '[]');
    this.pedidos.set(todosLosPedidos.filter(p => (p.email ?? '').toLowerCase() === sesion.email.toLowerCase()));

    const clientes: Cliente[] = JSON.parse(localStorage.getItem('fullgas_customers') ?? '[]');
    const cliente = clientes.find(c => c.email.toLowerCase() === sesion.email.toLowerCase());
    if (cliente?.vehicle) this.vehiculo.set(cliente.vehicle);
  }

  /** Retorna la cantidad de items en un pedido */
  itemsCount(items: unknown[]): number {
    return Array.isArray(items) ? items.length : 0;
  }
}
