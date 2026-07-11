import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SoloNumerosDirective } from '../../shared/directives/solo-numeros.directive';
import { ToastService } from '../../services/toast.service';
import { SessionService } from '../../services/session.service';
import { RegionesService, Region } from '../../services/regiones.service';

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
  imports: [RouterLink, ReactiveFormsModule, SoloNumerosDirective],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly sessionService = inject(SessionService);
  private readonly regionesService = inject(RegionesService);

  /** Formulario reactivo con todos los campos del registro */
  form: FormGroup;

  /** Regiones de Chile obtenidas desde la API */
  regiones: Region[] = [];

  /** Comunas de la region seleccionada */
  comunas: string[] = [];

  /** Indica si hubo un error al cargar las regiones desde la API */
  errorRegiones = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
      lastName:  ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/)]],
      email:     ['', [Validators.required, Validators.email]],
      phone:     ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      region:    ['', [Validators.required]],
      comuna:    [{ value: '', disabled: true }, [Validators.required]],
      address:   ['', [Validators.required, Validators.minLength(6)]],
      password:      ['', [Validators.required, passwordSeguraValidator()]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: passwordMatchValidator });
  }

  ngOnInit(): void {
    this.regionesService.getRegiones().subscribe({
      next: (regiones) => { this.regiones = regiones; },
      error: () => { this.errorRegiones = true; }
    });

    this.campo('region').valueChanges.subscribe((nombreRegion: string) => {
      const region = this.regiones.find(r => r.nombre === nombreRegion);
      this.comunas = region?.comunas ?? [];
      const comunaCtrl = this.campo('comuna');
      comunaCtrl.setValue('');
      if (region) comunaCtrl.enable(); else comunaCtrl.disable();
    });
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

    const { firstName, lastName, email, phone, region, comuna, address, password } = this.form.value as Record<string, string>;
    const usuario = {
      name: `${firstName} ${lastName}`.trim(),
      email: email.trim(),
      phone: `+56${phone.trim()}`,
      region,
      comuna,
      address: address.trim(),
      role: 'Cliente',
      password: password.trim(),
      creadoEn: new Date().toISOString()
    };

    const usuarios = JSON.parse(localStorage.getItem('fullgas_users') ?? '[]');
    usuarios.unshift(usuario);
    localStorage.setItem('fullgas_users', JSON.stringify(usuarios));

    const sesion = { name: usuario.name, email: usuario.email, phone: usuario.phone, address: usuario.address, role: 'Cliente' };
    this.sessionService.set(sesion);

    this.toast.mostrar('Registro creado correctamente.');
    this.router.navigate(['/perfil']);
  }
}
