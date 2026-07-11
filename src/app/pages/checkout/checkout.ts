import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
 * Usa formulario reactivo con validaciones, simula el pago, registra el pedido
 * en localStorage y vacia el carrito.
 */
@Component({
  selector: 'app-checkout',
  imports: [RouterLink, ReactiveFormsModule, CurrencyClPipe, NavbarComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class CheckoutComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);

  /** Items del carrito a pagar */
  items = signal<CarritoItem[]>([]);
  /** Indica si el pago fue simulado exitosamente */
  pagado = signal(false);
  /** Total calculado en tiempo real a partir de los items */
  total = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));

  /** Formulario reactivo de pago */
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    method: ['', [Validators.required]],
    notes: [''],
    confirm: [false, [Validators.requiredTrue]]
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.items.set(JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]'));
      const sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null') ?? {};
      if (sesion.name) this.form.patchValue({ name: sesion.name, email: sesion.email ?? '' });
    }
  }

  /** Devuelve el control del formulario por nombre */
  campo(nombre: string): AbstractControl { return this.form.get(nombre)!; }

  /** Valida el formulario, genera el pedido en localStorage y limpia el carrito */
  simularPago(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.items().length) {
      this.toast.mostrar('Agrega productos o servicios antes de simular el pago.', 'danger');
      return;
    }

    const { name, email } = this.form.value as { name: string; email: string; phone: string; method: string; notes: string; confirm: boolean };
    const pedidos = JSON.parse(localStorage.getItem('fullgas_orders') ?? '[]');

    pedidos.unshift({
      id: `ord_${Date.now()}`,
      type: 'Pedido',
      customerName: name,
      email,
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
