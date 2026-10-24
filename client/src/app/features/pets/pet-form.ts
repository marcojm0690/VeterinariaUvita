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
    <h1>{{ id() ? 'Editar mascota' : 'Registrar mascota' }}</h1>

    <form [formGroup]="form" (ngSubmit)="guardar()">

      <!-- Campo para escribir el nombre de la mascota -->
      <mat-form-field>
        <mat-label>Nombre de la mascota</mat-label>
        <input matInput formControlName="name" />
        <mat-error>El nombre es obligatorio</mat-error>
      </mat-form-field>

      <!-- Campo para escribir la especie -->
      <mat-form-field>
        <mat-label>Especie</mat-label>
        <input matInput formControlName="species" />
        <mat-error>La especie es obligatoria</mat-error>
      </mat-form-field>

      <!-- Campo para escribir la raza -->
      <mat-form-field>
        <mat-label>Raza</mat-label>
        <input matInput formControlName="breed" />
      </mat-form-field>

      <!-- Campo para seleccionar la fecha de nacimiento -->
      <mat-form-field>
        <mat-label>Fecha de nacimiento</mat-label>
        <input matInput type="date" formControlName="birthDate" />
      </mat-form-field>

      <!-- Campo para escribir el peso de la mascota -->
      <mat-form-field>
        <mat-label>Peso en kilogramos</mat-label>
        <input matInput type="number" min="0.01"
               formControlName="weightKg" />
        <mat-error>El peso debe ser mayor que cero</mat-error>
      </mat-form-field>

      <!-- Campo para indicar a qué propietario pertenece -->
      <mat-form-field>
        <mat-label>ID del propietario</mat-label>
        <input matInput type="number" min="1"
               formControlName="ownerId" />
        <mat-error>Ingrese un propietario válido</mat-error>
      </mat-form-field>

      <!-- Botones para cancelar o guardar -->
      <div class="actions">
        <a mat-button routerLink="/pets">Cancelar</a>

        <button mat-flat-button type="submit" [disabled]="form.invalid">
          Guardar
        </button>
      </div>

    </form>
  `,

  // Estos estilos para el formulario de mascotas.
  styles: `
    /* Título del formulario */
    h1 {
      font-size: 26px;
      font-weight: 600;
      color: #254b70;
      margin-bottom: 18px;
    }

    /* Caja principal del formulario */
    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: 520px;
      padding: 24px;
      background-color: #ffffff;
      border: 1px solid #e0e7ef;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
    }

    /* Tamaño de la letra de los campos */
    mat-form-field {
      width: 100%;
      font-size: 16px;
    }

    /* Letra que escribe el usuario */
    input {
      font-size: 16px;
      font-weight: 400;
    }

    /* Organización de los botones */
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 12px;
    }

    /* Botón para guardar */
    button {
      background-color: #356fa3;
      color: white;
      font-size: 15px;
      font-weight: 500;
      border-radius: 8px;
      padding: 8px 24px;
    }

    /* Botón desactivado */
    button:disabled {
      background-color: #c5cbd3;
      color: #555555;
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
