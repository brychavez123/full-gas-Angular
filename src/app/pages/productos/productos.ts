import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductoCardComponent, type Producto } from '../../shared/producto-card/producto-card';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { ProductosLocalService } from '../../services/productos-local.service';
import { ProductosServerService } from '../../services/productos-server.service';
import type { FuenteDatos } from '../../services/fuente-datos';

/**
 * Pagina de productos de limpieza vehicular (solo vista y compra).
 * Carga el catalogo segun la fuente de la ruta (/productos/local o /productos/server),
 * permite filtrar por categoria y buscar por texto usando ngModel.
 * La administracion del catalogo (crear, editar, eliminar) se realiza
 * exclusivamente desde el panel de administracion.
 */
@Component({
  selector: 'app-productos',
  imports: [RouterLink, FormsModule, ProductoCardComponent, NavbarComponent],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class ProductosComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly productosLocal = inject(ProductosLocalService);
  private readonly productosServer = inject(ProductosServerService);
  private readonly route = inject(ActivatedRoute);

  /** Indica si la fuente activa es el servidor json-server */
  private get esServer(): boolean { return this.fuente() === 'server'; }

  /** Catalogo de productos cargado desde la fuente activa */
  readonly productos = signal<Producto[]>([]);

  /** Fuente de datos activa segun la ruta: 'local' (GitHub) o 'server' (json-server) */
  readonly fuente = signal<FuenteDatos>('local');

  /** Indica si hubo un error al cargar los productos desde la fuente */
  errorProductos = false;

  /** Indica que la peticion a la fuente esta en curso */
  cargando = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.fuente.set(params.get('fuente') === 'server' ? 'server' : 'local');
      this.cargarProductos();
    });
  }

  /** Carga el catalogo desde la fuente activa, limpiando la lista anterior */
  cargarProductos(): void {
    this.errorProductos = false;
    this.cargando = true;
    this.productos.set([]);
    const peticion = this.esServer ? this.productosServer.getProductos() : this.productosLocal.getProductos();
    peticion.subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.cargando = false;
      },
      error: () => {
        this.productos.set([]);
        this.errorProductos = true;
        this.cargando = false;
      }
    });
  }

  filtroActivo = signal('all');
  textoBusqueda = signal('');

  /** Getter/setter para enlazar ngModel con el signal de busqueda */
  get textoBusquedaModel(): string { return this.textoBusqueda(); }
  set textoBusquedaModel(v: string) { this.textoBusqueda.set(v); }

  productosFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    const texto = this.textoBusqueda().toLowerCase().trim();
    return this.productos().filter(p => {
      const coincideFiltro = filtro === 'all' || p.category === filtro;
      const coincideBusqueda = !texto || p.name.toLowerCase().includes(texto) || p.description.toLowerCase().includes(texto);
      return coincideFiltro && coincideBusqueda && p.active;
    });
  });

  agregarAlCarrito(producto: Producto): void {
    const carrito = JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]');
    const encontrado = carrito.find((item: Producto & { quantity: number }) => item.id === producto.id);
    if (encontrado) {
      encontrado.quantity += 1;
    } else {
      carrito.push({ id: producto.id, name: producto.name, category: 'Producto', price: producto.price, quantity: 1 });
    }
    localStorage.setItem('fullgas_cart', JSON.stringify(carrito));
    this.toast.mostrar(`${producto.name} agregado al carrito.`);
  }
}
