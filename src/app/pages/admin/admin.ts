import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyClPipe } from '../../shared/pipes/currency-cl.pipe';
import { FechaClPipe } from '../../shared/pipes/fecha-cl.pipe';
import { ToastService } from '../../services/toast.service';
import type { Observable } from 'rxjs';
import { ProductosServerService } from '../../services/productos-server.service';
import { ServiciosServerService } from '../../services/servicios-server.service';
import type { Servicio } from '../../services/servicios-local.service';

interface Producto { id: string; name: string; category: string; price: number; stock: number; active: boolean; description: string; image: string; }
interface Cliente { id: string; name: string; email: string; phone: string; address: string; vehicle: string; notes: string; status: string; }
interface Usuario { name: string; email: string; phone: string; address: string; role: string; password: string; status?: string; }
interface Pedido { id: string; type: string; customerName: string; email: string; total: number; items: unknown[]; status: string; createdAt: string; }

const PRODUCTOS_DEFAULT: Producto[] = [
  { id: 'p1', name: 'Shampoo neutro', category: 'limpieza', price: 8900, stock: 24, active: true, image: '', description: 'Limpieza segura para pintura y superficies delicadas.' },
  { id: 'p2', name: 'Desengrasante multiuso', category: 'limpieza', price: 12900, stock: 18, active: true, image: '', description: 'Ideal para llantas, motor y zonas de alta suciedad.' },
  { id: 'p3', name: 'Cera protectora', category: 'proteccion', price: 15400, stock: 12, active: true, image: '', description: 'Proteccion y brillo duradero para carroceria.' },
  { id: 'p4', name: 'Microfibra premium', category: 'accesorios', price: 4900, stock: 40, active: true, image: '', description: 'Toalla suave para secado y detallado.' },
  { id: 'p5', name: 'Limpiador interior', category: 'limpieza', price: 11900, stock: 16, active: true, image: '', description: 'Para plasticos, vinilos y tableros.' },
  { id: 'p6', name: 'Shine de neumaticos', category: 'proteccion', price: 10900, stock: 20, active: true, image: '', description: 'Acabado negro satinado y proteccion extra.' },
  { id: 'p7', name: 'Cepillo detailing', category: 'accesorios', price: 5800, stock: 30, active: true, image: '', description: 'Llega a costuras, emblemas y rincones.' },
  { id: 'p8', name: 'Aromatizante premium', category: 'accesorios', price: 6900, stock: 28, active: true, image: '', description: 'Aroma limpio para una experiencia completa.' }
];

const CLIENTES_DEFAULT: Cliente[] = [
  { id: 'c1', name: 'Bryan Andres Chavez Carreño', email: 'bryanandres9@hotmail.com', phone: '927264262', address: 'avenida llacolen 4165', vehicle: 'Sedan', notes: 'Cliente demo', status: 'Activo' },
  { id: 'c2', name: 'Cliente Demo', email: 'cliente@fullgasdetail.cl', phone: '912345678', address: 'Coronel, Concepcion', vehicle: 'SUV', notes: 'Carga inicial', status: 'Activo' }
];

/**
 * Panel administrativo con gestion de productos, clientes, usuarios y pedidos.
 * Usa formularios reactivos (FormGroup/FormBuilder) para los tres mantenedores,
 * signals para estado reactivo y paneles intercambiables via panelActivo.
 * Todo el estado se persiste en localStorage simulando un ERP basico.
 */
@Component({
  selector: 'app-admin',
  imports: [RouterLink, ReactiveFormsModule, CurrencyClPipe, FechaClPipe],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  private readonly productosServer = inject(ProductosServerService);
  private readonly serviciosServer = inject(ServiciosServerService);

  panelActivo = signal('overview');
  productos = signal<Producto[]>([]);
  clientes = signal<Cliente[]>([]);
  usuarios = signal<Usuario[]>([]);
  pedidos = signal<Pedido[]>([]);

  editandoProducto = signal<Producto | null>(null);
  editandoCliente = signal<Cliente | null>(null);
  editandoUsuario = signal<Usuario | null>(null);

  /** Productos leidos desde la API json-server */
  productosNginx = signal<Producto[]>([]);
  /** Servicios leidos desde la API json-server */
  serviciosNginx = signal<Servicio[]>([]);
  /** Errores de conexion con el servidor json-server */
  errorNginxProductos = signal(false);
  errorNginxServicios = signal(false);
  /** Ids en edicion en los mantenedores json-server (null = modo crear) */
  editandoProductoNginx = signal<string | null>(null);
  editandoServicioNginx = signal<string | null>(null);

  /** Visibilidad de los modales de crear/editar contra json-server */
  modalProductoAbierto = signal(false);
  modalServicioAbierto = signal(false);

  stats = computed(() => ({
    productos: this.productos().length,
    clientes: this.clientes().length,
    usuarios: this.usuarios().length,
    pedidos: this.pedidos().length,
    stockBajo: this.productos().filter(p => Number(p.stock ?? 0) <= 5).length
  }));

  /** Formulario reactivo para el mantenedor de productos */
  formProducto!: FormGroup;
  /** Formulario reactivo para el mantenedor de clientes */
  formCliente!: FormGroup;
  /** Formulario reactivo para el mantenedor de usuarios */
  formUsuario!: FormGroup;
  /** Formulario reactivo para el mantenedor de productos de json-server */
  formProductoNginx!: FormGroup;
  /** Formulario reactivo para el mantenedor de servicios de json-server */
  formServicioNginx!: FormGroup;

  ngOnInit(): void {
    this.formProducto = this.fb.group({
      productId: [''],
      productName: ['', [Validators.required]],
      productCategory: ['', [Validators.required]],
      productPrice: ['', [Validators.required, Validators.min(0)]],
      productStock: ['', [Validators.required, Validators.min(0)]],
      productActive: [true],
      productDescription: ['', [Validators.required]]
    });

    this.formCliente = this.fb.group({
      customerId: [''],
      customerName: ['', [Validators.required]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required]],
      customerAddress: ['', [Validators.required]],
      customerVehicle: ['', [Validators.required]],
      customerStatus: ['Activo', [Validators.required]],
      customerNotes: ['']
    });

    this.formUsuario = this.fb.group({
      userName: ['', [Validators.required]],
      userEmail: ['', [Validators.required, Validators.email]],
      userRole: ['Cliente', [Validators.required]],
      userPhone: [''],
      userStatus: ['Activo', [Validators.required]],
      userAddress: [''],
      userPassword: ['']
    });

    this.formProductoNginx = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: ['limpieza', [Validators.required]],
      price: ['', [Validators.required, Validators.min(1)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      active: [true],
      image: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.formServicioNginx = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(1)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      imagen: ['', [Validators.required]]
    });

    if (!isPlatformBrowser(this.platformId)) return;
    if (!localStorage.getItem('fullgas_products')) localStorage.setItem('fullgas_products', JSON.stringify(PRODUCTOS_DEFAULT));
    if (!localStorage.getItem('fullgas_customers')) localStorage.setItem('fullgas_customers', JSON.stringify(CLIENTES_DEFAULT));
    if (!localStorage.getItem('fullgas_users')) localStorage.setItem('fullgas_users', JSON.stringify([
      { name: 'Bryan Chavez', email: 'bryan@fullgasdetail.cl', phone: '927264262', address: 'Avenida Llacolen 4165, Coronel', role: 'Cliente', password: 'Cliente1!' },
      { name: 'Carlos Soto', email: 'tecnico@fullgasdetail.cl', phone: '923456789', address: 'Calle Los Aromos 321, Coronel', role: 'Tecnico', password: 'Tecnico1!' },
      { name: 'Admin Principal', email: 'admin@fullgasdetail.cl', phone: '934567891', address: 'Coronel, Concepcion', role: 'Administrador', password: 'Admin123!' }
    ]));
    this.cargarTodo();
    this.cargarProductosNginx();
    this.cargarServiciosNginx();
  }

  private cargarTodo(): void {
    this.productos.set(JSON.parse(localStorage.getItem('fullgas_products') ?? '[]'));
    this.clientes.set(JSON.parse(localStorage.getItem('fullgas_customers') ?? '[]'));
    this.usuarios.set(JSON.parse(localStorage.getItem('fullgas_users') ?? '[]'));
    this.pedidos.set(JSON.parse(localStorage.getItem('fullgas_orders') ?? '[]'));
  }

  /** Devuelve el control de formProducto por nombre */
  campoP(nombre: string): AbstractControl { return this.formProducto.get(nombre)!; }
  /** Devuelve el control de formCliente por nombre */
  campoC(nombre: string): AbstractControl { return this.formCliente.get(nombre)!; }
  /** Devuelve el control de formUsuario por nombre */
  campoU(nombre: string): AbstractControl { return this.formUsuario.get(nombre)!; }

  guardarProducto(): void {
    if (this.formProducto.invalid) { this.formProducto.markAllAsTouched(); return; }
    const v = this.formProducto.value as { productId: string; productName: string; productCategory: string; productPrice: string; productStock: string; productActive: boolean; productDescription: string };
    const lista = this.productos();
    const id = v.productId || `prod_${Date.now()}`;
    const producto: Producto = { id, name: v.productName, category: v.productCategory, price: Number(v.productPrice), stock: Number(v.productStock), description: v.productDescription, active: !!v.productActive, image: '' };
    const idx = lista.findIndex(p => p.id === id);
    const nueva = idx >= 0 ? lista.map((p, i) => i === idx ? producto : p) : [producto, ...lista];
    localStorage.setItem('fullgas_products', JSON.stringify(nueva));
    this.productos.set(nueva);
    this.editandoProducto.set(null);
    this.formProducto.reset({ productActive: true });
    this.toast.mostrar('Producto guardado.');
  }

  editarProducto(producto: Producto): void {
    this.editandoProducto.set(producto);
    this.formProducto.patchValue({
      productId: producto.id,
      productName: producto.name,
      productCategory: producto.category,
      productPrice: producto.price,
      productStock: producto.stock,
      productActive: producto.active,
      productDescription: producto.description
    });
    this.panelActivo.set('products');
  }

  eliminarProducto(id: string): void {
    const nueva = this.productos().filter(p => p.id !== id);
    localStorage.setItem('fullgas_products', JSON.stringify(nueva));
    this.productos.set(nueva);
    this.toast.mostrar('Producto eliminado.');
  }

  guardarCliente(): void {
    if (this.formCliente.invalid) { this.formCliente.markAllAsTouched(); return; }
    const v = this.formCliente.value as { customerId: string; customerName: string; customerEmail: string; customerPhone: string; customerAddress: string; customerVehicle: string; customerStatus: string; customerNotes: string };
    const lista = this.clientes();
    const id = v.customerId || `cust_${Date.now()}`;
    const cliente: Cliente = { id, name: v.customerName, email: v.customerEmail, phone: v.customerPhone, address: v.customerAddress, vehicle: v.customerVehicle, notes: v.customerNotes, status: v.customerStatus };
    const idx = lista.findIndex(c => c.id === id);
    const nueva = idx >= 0 ? lista.map((c, i) => i === idx ? cliente : c) : [cliente, ...lista];
    localStorage.setItem('fullgas_customers', JSON.stringify(nueva));
    this.clientes.set(nueva);
    this.editandoCliente.set(null);
    this.formCliente.reset({ customerStatus: 'Activo' });
    this.toast.mostrar('Cliente guardado.');
  }

  editarCliente(cliente: Cliente): void {
    this.editandoCliente.set(cliente);
    this.formCliente.patchValue({
      customerId: cliente.id,
      customerName: cliente.name,
      customerEmail: cliente.email,
      customerPhone: cliente.phone,
      customerAddress: cliente.address,
      customerVehicle: cliente.vehicle,
      customerStatus: cliente.status,
      customerNotes: cliente.notes
    });
    this.panelActivo.set('customers');
  }

  eliminarCliente(id: string): void {
    const nueva = this.clientes().filter(c => c.id !== id);
    localStorage.setItem('fullgas_customers', JSON.stringify(nueva));
    this.clientes.set(nueva);
    this.toast.mostrar('Cliente eliminado.');
  }

  guardarUsuario(): void {
    if (this.formUsuario.invalid) { this.formUsuario.markAllAsTouched(); return; }
    const v = this.formUsuario.value as { userName: string; userEmail: string; userRole: string; userPhone: string; userStatus: string; userAddress: string; userPassword: string };
    const lista = this.usuarios();
    const email = v.userEmail.trim();
    const actual = lista.find(u => u.email.toLowerCase() === email.toLowerCase());
    const nuevaClave = v.userPassword?.trim();
    const usuario: Usuario = { name: v.userName, email, phone: v.userPhone, address: v.userAddress, role: v.userRole, status: v.userStatus, password: nuevaClave || actual?.password || 'Cliente1!' };
    const idx = lista.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    const nueva = idx >= 0 ? lista.map((u, i) => i === idx ? { ...u, ...usuario } : u) : [usuario, ...lista];
    localStorage.setItem('fullgas_users', JSON.stringify(nueva));
    this.usuarios.set(nueva);
    this.editandoUsuario.set(null);
    this.formUsuario.reset({ userRole: 'Cliente', userStatus: 'Activo' });
    this.toast.mostrar('Usuario guardado.');
  }

  editarUsuario(usuario: Usuario): void {
    this.editandoUsuario.set(usuario);
    this.formUsuario.patchValue({
      userName: usuario.name,
      userEmail: usuario.email,
      userRole: usuario.role,
      userPhone: usuario.phone,
      userStatus: usuario.status ?? 'Activo',
      userAddress: usuario.address,
      userPassword: ''
    });
    this.panelActivo.set('users');
  }

  eliminarUsuario(email: string): void {
    const nueva = this.usuarios().filter(u => u.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem('fullgas_users', JSON.stringify(nueva));
    this.usuarios.set(nueva);
    this.toast.mostrar('Usuario eliminado.');
  }

  pedidosCliente(email: string): number {
    return this.pedidos().filter(p => (p.email ?? '').toLowerCase() === email.toLowerCase()).length;
  }

  itemsCount(items: unknown[]): number { return Array.isArray(items) ? items.length : 0; }

  // ------------------------------------------------------------------
  // Mantenedor de productos contra json-server (GET, POST, PUT, DELETE)
  // ------------------------------------------------------------------

  /** Devuelve el control de formProductoNginx por nombre */
  campoPN(nombre: string): AbstractControl { return this.formProductoNginx.get(nombre)!; }
  /** Devuelve el control de formServicioNginx por nombre */
  campoSN(nombre: string): AbstractControl { return this.formServicioNginx.get(nombre)!; }

  /** GET: carga los productos desde json-server */
  cargarProductosNginx(): void {
    this.errorNginxProductos.set(false);
    this.productosNginx.set([]);
    this.productosServer.getProductos().subscribe({
      next: (productos) => { this.productosNginx.set(productos); },
      error: () => { this.errorNginxProductos.set(true); }
    });
  }

  /** POST (crear) o PUT (actualizar) del producto del formulario en json-server */
  guardarProductoNginx(): void {
    if (this.formProductoNginx.invalid) { this.formProductoNginx.markAllAsTouched(); return; }
    const datos = this.formProductoNginx.value as Omit<Producto, 'id'>;
    const idEdicion = this.editandoProductoNginx();
    if (idEdicion) {
      const producto: Producto = { ...datos, id: idEdicion, price: Number(datos.price), stock: Number(datos.stock) };
      this.finalizarProductoNginx(this.productosServer.actualizarProducto(producto), 'Producto actualizado en el servidor JSON.');
    } else {
      const producto: Producto = { ...datos, id: `p${Date.now()}`, price: Number(datos.price), stock: Number(datos.stock) };
      this.finalizarProductoNginx(this.productosServer.crearProducto(producto), 'Producto creado en el servidor JSON.');
    }
  }

  /** Abre el modal en modo crear producto */
  abrirModalProducto(): void {
    this.cancelarProductoNginx();
    this.modalProductoAbierto.set(true);
  }

  /** Cierra el modal de producto y limpia el formulario */
  cerrarModalProducto(): void {
    this.modalProductoAbierto.set(false);
    this.cancelarProductoNginx();
  }

  /** Abre el modal con los datos de un producto de json-server para editarlo */
  editarProductoNginx(producto: Producto): void {
    this.editandoProductoNginx.set(producto.id);
    this.formProductoNginx.patchValue(producto);
    this.modalProductoAbierto.set(true);
  }

  /** DELETE: elimina un producto de json-server */
  eliminarProductoNginx(producto: Producto): void {
    this.finalizarProductoNginx(this.productosServer.eliminarProducto(producto.id), `${producto.name} eliminado del servidor JSON.`);
  }

  /** Limpia el formulario del mantenedor de productos json-server */
  cancelarProductoNginx(): void {
    this.editandoProductoNginx.set(null);
    this.formProductoNginx.reset({ category: 'limpieza', active: true });
  }

  /**
   * Ejecuta la peticion a json-server y recarga la tabla si tuvo exito
   * (json-server asigna sus propios ids al crear).
   */
  private finalizarProductoNginx(peticion: Observable<unknown>, mensaje: string): void {
    peticion.subscribe({
      next: () => {
        this.cargarProductosNginx();
        this.cerrarModalProducto();
        this.toast.mostrar(mensaje);
      },
      error: () => { this.toast.mostrar('No se pudo guardar: el servidor JSON no responde.'); }
    });
  }

  // ------------------------------------------------------------------
  // Mantenedor de servicios contra json-server (GET, POST, PUT, DELETE)
  // ------------------------------------------------------------------

  /** GET: carga los servicios desde json-server */
  cargarServiciosNginx(): void {
    this.errorNginxServicios.set(false);
    this.serviciosNginx.set([]);
    this.serviciosServer.getServicios().subscribe({
      next: (servicios) => { this.serviciosNginx.set(servicios); },
      error: () => { this.errorNginxServicios.set(true); }
    });
  }

  /** POST (crear) o PUT (actualizar) del servicio del formulario en json-server */
  guardarServicioNginx(): void {
    if (this.formServicioNginx.invalid) { this.formServicioNginx.markAllAsTouched(); return; }
    const { name, price, descripcion, imagen } = this.formServicioNginx.value as { name: string; price: number; descripcion: string; imagen: string };
    const datos = {
      name: name.trim(),
      price: Number(price),
      descripcion: descripcion.trim(),
      imagen: imagen.trim(),
      altImagen: name.trim(),
      precioTexto: `Desde $${Number(price).toLocaleString('es-CL')}`
    };
    const idEdicion = this.editandoServicioNginx();
    if (idEdicion) {
      const servicio: Servicio = { ...datos, id: idEdicion };
      this.finalizarServicioNginx(this.serviciosServer.actualizarServicio(servicio), 'Servicio actualizado en el servidor JSON.');
    } else {
      const servicio: Servicio = { ...datos, id: `s${Date.now()}` };
      this.finalizarServicioNginx(this.serviciosServer.crearServicio(servicio), 'Servicio creado en el servidor JSON.');
    }
  }

  /** Abre el modal en modo crear servicio */
  abrirModalServicio(): void {
    this.cancelarServicioNginx();
    this.modalServicioAbierto.set(true);
  }

  /** Cierra el modal de servicio y limpia el formulario */
  cerrarModalServicio(): void {
    this.modalServicioAbierto.set(false);
    this.cancelarServicioNginx();
  }

  /** Abre el modal con los datos de un servicio de json-server para editarlo */
  editarServicioNginx(servicio: Servicio): void {
    this.editandoServicioNginx.set(servicio.id);
    this.formServicioNginx.patchValue(servicio);
    this.modalServicioAbierto.set(true);
  }

  /** DELETE: elimina un servicio de json-server */
  eliminarServicioNginx(servicio: Servicio): void {
    this.finalizarServicioNginx(this.serviciosServer.eliminarServicio(servicio.id), `${servicio.name} eliminado del servidor JSON.`);
  }

  /** Limpia el formulario del mantenedor de servicios json-server */
  cancelarServicioNginx(): void {
    this.editandoServicioNginx.set(null);
    this.formServicioNginx.reset();
  }

  /**
   * Ejecuta la peticion a json-server y recarga la tabla si tuvo exito
   * (json-server asigna sus propios ids al crear).
   */
  private finalizarServicioNginx(peticion: Observable<unknown>, mensaje: string): void {
    peticion.subscribe({
      next: () => {
        this.cargarServiciosNginx();
        this.cerrarModalServicio();
        this.toast.mostrar(mensaje);
      },
      error: () => { this.toast.mostrar('No se pudo guardar: el servidor JSON no responde.'); }
    });
  }
}
