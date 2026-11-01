import { Component, inject, input, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';

import { PetService } from '../../core/services/pet.service';

// Este componente sirve para registrar y editar mascotas.
@Component({
  selector: 'app-pet-form',

  // Estas son las herramientas que necesitamos para el formulario.
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink
  ],

  // Aquí se muestra el formulario que verá el usuario.
  template: `
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
      <header class="header">
        <svg class="watermark" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true"><use href="#vet-paw" /></svg>

        <div class="badge" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 64 64" fill="currentColor"><use href="#vet-paw" /></svg>
        </div>
        <div class="titles">
          <h1>{{ id() ? 'Editar mascota' : 'Registrar mascota' }}</h1>
          <p class="subtitle">Datos de la mascota y del propietario al que pertenece</p>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="guardar()">

        <div class="group">
          <div class="section-label">La mascota</div>

          <div class="row">
            <!-- Campo para escribir el nombre de la mascota -->
            <mat-form-field appearance="outline">
              <mat-label>Nombre de la mascota</mat-label>
              <input matInput formControlName="name" />
              <mat-error>El nombre es obligatorio</mat-error>
            </mat-form-field>

            <!-- Campo para escribir la especie -->
            <mat-form-field appearance="outline">
              <mat-label>Especie</mat-label>
              <input matInput formControlName="species" />
              <mat-error>La especie es obligatoria</mat-error>
            </mat-form-field>

            <!-- Campo para escribir la raza -->
            <mat-form-field appearance="outline">
              <mat-label>Raza</mat-label>
              <input matInput formControlName="breed" />
            </mat-form-field>
          </div>
        </div>

        <div class="group">
          <div class="section-label">Detalles y propietario</div>

          <div class="row">
            <!-- Campo para seleccionar la fecha de nacimiento -->
            <mat-form-field appearance="outline">
              <mat-label>Fecha de nacimiento</mat-label>
              <input matInput type="date" formControlName="birthDate" />
            </mat-form-field>

            <!-- Campo para escribir el peso de la mascota -->
            <mat-form-field appearance="outline">
              <mat-label>Peso en kilogramos</mat-label>
              <input matInput type="number" min="0.01" formControlName="weightKg" />
              <mat-error>El peso debe ser mayor que cero</mat-error>
            </mat-form-field>

            <!-- Campo para indicar a qué propietario pertenece -->
            <mat-form-field appearance="outline">
              <mat-label>ID del propietario</mat-label>
              <input matInput type="number" min="1" formControlName="ownerId" />
              <mat-error>Ingrese un propietario válido</mat-error>
            </mat-form-field>
          </div>
        </div>

        <!-- Botones para cancelar o guardar -->
        <div class="actions">
          <a mat-button routerLink="/pets">Cancelar</a>
          <button mat-flat-button type="submit" [disabled]="form.invalid">Guardar</button>
        </div>

      </form>
    </section>
  `,

  // Estos estilos para el formulario de mascotas.
  styles: `
    :host {
      --vet-sand-light: #f8f4ea;
      --vet-sand: #ecdfc4;
      --vet-line: #d9cdb2;
      --vet-sea: #0e7490;
      --vet-sea-deep: #0b5d77;
      --vet-sea-pale: #c5e0e8;
      --vet-navy: #12384a;
      --vet-ink: #1d3b47;
      --vet-muted: #44606b;
      --vet-palm: #3f7a4a;
      --vet-layout-padding: 24px;
      --vet-header-height: 64px;

      display: block;
      margin: calc(var(--vet-layout-padding) * -1);
      height: calc(100dvh - var(--vet-header-height));
      overflow: hidden;

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
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: var(--vet-sand-light);
    }

    .card::before {
      content: '';
      position: absolute;
      inset: 10px;
      z-index: 2;
      border: 1.5px dashed var(--vet-line);
      pointer-events: none;
    }

    .header {
      position: relative;
      overflow: hidden;
      flex: none;
      display: flex;
      align-items: center;
      gap: 18px;
      padding: clamp(18px, 3.6dvh, 32px) 48px;
      background: var(--vet-sand);
      border-bottom: 3px solid var(--vet-sea);
    }

    .watermark {
      position: absolute;
      right: 40px;
      top: 50%;
      width: 120px;
      color: var(--vet-sea);
      opacity: 0.08;
      transform: translateY(-50%) rotate(16deg);
      pointer-events: none;
    }

    .badge {
      display: grid;
      place-items: center;
      flex: none;
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: var(--vet-sea-pale);
      color: var(--vet-sea-deep);
    }

    .titles {
      position: relative;
    }

    h1 {
      margin: 0;
      font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
      font-size: clamp(1.5rem, 3.4dvh, 2rem);
      font-weight: 700;
      letter-spacing: 0.2px;
      color: var(--vet-navy);
    }

    .subtitle {
      margin: 4px 0 0;
      font-size: 0.92rem;
      color: var(--vet-muted);
    }

    form {
      position: relative;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 8px;
      overflow-y: auto;
      padding: clamp(14px, 3dvh, 32px) 48px clamp(16px, 3dvh, 30px);
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: clamp(10px, 2dvh, 20px);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--vet-muted);
    }
    .section-label::before {
      content: '';
      width: 8px;
      height: 8px;
      background: var(--vet-palm);
      opacity: 0.75;
      transform: rotate(45deg);
    }
    .section-label::after {
      content: '';
      flex: 1;
      border-top: 1.5px dotted var(--vet-line);
    }

    .row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
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

    @media (max-height: 620px) {
      .subtitle {
        display: none;
      }
    }

    @media (max-width: 980px) {
      .row {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 860px) {
      :host {
        margin: 0;
        height: auto;
        overflow: visible;
      }
      .card {
        height: auto;
      }
      .header,
      form {
        padding-left: 28px;
        padding-right: 28px;
      }
      form {
        overflow: visible;
      }
      .actions {
        margin-top: 8px;
      }
    }

    @media (max-width: 560px) {
      .row {
        grid-template-columns: 1fr;
      }
      .header,
      form {
        padding-left: 22px;
        padding-right: 22px;
      }
      .watermark {
        display: none;
      }
    }
  `,
})

export class PetForm implements OnInit {

  // Usamos estas herramientas para crear el formulario, guardar las mascotas y cambiar de pantalla.
  private fb = inject(NonNullableFormBuilder);
  private servicio = inject(PetService);
  private router = inject(Router);

  // Este dato nos ayuda a saber si estamos editando una mascota.
  readonly id = input<string>();

  // Aquí creamos los campos del formulario.
  // Validators.required significa que el campo es obligatorio.
  protected form = this.fb.group({

    name: ['', [Validators.required, Validators.maxLength(100)]],
    species: ['', Validators.required],
    breed: [''],
    birthDate: [''],

    // El peso es opcional, pero si se escribe debe ser mayor que cero.
    weightKg: [null as number | null, Validators.min(0.01)],

    // La mascota debe estar relacionada con un propietario.
    ownerId: [0, [Validators.required, Validators.min(1)]]
  });

  // Este método se ejecuta cuando se abre la pantalla.
  ngOnInit(): void {

    // Revisamos si viene un ID de mascota.
    const idMascota = this.id();

    // Si hay un ID, buscamos la mascota para mostrar sus datos.
    if (idMascota) {

      this.servicio.getById(Number(idMascota)).subscribe(mascota => {

        // Colocamos los datos encontrados en el formulario.
        this.form.patchValue({
          name: mascota.name,
          species: mascota.species,
          breed: mascota.breed ?? '',
          birthDate: mascota.birthDate?.substring(0, 10) ?? '',
          weightKg: mascota.weightKg ?? null,
          ownerId: mascota.ownerId
        });

      });
    }
  }

  // Este método es para Guardar.
  protected guardar(): void {

    // Si faltan datos obligatorios, no deja guardar.
    if (this.form.invalid) {
      return;
    }

    // Obtenemos los datos que escribió el usuario.
    const datos = this.form.getRawValue();

    // Preparamos la información que enviaremos al servicio.
    const mascota = {
      name: datos.name,
      species: datos.species,
      breed: datos.breed || null,
      birthDate: datos.birthDate || null,
      weightKg: datos.weightKg,
      ownerId: datos.ownerId
    };

    // Revisamos si vamos a registrar o editar.
    const idMascota = this.id();

    if (idMascota) {

      // Si tiene ID, actualizamos la mascota.
      this.servicio.update(Number(idMascota), mascota).subscribe(() => {

        // Regresamos a la lista de mascotas.
        this.router.navigate(['/pets']);

      });

    } else {

      // Si no tiene ID, registramos una mascota nueva.
      this.servicio.create(mascota).subscribe(() => {

        // Regresamos a la lista de mascotas.
        this.router.navigate(['/pets']);

      });
    }
  }
}
