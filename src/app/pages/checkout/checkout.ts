import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { CurrencyClPipe } from '../../shared/pipes/currency-cl.pipe';
import { ToastService } from '../../services/toast.service';

/** Representa un item dentro del carrito de compras */
interface CarritoItem {
  /** Identificador unico del item */
  id: string;
  /** Nombre del producto o servicio */
  name: string;
  /** Categoria: Producto o Servicio */
  category: string;
  /** Precio unitario en pesos chilenos */
  price: number;
  /** Cantidad seleccionada */
  quantity: number;
}

/**
 * Pagina de checkout para completar la compra.
 * Simula el pago, registra el pedido en localStorage y vacia el carrito.
 */
@Component({
  selector: 'app-checkout',
  imports: [RouterLink, CurrencyClPipe, NavbarComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);

  /** Items del carrito a pagar */
  items = signal<CarritoItem[]>([]);
  /** Indica si el pago fue simulado exitosamente */
  pagado = signal(false);

  /** Total calculado en tiempo real a partir de los items */
  total = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.items.set(JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]'));
    }
  }

  /** Valida el formulario, genera el pedido en localStorage y limpia el carrito */
  simularPago(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    if (!this.items().length) {
      this.toast.mostrar('Agrega productos o servicios antes de simular el pago.', 'danger');
      return;
    }

    const datos = new FormData(form);
    const sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null') ?? {};
    const pedidos = JSON.parse(localStorage.getItem('fullgas_orders') ?? '[]');

    pedidos.unshift({
      id: `ord_${Date.now()}`,
      type: 'Pedido',
      customerName: (datos.get('name') as string) || sesion.name || 'Cliente',
      email: (datos.get('email') as string) || sesion.email || '',
      total: this.total(),
      items: this.items().map(i => ({ ...i })),
      status: 'Pagado',
      createdAt: new Date().toISOString()
    });

    localStorage.setItem('fullgas_orders', JSON.stringify(pedidos));
    localStorage.setItem('fullgas_cart', '[]');
    this.items.set([]);
    this.pagado.set(true);
    this.toast.mostrar('Pago simulado con exito.');
  }
}
