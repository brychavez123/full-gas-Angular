import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface Servicio {
  id: string;
  name: string;
  price: number;
  descripcion: string;
  imagen: string;
  altImagen: string;
  precioTexto: string;
}

@Component({
  selector: 'app-servicios',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './servicios.html',
  styleUrl: './servicios.scss',
})
export class ServiciosComponent {
  constructor(private router: Router) {}

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

  agregarAlCarrito(servicio: Servicio): void {
    const carrito = JSON.parse(localStorage.getItem('fullgas_cart') ?? '[]');
    const encontrado = carrito.find((item: { id: string; quantity: number }) => item.id === servicio.id);
    if (encontrado) {
      encontrado.quantity += 1;
    } else {
      carrito.push({ id: servicio.id, name: servicio.name, category: 'Servicio', price: servicio.price, quantity: 1 });
    }
    localStorage.setItem('fullgas_cart', JSON.stringify(carrito));
    this.notificar(`${servicio.name} agregado al carrito.`);
  }

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

  private notificar(mensaje: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<strong class="d-block mb-1 text-success">Full Gas Detail</strong><span>${mensaje}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
}
