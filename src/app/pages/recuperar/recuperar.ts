import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

/**
 * Pagina de recuperacion de contrasena.
 * Registra la solicitud de recuperacion en localStorage y redirige al login tras el envio.
 */
@Component({
  selector: 'app-recuperar',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css',
})
export class RecuperarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  /** Indica si el formulario fue enviado exitosamente */
  enviado = signal(false);
  /** Formulario reactivo de recuperacion de contrasena */
  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    document: ['', [Validators.required, Validators.minLength(5)]]
  });

  /** Devuelve el control del formulario por nombre */
  campo(nombre: string): AbstractControl { return this.form.get(nombre)!; }

  /** Procesa el formulario de recuperacion y guarda la solicitud en localStorage */
  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, document } = this.form.value as { email: string; document: string };
    const recuperaciones = JSON.parse(localStorage.getItem('fullgas_recoveries') ?? '[]');
    recuperaciones.unshift({ email: email.trim(), document: document.trim(), creadoEn: new Date().toISOString() });
    localStorage.setItem('fullgas_recoveries', JSON.stringify(recuperaciones));
    this.enviado.set(true);
    setTimeout(() => this.router.navigate(['/login']), 2500);
  }
}
