import { Component, inject, input, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { OwnerService } from '../../core/services/owner.service';

@Component({
  selector: 'app-owner-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink],
  template: `
    <!-- Huella reutilizable -->
    <svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
      <symbol id="vet-paw" viewBox="0 0 64 64">
        <ellipse cx="32" cy="43" rx="15" ry="12" />
        <ellipse cx="13" cy="29" rx="6" ry="8" transform="rotate(-20 13 29)" />
        <ellipse cx="25" cy="17" rx="6" ry="8.5" transform="rotate(-6 25 17)" />
        <ellipse cx="39" cy="17" rx="6" ry="8.5" transform="rotate(6 39 17)" />
        <ellipse cx="51" cy="29" rx="6" ry="8" transform="rotate(20 51 29)" />
      </symbol>
    </svg>

    <section class="card">
      <aside class="side" aria-hidden="true">
        <svg class="deco deco-1" viewBox="0 0 64 64" fill="currentColor"><use href="#vet-paw" /></svg>
        <svg class="deco deco-2" viewBox="0 0 64 64" fill="currentColor"><use href="#vet-paw" /></svg>
        <svg class="deco deco-3" viewBox="0 0 64 64" fill="currentColor"><use href="#vet-paw" /></svg>

        <div class="side-icon">
          <img src="/decorative-form-uvita.png" alt="Perro, gato y pato de Veterinaria Uvita" />
        </div>
        <p class="side-title">Cada mascota empieza con alguien que la cuida</p>
        <p class="side-text">Registra aquÃ­ sus datos de contacto para avisarle de citas, vacunas y controles.</p>

        <!-- Olas y orilla de arena -->
        <svg class="waves" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path
            d="M0 38 C 60 8, 130 8, 200 38 S 340 68, 400 36 L400 100 L0 100 Z"
            fill="rgba(255,255,255,0.22)"
          />
          <path
            d="M0 62 C 70 36, 140 36, 210 62 S 340 86, 400 58 L400 100 L0 100 Z"
            fill="#ecdfc4"
          />
        </svg>
      </aside>

      <div class="content">
        <header class="header">
          <div class="badge" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="currentColor"><use href="#vet-paw" /></svg>
          </div>
          <div>
            <h1>{{ id() ? 'Editar dueÃ±o' : 'Nuevo dueÃ±o' }}</h1>
            <p class="subtitle">Datos de contacto de la persona responsable de la mascota</p>
          </div>
        </header>

        <div class="divider" aria-hidden="true"><span></span></div>

        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="firstName" />

              @if (form.controls.firstName.hasError('required')) {
                <mat-error>El nombre es obligatorio</mat-error>
              } @else if (form.controls.firstName.hasError('pattern')) {
                <mat-error>El nombre no debe contener nÃºmeros</mat-error>
              } @else if (form.controls.firstName.hasError('maxlength')) {
                <mat-error>El nombre no puede superar los 50 caracteres</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Apellidos</mat-label>
              <input matInput formControlName="lastName" />

              @if (form.controls.lastName.hasError('required')) {
                <mat-error>Los apellidos son obligatorios</mat-error>
              } @else if (form.controls.lastName.hasError('pattern')) {
                <mat-error>Los apellidos no deben contener nÃºmeros</mat-error>
              } @else if (form.controls.lastName.hasError('maxlength')) {
                <mat-error>Los apellidos no pueden superar los 80 caracteres</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Correo</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="nombre@correo.com"
                (input)="emailError = ''"
              />

              @if (form.controls.email.hasError('required')) {
                <mat-error>El correo es obligatorio</mat-error>
              } @else if (form.controls.email.hasError('email')) {
                <mat-error>Ingrese un correo vÃ¡lido</mat-error>
              } @else if (emailError) {
                <mat-error>{{ emailError }}</mat-error>
              }
            </mat-form-field>



        <mat-form-field appearance="outline">
          <mat-label>TelÃ©fono</mat-label>
          <input
            matInput
            formControlName="phone"
            placeholder="8888-8888"
            maxlength="15"
            (focus)="onPhoneFocus()"
            (input)="formatPhone()"
          />

          @if (form.controls.phone.hasError('required')) {
            <mat-error>El telÃ©fono es obligatorio</mat-error>
          } @else if (form.controls.phone.hasError('pattern')) {
            <mat-error>Ingrese un telÃ©fono vÃ¡lido: +506 XXXX-XXXX</mat-error>
          }
        </mat-form-field>


          </div>

          <mat-form-field appearance="outline">
            <mat-label>DirecciÃ³n</mat-label>
            <input matInput formControlName="address" />
          </mat-form-field>

          <div class="actions">
            <a mat-button routerLink="/owners">Cancelar</a>
            <button mat-flat-button type="submit" [disabled]="form.invalid">Guardar</button>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: `
    :host {
      /* Paleta Uvita: cambia estos valores para ajustar todo el look */
      --vet-sand-light: #f8f4ea; /* arena clara (fondo) */
      --vet-sand: #ecdfc4; /* arena de playa */
      --vet-line: #d9cdb2; /* lÃ­neas y costuras */
      --vet-sea-light: #1a8aa8; /* mar, parte clara */
      --vet-sea: #0e7490; /* turquesa principal */
      --vet-sea-deep: #0b5d77; /* mar profundo */
      --vet-navy: #12384a; /* tÃ­tulos */
      --vet-ink: #1d3b47; /* texto */
      --vet-muted: #44606b; /* texto secundario */
      --vet-palm: #3f7a4a; /* verde palma (detalles) */

      /* Medidas del layout de la app (segÃºn tu captura):
         - padding del Ã¡rea de contenido: 24px
         - alto del encabezado superior: 64px
         El componente cancela ese padding con margen negativo para llegar a los bordes.
         Si queda una franja blanca, ajusta estos dos valores. */
      --vet-layout-padding: 24px;
      --vet-header-height: 64px;

      display: block;
      margin: calc(var(--vet-layout-padding) * -1);
      height: calc(100dvh - var(--vet-header-height));
      overflow: hidden;

      /* Tokens de Angular Material (tema M3): esquinas casi rectas */
      --mat-sys-primary: var(--vet-sea);
      --mat-sys-on-primary: #ffffff;
      --mat-sys-on-surface: var(--vet-ink);
      --mat-sys-on-surface-variant: var(--vet-muted);
      --mat-sys-outline: #7fa3aa;
      --mat-sys-outline-variant: var(--vet-line);
      --mat-sys-error: #b4442d;
      --mat-sys-corner-extra-small: 4px;
      --mat-sys-corner-full: 6px;
    }

    .card {
      position: relative;
      display: grid;
      grid-template-columns: minmax(240px, 34%) 1fr;
      grid-template-rows: minmax(0, 1fr);
      height: 100%;
      overflow: hidden;
      background: var(--vet-sand-light);
    }


    /* Costura punteada interior (recta), detalle rÃºstico */
    .card::before {
      content: '';
      position: absolute;
      inset: 10px;
      z-index: 2;
      border: 1.5px dashed var(--vet-line);
      pointer-events: none;
    }

    /* ---------- Panel lateral: mar y playa ---------- */
    .side {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: clamp(8px, 1.6dvh, 14px);
      padding: clamp(20px, 5dvh, 48px) 28px calc(clamp(20px, 5dvh, 48px) + 64px);
      text-align: center;
      color: #ffffff;
      background: linear-gradient(170deg, var(--vet-sea-light) 0%, var(--vet-sea) 55%, var(--vet-sea-deep) 100%);
    }

    .side > :not(.deco):not(.waves) {
      position: relative;
      z-index: 1;
    }

    .side-icon {
      display: grid;
      place-items: center;
      flex: none;
      width: clamp(120px, 24dvh, 190px);
      height: clamp(120px, 24dvh, 190px);
      background: transparent;
      border: none;
      border-radius: 0;
      box-shadow: none;
    }

    .side-icon img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .side-title {
      margin: 8px 0 0;
      font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
      font-size: clamp(1.1rem, 2.8dvh, 1.5rem);
      font-weight: 600;
      line-height: 1.25;
    }

    .side-text {
      margin: 0;
      max-width: 250px;
      font-size: 0.88rem;
      line-height: 1.5;
      color: rgba(255, 255, 255, 0.92);
    }

    .waves {
      position: absolute;
      left: 0;
      bottom: 0;
      z-index: 0;
      width: 100%;
      height: 84px;
      pointer-events: none;
    }

    .deco {
      position: absolute;
      z-index: 0;
      color: #ffffff;
      opacity: 0.14;
      pointer-events: none;
    }
    .deco-1 {
      top: 30px;
      left: 30px;
      width: 52px;
      transform: rotate(-18deg);
    }
    .deco-2 {
      top: 46px;
      right: 30px;
      width: 40px;
      transform: rotate(14deg);
    }
    .deco-3 {
      bottom: 120px;
      left: 26px;
      width: 46px;
      transform: rotate(-10deg);
    }

    /* ---------- Contenido ---------- */
    .content {
      position: relative;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow-y: auto;
      padding: 28px 40px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* La huellita del encabezado solo se ve cuando el panel lateral estÃ¡ oculto */
    .badge {
      display: none;
      flex: none;
      place-items: center;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: var(--vet-sand);
      color: var(--vet-sea);
      box-shadow: inset 0 0 0 1px var(--vet-line);
    }

    h1 {
      margin: 0;
      font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
      font-size: clamp(1.4rem, 3.4dvh, 1.9rem);
      font-weight: 600;
      letter-spacing: 0.2px;
      color: var(--vet-navy);
    }

    .subtitle {
      margin: 4px 0 0;
      font-size: 0.9rem;
      color: var(--vet-muted);
    }

    /* LÃ­nea con un detalle verde palma al centro */
    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: clamp(12px, 2.5dvh, 28px) 0;
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-top: 1.5px dotted var(--vet-line);
    }
    .divider span {
      width: 8px;
      height: 8px;
      background: var(--vet-palm);
      opacity: 0.75;
      transform: rotate(45deg);
    }

    /* El formulario se reparte en todo el alto: sin huecos grandes */
    form {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 20px;
    }

    mat-form-field {
      width: 100%;
    }

    .actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .actions a {
      color: var(--vet-muted);
    }

    /* ---------- Ventanas muy bajas ---------- */
    @media (max-height: 520px) {
      .side-text,
      .subtitle {
        display: none;
      }
    }

    /* ---------- Pantallas angostas (celular): aquÃ­ sÃ­ puede haber scroll ---------- */
    @media (max-width: 860px) {
      :host {
        margin: 0;
        height: auto;
        overflow: visible;
      }
      .card {
        grid-template-columns: 1fr;
        height: auto;
      }
      .side {
        display: none;
      }
      .badge {
        display: grid;
      }
      .content {
        overflow: visible;
        padding: 32px 28px 26px;
      }
      form {
        justify-content: flex-start;
      }
      .actions {
        margin-top: 8px;
      }
    }

    @media (max-width: 560px) {
      .row {
        grid-template-columns: 1fr;
      }
      .content {
        padding: 26px 22px 22px;
      }
    }
  `,
})
export class OwnerForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(OwnerService);
  private readonly router = inject(Router);
  protected emailError = '';

  /** Bound from the `:id` route param (withComponentInputBinding). */
  readonly id = input<string>();

  protected readonly form = this.fb.group({
    firstName: ['', [
      Validators.required,
      Validators.pattern(/^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u),
      Validators.maxLength(50)
    ]],

    lastName: ['', [
      Validators.required,
      Validators.pattern(/^[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*$/u),
      Validators.maxLength(80)
    ]],

    email: ['', [
      Validators.required,
      Validators.email,
      Validators.maxLength(254)
    ]],


    phone: ['', [
      Validators.required,
      Validators.pattern(/^\+506 \d{4}-\d{4}$/)
    ]],


    address: ['', Validators.maxLength(250)],
  });

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.service.getById(Number(id)).subscribe((owner) => this.form.patchValue({ ...owner, address: owner.address ?? '' }));
    }
  }


  protected formatPhone(): void {
    const control = this.form.controls.phone;
    const value = control.value ?? '';

    let digits = value.replace(/\D/g, '');

    if (digits.startsWith('506')) {
      digits = digits.slice(3);
    }

    digits = digits.slice(0, 8);

    const localNumber = digits.length > 4
      ? `${digits.slice(0, 4)}-${digits.slice(4)}`
      : digits;

    const formatted = localNumber
      ? `+506 ${localNumber}`
      : '+506 ';

    if (control.value !== formatted) {
      control.setValue(formatted, { emitEvent: false });
    }
  }

  protected onPhoneFocus(): void {
    const control = this.form.controls.phone;

    if (!control.value) {
      control.setValue('+506 ', { emitEvent: false });
    }
  }


  protected save(): void {
    if (this.form.invalid) return;

    this.emailError = '';

    const id = this.id();
    const request = this.form.getRawValue();

    const result$: Observable<unknown> = id
      ? this.service.update(Number(id), request)
      : this.service.create(request);

    result$.subscribe({
      next: () => this.router.navigate(['/owners']),
      error: (error: HttpErrorResponse) => {
        const message = JSON.stringify(error.error ?? '');

        if (
          error.status === 409 ||
          message.toLowerCase().includes('owners.email') ||
          message.toLowerCase().includes('unique constraint failed')
        ) {
          this.emailError = 'Este correo ya estÃ¡ registrado. Usa otro correo.';
          this.form.controls.email.setErrors({
            ...this.form.controls.email.errors,
            duplicate: true,
          });
        } else {
          console.error('Error al guardar el dueÃ±o:', error);
        }
      },
    });
  }

}
