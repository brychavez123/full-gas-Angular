import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Sesion { name: string; email: string; phone: string; address: string; role: string; }
interface Usuario extends Sesion { password: string; }

@Component({
  selector: 'app-perfil',
  imports: [RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class PerfilComponent implements OnInit {
  sesion = signal<Sesion | null>(null);
  passwordValue = signal('');
  confirmValue = signal('');

  passwordValida = computed(() => {
    const v = this.passwordValue();
    if (!v) return true;
    return v.length >= 8 && v.length <= 20 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
  });

  clavesCoinciden = computed(() => {
    if (!this.passwordValue()) return true;
    return this.passwordValue() === this.confirmValue();
  });

  ngOnInit(): void {
    const sesion: Sesion = JSON.parse(localStorage.getItem('fullgas_session') ?? 'null') ?? { name: '', email: '', phone: '', address: '', role: 'Cliente' };
    this.sesion.set(sesion);
  }

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

    localStorage.setItem('fullgas_session', JSON.stringify(sesion));
    this.sesion.set(sesion);

    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('fullgas_users') ?? '[]');
    const idx = usuarios.findIndex(u => u.email.toLowerCase() === sesion.email.toLowerCase());
    const nuevaClave = (datos.get('password') as string).trim();
    if (idx >= 0) {
      usuarios[idx] = { ...usuarios[idx], ...sesion, ...(nuevaClave ? { password: nuevaClave } : {}) };
    }
    localStorage.setItem('fullgas_users', JSON.stringify(usuarios));

    this.notificar('Perfil actualizado correctamente.');
    form.classList.remove('was-validated');
    this.passwordValue.set('');
    this.confirmValue.set('');
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
