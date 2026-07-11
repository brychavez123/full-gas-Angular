import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyClPipe } from '../../shared/pipes/currency-cl.pipe';
import { FechaClPipe } from '../../shared/pipes/fecha-cl.pipe';
import { ToastService } from '../../services/toast.service';

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

  panelActivo = signal('overview');
  productos = signal<Producto[]>([]);
  clientes = signal<Cliente[]>([]);
  usuarios = signal<Usuario[]>([]);
  pedidos = signal<Pedido[]>([]);

  editandoProducto = signal<Producto | null>(null);
  editandoCliente = signal<Cliente | null>(null);
  editandoUsuario = signal<Usuario | null>(null);

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

    if (!isPlatformBrowser(this.platformId)) return;
    if (!localStorage.getItem('fullgas_products')) localStorage.setItem('fullgas_products', JSON.stringify(PRODUCTOS_DEFAULT));
    if (!localStorage.getItem('fullgas_customers')) localStorage.setItem('fullgas_customers', JSON.stringify(CLIENTES_DEFAULT));
    if (!localStorage.getItem('fullgas_users')) localStorage.setItem('fullgas_users', JSON.stringify([
      { name: 'Bryan Chavez', email: 'bryan@fullgasdetail.cl', phone: '927264262', address: 'Avenida Llacolen 4165, Coronel', role: 'Cliente', password: 'Cliente1!' },
      { name: 'Carlos Soto', email: 'tecnico@fullgasdetail.cl', phone: '923456789', address: 'Calle Los Aromos 321, Coronel', role: 'Tecnico', password: 'Tecnico1!' },
      { name: 'Admin Principal', email: 'admin@fullgasdetail.cl', phone: '934567891', address: 'Coronel, Concepcion', role: 'Administrador', password: 'Admin123!' }
    ]));
    this.cargarTodo();
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
}
