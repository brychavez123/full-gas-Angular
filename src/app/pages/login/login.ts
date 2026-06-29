import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../services/toast.service';

interface Usuario { name: string; email: string; phone: string; address: string; role: string; password: string; }

/**
 * Pagina de inicio de sesion con formulario reactivo.
 * Valida correo y contrasena, crea sesion en localStorage y redirige segun rol.
 */
@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionService = inject(SessionService);

  /** Formulario reactivo con controles de email y password */
  form!: FormGroup;

  /** Mensaje de error mostrado al usuario tras intento fallido */
  errorMsg = signal('');

  private readonly usuariosDemo: Usuario[] = [
    { name: 'Bryan Chavez', email: 'bryan@fullgasdetail.cl', phone: '927264262', address: 'Avenida Llacolen 4165, Coronel', role: 'Cliente', password: 'Cliente1!' },
    { name: 'Carlos Soto', email: 'tecnico@fullgasdetail.cl', phone: '923456789', address: 'Calle Los Aromos 321, Coronel', role: 'Tecnico', password: 'Tecnico1!' },
    { name: 'Admin Principal', email: 'admin@fullgasdetail.cl', phone: '934567891', address: 'Coronel, Concepcion', role: 'Administrador', password: 'Admin123!' }
  ];

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });

    if (isPlatformBrowser(this.platformId)) {
      const usuarios = JSON.parse(localStorage.getItem('fullgas_users') ?? '[]');
      if (!usuarios.length) {
        localStorage.setItem('fullgas_users', JSON.stringify(this.usuariosDemo));
      }
    }
  }

  /** Devuelve el control del formulario por nombre */
  campo(nombre: string): AbstractControl { return this.form.get(nombre)!; }

  /** Procesa el inicio de sesion validando credenciales contra localStorage */
  iniciarSesion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value as { email: string; password: string };
    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('fullgas_users') ?? '[]');
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (usuario && usuario.password !== password) {
      this.errorMsg.set('La contrasena no coincide con el usuario registrado.');
      return;
    }

    this.errorMsg.set('');
    const sesion = { name: usuario?.name ?? email.split('@')[0], email, phone: usuario?.phone ?? '', address: usuario?.address ?? 'Coronel, Concepcion', role: usuario?.role ?? 'Cliente' };
    this.sessionService.set(sesion);
    this.toast.mostrar('Sesion iniciada correctamente.');

    const rol = sesion.role.toLowerCase();
    if (rol === 'administrador' || rol === 'tecnico') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/mis-compras']);
    }
  }
}
