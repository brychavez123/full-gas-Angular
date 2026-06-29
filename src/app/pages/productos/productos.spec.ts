import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductosComponent } from './productos';

describe('ProductosComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deberia crear el componente correctamente', () => {
    const fixture = TestBed.createComponent(ProductosComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('deberia tener 8 productos en el catalogo inicial', () => {
    const fixture = TestBed.createComponent(ProductosComponent);
    const component = fixture.componentInstance;
    expect(component.productos.length).toBe(8);
  });

  it('deberia mostrar todos los productos cuando el filtro es "all"', () => {
    const fixture = TestBed.createComponent(ProductosComponent);
    const component = fixture.componentInstance;
    component.filtroActivo.set('all');
    const filtrados = component.productosFiltrados();
    expect(filtrados.length).toBe(8);
  });

  it('deberia retornar solo productos de categoria limpieza al filtrar', () => {
    const fixture = TestBed.createComponent(ProductosComponent);
    const component = fixture.componentInstance;
    component.filtroActivo.set('limpieza');
    const filtrados = component.productosFiltrados();
    expect(filtrados.length).toBeGreaterThan(0);
    expect(filtrados.every(p => p.category === 'limpieza')).toBe(true);
  });

  it('deberia retornar productos que coincidan con el texto de busqueda', () => {
    const fixture = TestBed.createComponent(ProductosComponent);
    const component = fixture.componentInstance;
    component.textoBusqueda.set('shampoo');
    const filtrados = component.productosFiltrados();
    expect(filtrados.length).toBe(1);
    expect(filtrados[0].name.toLowerCase()).toContain('shampoo');
  });

  it('deberia retornar lista vacia si la busqueda no coincide con ningun producto', () => {
    const fixture = TestBed.createComponent(ProductosComponent);
    const component = fixture.componentInstance;
    component.textoBusqueda.set('xyzproductonoexiste');
    const filtrados = component.productosFiltrados();
    expect(filtrados.length).toBe(0);
  });
});
