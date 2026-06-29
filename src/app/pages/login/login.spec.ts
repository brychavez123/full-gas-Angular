import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login';

describe('LoginComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deberia crear el componente correctamente', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('el formulario deberia ser invalido cuando los campos estan vacios', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component.form.invalid).toBe(true);
  });

  it('deberia marcar email como invalido con formato incorrecto', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.get('email')?.setValue('correo-invalido');
    expect(component.form.get('email')?.hasError('email')).toBe(true);
  });

  it('deberia marcar password como invalido si tiene menos de 8 caracteres', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.get('password')?.setValue('abc');
    expect(component.form.get('password')?.hasError('minlength')).toBe(true);
  });

  it('el formulario deberia ser valido con correo y contrasena correctos', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.form.setValue({ email: 'admin@fullgasdetail.cl', password: 'Admin123!' });
    expect(component.form.valid).toBe(true);
  });

  it('deberia mostrar error si la contrasena no coincide con el usuario', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    localStorage.setItem('fullgas_users', JSON.stringify([
      { name: 'Test', email: 'test@test.cl', phone: '', address: '', role: 'Cliente', password: 'ClaveCorrecta1!' }
    ]));

    component.form.setValue({ email: 'test@test.cl', password: 'ClaveIncorrecta1!' });
    component.iniciarSesion();
    expect(component.errorMsg()).toBeTruthy();
  });
});
