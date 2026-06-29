import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CarritoItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

/**
 * Pagina del carrito de compras.
 * Carga los items desde localStorage y permite actualizar cantidades o eliminar productos.
 * El total se recalcula automaticamente mediante signals computed.
 */
@Component({
  selector: 'app-carrito',
  imports: [RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class CarritoComponent implements OnInit {
  /** Lista reactiva de items en el carrito */
  items = signal<CarritoItem[]>([]);

  /** Precio total calculado en tiempo real */
  total = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));

  /** Cantidad total de unidades en el carrito */
  totalItems = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));

  ngOnInit(): void {
    this.items.set(JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]'));
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

  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL').format(valor);
  }

  private guardar(): void {
    localStorage.setItem('fullgas_cart', JSON.stringify(this.items()));
  }
}
