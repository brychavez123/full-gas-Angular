import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { SessionService } from '../../services/session.service';
import { SoloNumerosDirective } from '../../shared/directives/solo-numeros.directive';
import { ToastService } from '../../services/toast.service';

/** Datos de la sesion activa del usuario autenticado */
interface Sesion {
  /** Nombre completo del usuario */
  name: string;
  /** Correo electronico del usuario */
  email: string;
  /** Numero de telefono */
  phone: string;
  /** Direccion de despacho o domicilio */
  address: string;
  /** Rol del usuario: Cliente, Tecnico o Administrador */
  role: string;
}

/** Extension de Sesion con la contrasena del usuario */
interface Usuario extends Sesion {
  /** Contrasena del usuario */
  password: string;
}

/**
 * Pagina de perfil del usuario autenticado.
 * Permite actualizar datos personales y cambiar contrasena con validaciones reactivas.
 */
@Component({
  selector: 'app-perfil',
  imports: [RouterLink, SoloNumerosDirective, NavbarComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionService = inject(SessionService);

  /** Datos de la sesion activa */
  sesion = signal<Sesion | null>(null);
  /** Valor actual del campo contrasena */
  passwordValue = signal('');
  /** Valor actual del campo confirmar contrasena */
  confirmValue = signal('');

  /** Indica si la contrasena cumple las reglas de seguridad */
  passwordValida = computed(() => {
    const v = this.passwordValue();
    if (!v) return true;
    return v.length >= 8 && v.length <= 20 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
  });

  /** Indica si la contrasena y la confirmacion son identicas */
  clavesCoinciden = computed(() => {
    if (!this.passwordValue()) return true;
    return this.passwordValue() === this.confirmValue();
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const sesion: Sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null') ?? { name: '', email: '', phone: '', address: '', role: 'Cliente' };
      this.sesion.set(sesion);
    }
  }

  /** Guarda los datos del perfil y la nueva contrasena en localStorage */
  guardar(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;

    const campoClave = form.querySelector<HTMLInputElement>('#profilePassword');
    const campoConfirm = form.querySelector<HTMLInputElement>('#profileConfirm');
    if (campoClave) campoClave.setCustomValidity(this.passwordValida() ? '' : 'La contrasena no cumple las reglas.');
    if (campoConfirm) campoConfirm.setCustomValidity(this.clavesCoinciden() ? '' : 'No coincide.');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const datos = new FormData(form);
    const sesion: Sesion = {
      name: (datos.get('name') as string).trim(),
      email: (datos.get('email') as string).trim(),
      phone: (datos.get('phone') as string).trim(),
      address: (datos.get('address') as string).trim(),
      role: this.sesion()?.role ?? 'Cliente'
    };

    this.sessionService.set(sesion);
    this.sesion.set(sesion);

    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('fullgas_users') ?? '[]');
    const idx = usuarios.findIndex(u => u.email.toLowerCase() === sesion.email.toLowerCase());
    const nuevaClave = (datos.get('password') as string).trim();
    if (idx >= 0) {
      usuarios[idx] = { ...usuarios[idx], ...sesion, ...(nuevaClave ? { password: nuevaClave } : {}) };
    }
    localStorage.setItem('fullgas_users', JSON.stringify(usuarios));

    this.toast.mostrar('Perfil actualizado correctamente.');
    form.classList.remove('was-validated');
    this.passwordValue.set('');
    this.confirmValue.set('');
  }
}
