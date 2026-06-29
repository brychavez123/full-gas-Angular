import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

/** Valida que la contrasena cumpla: 8-20 chars, mayuscula, minuscula, numero y caracter especial */
function passwordSeguraValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value as string;
    if (!v) return null;
    const valida = v.length >= 8 && v.length <= 20 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
    return valida ? null : { passwordDebil: true };
  };
}

/** Valida que password y confirmPassword coincidan */
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return password === confirm ? null : { noCoincide: true };
}

/**
 * Pagina de registro de nuevos usuarios.
 * Formulario reactivo con validaciones de nombre, correo, telefono, direccion y contrasena segura.
 * Los usuarios registrados se guardan en localStorage con rol Cliente.
 */
@Component({
  selector: 'app-registro',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class RegistroComponent {
  /** Formulario reactivo con todos los campos del registro */
  form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
      lastName:  ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
      email:     ['', [Validators.required, Validators.email]],
      phone:     ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      address:   ['', [Validators.required, Validators.minLength(6)]],
      password:      ['', [Validators.required, passwordSeguraValidator()]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: passwordMatchValidator });
  }

  /** Devuelve el control del formulario por nombre */
  campo(nombre: string): AbstractControl { return this.form.get(nombre)!; }

  get passwordValue(): string { return this.campo('password').value as string; }

  /** Registra el usuario en localStorage y crea sesion */
  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, phone, address, password } = this.form.value as Record<string, string>;
    const usuario = {
      name: `${firstName} ${lastName}`.trim(),
      email: email.trim(),
      phone: `+56${phone.trim()}`,
      address: address.trim(),
      role: 'Cliente',
      password: password.trim(),
      creadoEn: new Date().toISOString()
    };

    const usuarios = JSON.parse(localStorage.getItem('fullgas_users') ?? '[]');
    usuarios.unshift(usuario);
    localStorage.setItem('fullgas_users', JSON.stringify(usuarios));

    const sesion = { name: usuario.name, email: usuario.email, phone: usuario.phone, address: usuario.address, role: 'Cliente' };
    localStorage.setItem('fullgas_session', JSON.stringify(sesion));

    this.notificar('Registro creado correctamente.');
    this.router.navigate(['/perfil']);
  }

  soloNumeros(evento: KeyboardEvent): void {
    const teclasSistema = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (!teclasSistema.includes(evento.key) && !/^[0-9]$/.test(evento.key)) evento.preventDefault();
  }

  private notificar(mensaje: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<strong class="d-block mb-1 text-success">Full Gas Detail</strong><span>${mensaje}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
}
