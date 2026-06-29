import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Representa un item dentro del carrito de compras */
export interface CarritoItem {
  /** Identificador unico del producto o servicio */
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
 * Servicio centralizado del carrito de compras.
 * Persiste el estado en localStorage y expone signals reactivos para el total y los items.
 */
@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly STORAGE_KEY = 'fullgas_cart';
  private readonly platformId = inject(PLATFORM_ID);

  /** Lista reactiva de items en el carrito */
  readonly items = signal<CarritoItem[]>(this.leerCarrito());

  /** Precio total calculado en tiempo real */
  readonly total = computed(() =>
    this.items().reduce((s, i) => s + i.price * i.quantity, 0)
  );

  /** Cantidad total de unidades en el carrito */
  readonly totalItems = computed(() =>
    this.items().reduce((s, i) => s + i.quantity, 0)
  );

  /**
   * Agrega un item al carrito. Si ya existe incrementa su cantidad en 1.
   * @param item Producto o servicio a agregar (sin quantity)
   */
  agregar(item: Omit<CarritoItem, 'quantity'>): void {
    this.items.update(lista => {
      const encontrado = lista.find(i => i.id === item.id);
      if (encontrado) {
        return lista.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...lista, { ...item, quantity: 1 }];
    });
    this.guardar();
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

  /** Vacia completamente el carrito */
  limpiar(): void {
    this.items.set([]);
    this.guardar();
  }

  /** Formatea un monto como moneda chilena */
  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL').format(valor);
  }

  private leerCarrito(): CarritoItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) ?? '[]');
  }

  private guardar(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items()));
  }
}
