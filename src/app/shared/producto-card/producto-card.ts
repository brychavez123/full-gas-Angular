import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Producto {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  image: string;
  description: string;
}

/**
 * Tarjeta de producto reutilizable.
 * Recibe un producto via @Input y emite un evento cuando el usuario lo agrega al carrito.
 */
@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [],
  templateUrl: './producto-card.html',
  styleUrl: './producto-card.scss',
})
export class ProductoCardComponent {
  /** Producto a mostrar en la tarjeta */
  @Input({ required: true }) producto!: Producto;

  /** Evento emitido cuando el usuario hace clic en "Agregar" */
  @Output() agregar = new EventEmitter<Producto>();

  private readonly fallbacks: Record<string, string> = {
    limpieza: 'https://images.pexels.com/photos/29504461/pexels-photo-29504461.jpeg?cs=srgb&dl=pexels-bulat843-1243575272-29504461.jpg&fm=jpg',
    proteccion: 'https://images.pexels.com/photos/29504459/pexels-photo-29504459.jpeg?cs=srgb&dl=pexels-bulat843-1243575272-29504459.jpg&fm=jpg',
    accesorios: 'https://images.pexels.com/photos/20042048/pexels-photo-20042048.jpeg?cs=srgb&dl=pexels-wavyvisuals-377312923-20042048.jpg&fm=jpg'
  };

  imagenFallback(categoria: string): string {
    return this.fallbacks[categoria] ?? this.fallbacks['limpieza'];
  }

  formatearMonto(valor: number): string {
    return new Intl.NumberFormat('es-CL').format(valor);
  }
}
