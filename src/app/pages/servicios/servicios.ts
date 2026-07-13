import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { ServiciosService, Servicio } from '../../services/servicios.service';

/**
 * Pagina de servicios de detailing.
 * Muestra el catalogo de servicios obtenido desde la API publica y permite agregarlos
 * al carrito o reservar mediante formulario reactivo con validaciones.
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
  private readonly serviciosService = inject(ServiciosService);

  /** Formulario reactivo de reserva de servicio */
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    date: ['', [Validators.required]],
    time: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(6)]]
  });

  /** Lista de servicios del catalogo, cargada desde la API publica */
  servicios: Servicio[] = [];

  /** Indica si hubo un error al cargar los servicios desde la API */
  errorServicios = false;

  ngOnInit(): void {
    this.serviciosService.getServicios().subscribe({
      next: (servicios) => { this.servicios = servicios; },
      error: () => { this.errorServicios = true; }
    });
  }

  /** Devuelve el control del formulario por nombre */
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
