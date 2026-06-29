import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface CarritoItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutComponent implements OnInit {
  items = signal<CarritoItem[]>([]);
  pagado = signal(false);

  total = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));

  ngOnInit(): void {
    this.items.set(JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]'));
  }

  simularPago(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    if (!this.items().length) {
      this.notificar('Agrega productos o servicios antes de simular el pago.', 'danger');
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
    this.notificar('Pago simulado con exito.', 'success');
  }

  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL').format(valor);
  }

  private notificar(mensaje: string, tono = 'success'): void {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<strong class="d-block mb-1 text-${tono === 'danger' ? 'danger' : 'success'}">${tono === 'danger' ? 'Atencion' : 'Full Gas Detail'}</strong><span>${mensaje}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
}
