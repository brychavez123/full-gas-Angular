import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface Producto {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  active: boolean;
  image: string;
  description: string;
}

@Component({
  selector: 'app-productos',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
})
export class ProductosComponent {
  readonly productos: Producto[] = [
    { id: 'p1', name: 'Shampoo neutro', category: 'limpieza', price: 8900, stock: 24, active: true, image: 'https://images.pexels.com/photos/4870731/pexels-photo-4870731.jpeg?cs=srgb&dl=pexels-karola-g-4870731.jpg&fm=jpg', description: 'Limpieza segura para pintura y superficies delicadas.' },
    { id: 'p2', name: 'Desengrasante multiuso', category: 'limpieza', price: 12900, stock: 18, active: true, image: 'https://images.pexels.com/photos/17623850/pexels-photo-17623850.jpeg?cs=srgb&dl=pexels-malcolm-garret-3023588-17623850.jpg&fm=jpg', description: 'Ideal para llantas, motor y zonas de alta suciedad.' },
    { id: 'p3', name: 'Cera protectora', category: 'proteccion', price: 15400, stock: 12, active: true, image: 'https://images.pexels.com/photos/33707368/pexels-photo-33707368.jpeg?cs=srgb&dl=pexels-pavel-mudrevsky-3891203-33707368.jpg&fm=jpg', description: 'Proteccion y brillo duradero para carroceria.' },
    { id: 'p4', name: 'Microfibra premium', category: 'accesorios', price: 4900, stock: 40, active: true, image: 'https://images.pexels.com/photos/20042048/pexels-photo-20042048.jpeg?cs=srgb&dl=pexels-wavyvisuals-377312923-20042048.jpg&fm=jpg', description: 'Toalla suave para secado y detallado.' },
    { id: 'p5', name: 'Limpiador interior', category: 'limpieza', price: 11900, stock: 16, active: true, image: 'https://images.pexels.com/photos/31389821/pexels-photo-31389821.jpeg?cs=srgb&dl=pexels-bulat843-1243575272-31389821.jpg&fm=jpg', description: 'Para plasticos, vinilos y tableros.' },
    { id: 'p6', name: 'Shine de neumaticos', category: 'proteccion', price: 10900, stock: 20, active: true, image: 'https://images.pexels.com/photos/32667420/pexels-photo-32667420.jpeg?cs=srgb&dl=pexels-anil-chandran-876746-32667420.jpg&fm=jpg', description: 'Acabado negro satinado y proteccion extra.' },
    { id: 'p7', name: 'Cepillo detailing', category: 'accesorios', price: 5800, stock: 30, active: true, image: 'https://images.pexels.com/photos/4870702/pexels-photo-4870702.jpeg?cs=srgb&dl=pexels-karola-g-4870702.jpg&fm=jpg', description: 'Llega a costuras, emblemas y rincones.' },
    { id: 'p8', name: 'Aromatizante premium', category: 'accesorios', price: 6900, stock: 28, active: true, image: 'https://images.pexels.com/photos/17029947/pexels-photo-17029947.jpeg?cs=srgb&dl=pexels-lasanhasculture-17029947.jpg&fm=jpg', description: 'Aroma limpio para una experiencia completa.' }
  ];

  filtroActivo = signal('all');
  textoBusqueda = signal('');

  productosFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    const texto = this.textoBusqueda().toLowerCase().trim();
    return this.productos.filter(p => {
      const coincideFiltro = filtro === 'all' || p.category === filtro;
      const coincideBusqueda = !texto || p.name.toLowerCase().includes(texto) || p.description.toLowerCase().includes(texto);
      return coincideFiltro && coincideBusqueda && p.active;
    });
  });

  readonly fallbacks: Record<string, string> = {
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

  agregarAlCarrito(producto: Producto): void {
    const carrito = JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]');
    const encontrado = carrito.find((item: Producto & { quantity: number }) => item.id === producto.id);
    if (encontrado) {
      encontrado.quantity += 1;
    } else {
      carrito.push({ id: producto.id, name: producto.name, category: 'Producto', price: producto.price, quantity: 1 });
    }
    localStorage.setItem('fullgas_cart', JSON.stringify(carrito));
    this.notificar(`${producto.name} agregado al carrito.`);
  }

  private notificar(mensaje: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<strong class="d-block mb-1 text-success">Full Gas Detail</strong><span>${mensaje}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
}
