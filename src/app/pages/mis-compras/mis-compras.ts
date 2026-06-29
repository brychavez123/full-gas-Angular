import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Sesion { name: string; email: string; phone: string; address: string; role: string; }
interface Pedido { id: string; type: string; customerName: string; email: string; total: number; items: unknown[]; status: string; createdAt: string; }
interface Cliente { id: string; name: string; email: string; vehicle?: string; }

@Component({
  selector: 'app-mis-compras',
  imports: [RouterLink],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.scss',
})
export class MisComprasComponent implements OnInit {
  sesion = signal<Sesion | null>(null);
  pedidos = signal<Pedido[]>([]);
  vehiculo = signal('No registrado');

  totalGastado = computed(() => this.pedidos().reduce((s, p) => s + Number(p.total ?? 0), 0));

  ngOnInit(): void {
    const sesion: Sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null') ?? { name: 'Cliente Demo', email: 'cliente@fullgasdetail.cl', phone: '912345678', address: 'Coronel, Concepcion', role: 'Cliente' };
    this.sesion.set(sesion);

    const todosLosPedidos: Pedido[] = JSON.parse(localStorage.getItem('fullgas_orders') ?? '[]');
    this.pedidos.set(todosLosPedidos.filter(p => (p.email ?? '').toLowerCase() === sesion.email.toLowerCase()));

    const clientes: Cliente[] = JSON.parse(localStorage.getItem('fullgas_customers') ?? '[]');
    const cliente = clientes.find(c => c.email.toLowerCase() === sesion.email.toLowerCase());
    if (cliente?.vehicle) this.vehiculo.set(cliente.vehicle);
  }

  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL').format(valor);
  }

  formatearFecha(iso: string): string {
    return iso ? new Date(iso).toLocaleString('es-CL') : '-';
  }

  itemsCount(items: unknown[]): number {
    return Array.isArray(items) ? items.length : 0;
  }
}
