import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductosComponent } from './productos';
import type { Producto } from '../../shared/producto-card/producto-card';

/** Catalogo simulado con la misma estructura que entrega la API publica */
const PRODUCTOS_MOCK: Producto[] = [
  { id: 'p1', name: 'Shampoo neutro', category: 'limpieza', price: 8900, stock: 24, active: true, image: '', description: 'Limpieza segura para pintura y superficies delicadas.' },
  { id: 'p2', name: 'Desengrasante multiuso', category: 'limpieza', price: 12900, stock: 18, active: true, image: '', description: 'Ideal para llantas, motor y zonas de alta suciedad.' },
  { id: 'p3', name: 'Cera protectora', category: 'proteccion', price: 15400, stock: 12, active: true, image: '', description: 'Proteccion y brillo duradero para carroceria.' },
  { id: 'p4', name: 'Microfibra premium', category: 'accesorios', price: 4900, stock: 40, active: true, image: '', description: 'Toalla suave para secado y detallado.' },
  { id: 'p5', name: 'Limpiador interior', category: 'limpieza', price: 11900, stock: 16, active: true, image: '', description: 'Para plasticos, vinilos y tableros.' },
  { id: 'p6', name: 'Shine de neumaticos', category: 'proteccion', price: 10900, stock: 20, active: true, image: '', description: 'Acabado negro satinado y proteccion extra.' },
  { id: 'p7', name: 'Cepillo detailing', category: 'accesorios', price: 5800, stock: 30, active: true, image: '', description: 'Llega a costuras, emblemas y rincones.' },
  { id: 'p8', name: 'Aromatizante premium', category: 'accesorios', price: 6900, stock: 28, active: true, image: '', description: 'Aroma limpio para una experiencia completa.' }
];

describe('ProductosComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProductosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  /** Crea el componente y responde la peticion HTTP del catalogo con el mock */
  function crearComponente(): ProductosComponent {
    const fixture = TestBed.createComponent(ProductosComponent);
    fixture.detectChanges();
    httpMock.expectOne('https://brychavez123.github.io/productos/productos.json').flush(PRODUCTOS_MOCK);
    return fixture.componentInstance;
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia crear el componente correctamente', () => {
    const component = crearComponente();
    expect(component).toBeTruthy();
  });

  it('deberia cargar 8 productos desde la API', () => {
    const component = crearComponente();
    expect(component.productos().length).toBe(8);
  });

  it('deberia mostrar todos los productos cuando el filtro es "all"', () => {
    const component = crearComponente();
    component.filtroActivo.set('all');
    const filtrados = component.productosFiltrados();
    expect(filtrados.length).toBe(8);
  });

  it('deberia retornar solo productos de categoria limpieza al filtrar', () => {
    const component = crearComponente();
    component.filtroActivo.set('limpieza');
    const filtrados = component.productosFiltrados();
    expect(filtrados.length).toBeGreaterThan(0);
    expect(filtrados.every(p => p.category === 'limpieza')).toBe(true);
  });

  it('deberia retornar productos que coincidan con el texto de busqueda', () => {
    const component = crearComponente();
    component.textoBusqueda.set('shampoo');
    const filtrados = component.productosFiltrados();
    expect(filtrados.length).toBe(1);
    expect(filtrados[0].name.toLowerCase()).toContain('shampoo');
  });

  it('deberia retornar lista vacia si la busqueda no coincide con ningun producto', () => {
    const component = crearComponente();
    component.textoBusqueda.set('xyzproductonoexiste');
    const filtrados = component.productosFiltrados();
    expect(filtrados.length).toBe(0);
  });

  it('deberia marcar errorProductos si la API falla', () => {
    const fixture = TestBed.createComponent(ProductosComponent);
    fixture.detectChanges();
    httpMock.expectOne('https://brychavez123.github.io/productos/productos.json')
      .flush('error', { status: 500, statusText: 'Server Error' });
    expect(fixture.componentInstance.errorProductos).toBe(true);
  });
});
