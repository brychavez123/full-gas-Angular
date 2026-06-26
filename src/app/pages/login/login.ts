import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface Usuario {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent implements OnInit {
  errorMsg = signal('');

  private readonly usuariosDemo: Usuario[] = [
    { name: 'Bryan Chavez', email: 'bryan@fullgasdetail.cl', phone: '927264262', address: 'Avenida Llacolen 4165, Coronel', role: 'Cliente', password: 'Cliente1!' },
    { name: 'Carlos Soto', email: 'tecnico@fullgasdetail.cl', phone: '923456789', address: 'Calle Los Aromos 321, Coronel', role: 'Tecnico', password: 'Tecnico1!' },
    { name: 'Admin Principal', email: 'admin@fullgasdetail.cl', phone: '934567891', address: 'Coronel, Concepcion', role: 'Administrador', password: 'Admin123!' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const usuarios = JSON.parse(localStorage.getItem('fullgas_users') ?? '[]');
    if (!usuarios.length) {
      localStorage.setItem('fullgas_users', JSON.stringify(this.usuariosDemo));
    }
  }

  iniciarSesion(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const datos = new FormData(form);
    const correo = (datos.get('email') as string).trim();
    const clave = (datos.get('password') as string).trim();

    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('fullgas_users') ?? '[]');
    const usuario = usuarios.find(u => u.email.toLowerCase() === correo.toLowerCase());

    if (usuario && usuario.password !== clave) {
      this.errorMsg.set('La contrasena no coincide con el usuario registrado.');
      return;
    }

    this.errorMsg.set('');

    const sesion = {
      name: usuario?.name ?? correo.split('@')[0],
      email: correo,
      phone: usuario?.phone ?? '',
      address: usuario?.address ?? 'Coronel, Concepcion',
      role: usuario?.role ?? 'Cliente'
    };

    localStorage.setItem('fullgas_session', JSON.stringify(sesion));
    this.notificar('Sesion iniciada correctamente.');

    const rol = sesion.role.toLowerCase();
    if (rol === 'administrador' || rol === 'tecnico') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/mis-compras']);
    }
  }

  private notificar(mensaje: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<strong class="d-block mb-1 text-success">Full Gas Detail</strong><span>${mensaje}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
}
