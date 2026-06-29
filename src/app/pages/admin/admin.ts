import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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

@Component({
  selector: 'app-admin',
  imports: [RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class AdminComponent implements OnInit {
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

  ngOnInit(): void {
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

  guardarProducto(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const datos = new FormData(form);
    const lista = this.productos();
    const id = (datos.get('productId') as string) || `prod_${Date.now()}`;
    const producto: Producto = { id, name: datos.get('productName') as string, category: datos.get('productCategory') as string, price: Number(datos.get('productPrice')), stock: Number(datos.get('productStock')), description: datos.get('productDescription') as string, active: datos.get('productActive') === 'on', image: '' };
    const idx = lista.findIndex(p => p.id === id);
    const nueva = idx >= 0 ? lista.map((p, i) => i === idx ? producto : p) : [producto, ...lista];
    localStorage.setItem('fullgas_products', JSON.stringify(nueva));
    this.productos.set(nueva);
    this.editandoProducto.set(null);
    form.reset(); form.classList.remove('was-validated');
    this.notificar('Producto guardado.');
  }

  editarProducto(producto: Producto): void { this.editandoProducto.set(producto); this.panelActivo.set('products'); }

  eliminarProducto(id: string): void {
    const nueva = this.productos().filter(p => p.id !== id);
    localStorage.setItem('fullgas_products', JSON.stringify(nueva));
    this.productos.set(nueva);
    this.notificar('Producto eliminado.');
  }

  guardarCliente(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const datos = new FormData(form);
    const lista = this.clientes();
    const id = (datos.get('customerId') as string) || `cust_${Date.now()}`;
    const cliente: Cliente = { id, name: datos.get('customerName') as string, email: datos.get('customerEmail') as string, phone: datos.get('customerPhone') as string, address: datos.get('customerAddress') as string, vehicle: datos.get('customerVehicle') as string, notes: datos.get('customerNotes') as string, status: datos.get('customerStatus') as string };
    const idx = lista.findIndex(c => c.id === id);
    const nueva = idx >= 0 ? lista.map((c, i) => i === idx ? cliente : c) : [cliente, ...lista];
    localStorage.setItem('fullgas_customers', JSON.stringify(nueva));
    this.clientes.set(nueva);
    this.editandoCliente.set(null);
    form.reset(); form.classList.remove('was-validated');
    this.notificar('Cliente guardado.');
  }

  editarCliente(cliente: Cliente): void { this.editandoCliente.set(cliente); this.panelActivo.set('customers'); }

  eliminarCliente(id: string): void {
    const nueva = this.clientes().filter(c => c.id !== id);
    localStorage.setItem('fullgas_customers', JSON.stringify(nueva));
    this.clientes.set(nueva);
    this.notificar('Cliente eliminado.');
  }

  guardarUsuario(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const datos = new FormData(form);
    const lista = this.usuarios();
    const email = (datos.get('userEmail') as string).trim();
    const actual = lista.find(u => u.email.toLowerCase() === email.toLowerCase());
    const nuevaClave = (datos.get('userPassword') as string).trim();
    const usuario: Usuario = { name: datos.get('userName') as string, email, phone: datos.get('userPhone') as string, address: datos.get('userAddress') as string, role: datos.get('userRole') as string, status: datos.get('userStatus') as string, password: nuevaClave || actual?.password || 'Cliente1!' };
    const idx = lista.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    const nueva = idx >= 0 ? lista.map((u, i) => i === idx ? { ...u, ...usuario } : u) : [usuario, ...lista];
    localStorage.setItem('fullgas_users', JSON.stringify(nueva));
    this.usuarios.set(nueva);
    this.editandoUsuario.set(null);
    form.reset(); form.classList.remove('was-validated');
    this.notificar('Usuario guardado.');
  }

  editarUsuario(usuario: Usuario): void { this.editandoUsuario.set(usuario); this.panelActivo.set('users'); }

  eliminarUsuario(email: string): void {
    const nueva = this.usuarios().filter(u => u.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem('fullgas_users', JSON.stringify(nueva));
    this.usuarios.set(nueva);
    this.notificar('Usuario eliminado.');
  }

  pedidosCliente(email: string): number {
    return this.pedidos().filter(p => (p.email ?? '').toLowerCase() === email.toLowerCase()).length;
  }

  formatearMonto(valor: number): string { return new Intl.NumberFormat('es-CL').format(Number(valor ?? 0)); }
  formatearFecha(iso: string): string { return iso ? new Date(iso).toLocaleString('es-CL') : '-'; }
  itemsCount(items: unknown[]): number { return Array.isArray(items) ? items.length : 0; }

  private notificar(mensaje: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<strong class="d-block mb-1 text-success">Full Gas Detail</strong><span>${mensaje}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
}
