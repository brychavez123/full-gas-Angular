import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { NavbarComponent } from '../../shared/navbar/navbar';

/**
 * Modelo de datos de un servicio de detailing ofrecido por Full Gas Detail.
 */
interface Servicio {
  /** Identificador unico del servicio */
  id: string;
  /** Nombre del servicio */
  name: string;
  /** Precio base en pesos chilenos */
  price: number;
  /** Descripcion corta del servicio */
  descripcion: string;
  /** URL de la imagen representativa */
  imagen: string;
  /** Texto alternativo para la imagen */
  altImagen: string;
  /** Texto de precio formateado para mostrar en pantalla */
  precioTexto: string;
}

/**
 * Pagina de servicios de detailing.
 * Muestra el catalogo de servicios disponibles y permite agregarlos al carrito o reservar.
 */
@Component({
  selector: 'app-servicios',
  imports: [RouterLink, NavbarComponent],
  templateUrl: './servicios.html',
  styleUrl: './servicios.css',
})
export class ServiciosComponent {
  private readonly toast = inject(ToastService);

  constructor(private router: Router) {}

  /** Lista de servicios disponibles en el catalogo */
  readonly servicios: Servicio[] = [
    {
      id: 'lavado_exterior',
      name: 'Lavado exterior',
      price: 18000,
      descripcion: 'Prelavado, espuma, limpieza de llantas y secado profesional.',
      imagen: 'https://images.pexels.com/photos/6873122/pexels-photo-6873122.jpeg?cs=srgb&dl=pexels-tima-miroshnichenko-6873122.jpg&fm=jpg',
      altImagen: 'Lavado exterior profesional',
      precioTexto: 'Desde $18.000'
    },
    {
      id: 'detalle_interior',
      name: 'Detalle interior',
      price: 25000,
      descripcion: 'Aspirado, limpieza de plasticos, desinfeccion y acabados.',
      imagen: 'https://images.pexels.com/photos/31389821/pexels-photo-31389821.jpeg?cs=srgb&dl=pexels-bulat843-1243575272-31389821.jpg&fm=jpg',
      altImagen: 'Detalle interior de vehiculo',
      precioTexto: 'Desde $25.000'
    },
    {
      id: 'detailing_premium',
      name: 'Detailing premium',
      price: 32000,
      descripcion: 'Tratamiento completo para clientes que quieren acabado superior.',
      imagen: 'https://images.pexels.com/photos/6873132/pexels-photo-6873132.jpeg?cs=srgb&dl=pexels-tima-miroshnichenko-6873132.jpg&fm=jpg',
      altImagen: 'Detailing premium',
      precioTexto: 'Desde $32.000'
    },
    {
      id: 'flota_empresa',
      name: 'Flota y empresa',
      price: 38000,
      descripcion: 'Atencion programada para varios vehiculos con control de estado.',
      imagen: 'https://images.pexels.com/photos/29504459/pexels-photo-29504459.jpeg?cs=srgb&dl=pexels-bulat843-1243575272-29504459.jpg&fm=jpg',
      altImagen: 'Flota y empresa',
      precioTexto: 'Desde $38.000'
    }
  ];

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
  reservar(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    const datos = new FormData(form);
    const sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null') ?? {};
    sesion.name = datos.get('name') as string;
    sesion.address = datos.get('address') as string;
    localStorage.setItem('fullgas_session', JSON.stringify(sesion));
    this.router.navigate(['/carrito']);
  }
}
