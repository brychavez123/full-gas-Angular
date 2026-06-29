import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  imports: [RouterLink],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.scss',
})
export class RecuperarComponent {
  enviado = signal(false);

  constructor(private router: Router) {}

  enviar(evento: SubmitEvent): void {
    const form = evento.target as HTMLFormElement;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    const datos = new FormData(form);
    const recuperaciones = JSON.parse(localStorage.getItem('fullgas_recoveries') ?? '[]');
    recuperaciones.unshift({
      email: (datos.get('email') as string).trim(),
      document: (datos.get('document') as string).trim(),
      creadoEn: new Date().toISOString()
    });
    localStorage.setItem('fullgas_recoveries', JSON.stringify(recuperaciones));
    this.enviado.set(true);
    setTimeout(() => this.router.navigate(['/login']), 2500);
  }
}
