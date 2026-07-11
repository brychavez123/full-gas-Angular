import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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

/** Valida que la contrasena cumpla las reglas de seguridad (solo si hay valor) */
function passwordFuerteValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value as string;
    if (!v) return null;
    return v.length >= 8 && v.length <= 20 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)
      ? null : { passwordDebil: true };
  };
}

/** Validador a nivel de grupo: confirma que password y confirmPassword coincidan */
function clavesCoinciden(group: AbstractControl): ValidationErrors | null {
  const pw = (group.get('password')?.value ?? '') as string;
  const confirm = (group.get('confirmPassword')?.value ?? '') as string;
  if (!pw) return null;
  return pw === confirm ? null : { noCoinciden: true };
}

/**
 * Pagina de perfil del usuario autenticado.
 * Permite actualizar datos personales y cambiar contrasena con formulario reactivo.
 */
@Component({
  selector: 'app-perfil',
  imports: [RouterLink, ReactiveFormsModule, SoloNumerosDirective, NavbarComponent],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionService = inject(SessionService);
  private readonly fb = inject(FormBuilder);

  /** Datos de la sesion activa */
  sesion = signal<Sesion | null>(null);
  /** Formulario reactivo de perfil */
  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      address: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [passwordFuerteValidator()]],
      confirmPassword: ['']
    }, { validators: clavesCoinciden });

    if (isPlatformBrowser(this.platformId)) {
      const sesion: Sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null') ?? { name: '', email: '', phone: '', address: '', role: 'Cliente' };
      this.sesion.set(sesion);
      this.form.patchValue({ name: sesion.name, email: sesion.email, phone: sesion.phone, address: sesion.address });
    }
  }

  /** Devuelve el control del formulario por nombre */
  campo(nombre: string): AbstractControl { return this.form.get(nombre)!; }

  /** Valor actual del campo contrasena para el indicador de fortaleza */
  get pwValue(): string { return this.campo('password').value as string; }

  /** Guarda los datos del perfil y la nueva contrasena en localStorage */
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, phone, address, password } = this.form.value as { name: string; email: string; phone: string; address: string; password: string; };
    const sesion: Sesion = { name: name.trim(), email: email.trim(), phone: phone.trim(), address: address.trim(), role: this.sesion()?.role ?? 'Cliente' };

    this.sessionService.set(sesion);
    this.sesion.set(sesion);

    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('fullgas_users') ?? '[]');
    const idx = usuarios.findIndex(u => u.email.toLowerCase() === sesion.email.toLowerCase());
    const nuevaClave = password?.trim();
    if (idx >= 0) {
      usuarios[idx] = { ...usuarios[idx], ...sesion, ...(nuevaClave ? { password: nuevaClave } : {}) };
    }
    localStorage.setItem('fullgas_users', JSON.stringify(usuarios));

    this.toast.mostrar('Perfil actualizado correctamente.');
    this.form.patchValue({ password: '', confirmPassword: '' });
    this.campo('password').markAsUntouched();
    this.campo('confirmPassword').markAsUntouched();
  }
}
