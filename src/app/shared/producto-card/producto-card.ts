import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CurrencyClPipe } from '../pipes/currency-cl.pipe';

/**
 * Modelo de datos de un producto del catalogo de Full Gas Detail.
 */
export interface Producto {
  /** Identificador unico del producto */
  id: string;
  /** Nombre del producto */
  name: string;
  /** Categoria del producto: limpieza, proteccion o accesorios */
  category: string;
  /** Precio en pesos chilenos */
  price: number;
  /** Cantidad disponible en inventario */
  stock: number;
  /** Indica si el producto esta visible en el catalogo */
  active: boolean;
  /** URL de la imagen del producto */
  image: string;
  /** Descripcion corta del producto */
  description: string;
}

/**
 * Tarjeta de producto reutilizable.
 * Recibe un producto via @Input y emite un evento cuando el usuario lo agrega al carrito.
 */
@Component({
  selector: 'app-producto-card',
  imports: [CurrencyClPipe],
  templateUrl: './producto-card.html',
  styleUrl: './producto-card.css',
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
}
