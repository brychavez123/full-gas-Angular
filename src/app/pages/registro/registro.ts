import { Component, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class RegistroComponent {
  passwordValue = signal('');
  confirmValue = signal('');

  passwordValida = computed(() => {
    const v = this.passwordValue();
    return v.length >= 8 && v.length <= 20 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
  });

  clavesCoinciden = computed(() => {
    return this.confirmValue() !== '' && this.passwordValue() === this.confirmValue();
  });

  constructor(private router: Router) {}

  soloNumeros(evento: KeyboardEvent): void {
    const teclasSistema = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
    if (!teclasSistema.includes(evento.key) && !/^[0-9]$/.test(evento.key)) {
      evento.preventDefault();
    }
  }

  registrar(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;

    const campoClave = form.querySelector<HTMLInputElement>('#registerPassword');
    const campoConfirm = form.querySelector<HTMLInputElement>('#confirmPassword');

    if (campoClave) {
      campoClave.setCustomValidity(this.passwordValida() ? '' : 'La contrasena no cumple con las reglas de seguridad.');
    }
    if (campoConfirm) {
      campoConfirm.setCustomValidity(this.clavesCoinciden() ? '' : 'No coincide con la contrasena.');
    }

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const datos = new FormData(form);
    const nombre = (datos.get('firstName') as string).trim();
    const apellido = (datos.get('lastName') as string).trim();

    const usuario = {
      name: `${nombre} ${apellido}`.trim(),
      email: (datos.get('email') as string).trim(),
      phone: '+56' + (datos.get('phone') as string).trim(),
      address: (datos.get('address') as string).trim(),
      role: 'Cliente',
      password: (datos.get('password') as string).trim(),
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

  private notificar(mensaje: string): void {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<strong class="d-block mb-1 text-success">Full Gas Detail</strong><span>${mensaje}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
  }
}
