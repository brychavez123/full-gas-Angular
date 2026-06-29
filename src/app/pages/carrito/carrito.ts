import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { CurrencyClPipe } from '../../shared/pipes/currency-cl.pipe';

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
  /** Cantidad seleccionada por el usuario */
  quantity: number;
}

/**
 * Pagina del carrito de compras.
 * Carga los items desde localStorage y permite actualizar cantidades o eliminar productos.
 * El total se recalcula automaticamente mediante signals computed.
 */
@Component({
  selector: 'app-carrito',
  imports: [RouterLink, CurrencyClPipe, NavbarComponent],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class CarritoComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  /** Lista reactiva de items en el carrito */
  items = signal<CarritoItem[]>([]);

  /** Precio total calculado en tiempo real */
  total = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));

  /** Cantidad total de unidades en el carrito */
  totalItems = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.items.set(JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]'));
    }
  }

  /**
   * Aumenta o disminuye la cantidad de un item. Si llega a 0 lo elimina.
   * @param id Identificador del item
   * @param delta Valor a sumar (+1 o -1)
   */
  actualizar(id: string, delta: number): void {
    this.items.update(lista => {
      const item = lista.find(i => i.id === id);
      if (!item) return lista;
      if (item.quantity + delta <= 0) return lista.filter(i => i.id !== id);
      return lista.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i);
    });
    this.guardar();
  }

  /**
   * Elimina un item del carrito por su id.
   * @param id Identificador del item a eliminar
   */
  eliminar(id: string): void {
    this.items.update(lista => lista.filter(i => i.id !== id));
    this.guardar();
  }

  private guardar(): void {
    localStorage.setItem('fullgas_cart', JSON.stringify(this.items()));
  }
}
