import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CarritoItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

@Component({
  selector: 'app-carrito',
  imports: [RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class CarritoComponent implements OnInit {
  items = signal<CarritoItem[]>([]);

  total = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));
  totalItems = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));

  ngOnInit(): void {
    this.items.set(JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]'));
  }

  actualizar(id: string, delta: number): void {
    this.items.update(lista => {
      const item = lista.find(i => i.id === id);
      if (!item) return lista;
      if (item.quantity + delta <= 0) return lista.filter(i => i.id !== id);
      return lista.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i);
    });
    this.guardar();
  }

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
