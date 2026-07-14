import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { ServiciosLocalService, Servicio } from '../../services/servicios-local.service';
import { ServiciosServerService } from '../../services/servicios-server.service';
import type { FuenteDatos } from '../../services/fuente-datos';

/**
 * Pagina de servicios de detailing (solo vista y reserva).
 * Carga el catalogo segun la fuente de la ruta (/servicios/local o /servicios/server)
 * y permite agregarlos al carrito o reservar mediante formulario reactivo.
 * La administracion del catalogo (crear, editar, eliminar) se realiza
 * exclusivamente desde el panel de administracion.
 */
@Component({
  selector: 'app-servicios',
  imports: [RouterLink, ReactiveFormsModule, NavbarComponent],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class ServiciosComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly serviciosLocal = inject(ServiciosLocalService);
  private readonly serviciosServer = inject(ServiciosServerService);

  /** Indica si la fuente activa es el servidor json-server */
  private get esServer(): boolean { return this.fuente() === 'server'; }

  /** Formulario reactivo de reserva de servicio */
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(6)]]
  });

  /** Lista de servicios del catalogo, cargada desde la fuente activa */
  servicios: Servicio[] = [];

  /** Fuente de datos activa segun la ruta: 'local' (GitHub) o 'server' (json-server) */
  readonly fuente = signal<FuenteDatos>('local');

  /** Indica si hubo un error al cargar los servicios desde la fuente */
  errorServicios = false;

  /** Indica que la peticion a la fuente esta en curso */
  cargando = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.fuente.set(params.get('fuente') === 'server' ? 'server' : 'local');
      this.cargarServicios();
    });
  }

  /** Carga el catalogo desde la fuente activa, limpiando la lista anterior */
  cargarServicios(): void {
    this.errorServicios = false;
    this.cargando = true;
    this.servicios = [];
    const peticion = this.esServer ? this.serviciosServer.getServicios() : this.serviciosLocal.getServicios();
    peticion.subscribe({
      next: (servicios) => {
        this.servicios = servicios;
        this.cargando = false;
      },
      error: () => {
        this.servicios = [];
        this.errorServicios = true;
        this.cargando = false;
      }
    });
  }

  /** Devuelve el control del formulario de reserva por nombre */
  campo(nombre: string): AbstractControl { return this.form.get(nombre)!; }

  /** Agrega el servicio al carrito en localStorage e incrementa cantidad si ya existe */
  agregarAlCarrito(servicio: Servicio): void {
    const carrito = JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]');
    const encontrado = carrito.find((item: { id: string; quantity: number }) => item.id === servicio.id);
    if (encontrado) {
      encontrado.quantity += 1;
    } else {
      carrito.push({ id: servicio.id, name: servicio.name, category: 'Servicio', price: servicio.price, quantity: 1 });
    }
    localStorage.setItem('fullgas_cart', JSON.stringify(carrito));
    this.toast.mostrar(`${servicio.name} agregado al carrito.`);
  }

  /** Valida el formulario de reserva y guarda nombre y direccion en la sesion activa */
  reservar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, address } = this.form.value as { name: string; date: string; time: string; address: string };
    const sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null') ?? {};
    sesion.name = name.trim();
    sesion.address = address.trim();
    localStorage.setItem('fullgas_session', JSON.stringify(sesion));
    this.router.navigate(['/carrito']);
  }
}
