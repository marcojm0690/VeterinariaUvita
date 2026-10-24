

import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs';

import { Owner, Pet } from '../../core/models';
import { PetService } from '../../core/services/pet.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pet-detail',
  template: `
    <h1>Consulta de información</h1>
    <p>Seleccione una mascota para consultar sus datos y los de su propietario.</p>

    <div class="consulta">
      <label for="mascota">Mascota:</label>
      <select
        id="mascota"
        #seleccion
        (change)="consultar(seleccion.value)"
      >
        <option value="">Seleccione una mascota</option>
        @for (m of mascotas(); track m.id) {
          <option [value]="m.id">{{ m.name }}</option>
        }
      </select>
    </div>

    @if (cargando()) {
      <p>Consultando información...</p>
    }

    @if (error()) {
      <p class="error">{{ error() }}</p>
    }

    @if (mascota(); as m) {
      <section class="panel">
        <h2>Datos de la mascota</h2>
        <p><strong>Nombre:</strong> {{ m.name }}</p>
        <p><strong>Especie:</strong> {{ m.species }}</p>
        <p><strong>Raza:</strong> {{ m.breed || 'No registrada' }}</p>
        <p><strong>Fecha de nacimiento:</strong>
          {{ m.birthDate || 'No registrada' }}</p>
        <p><strong>Peso:</strong>
          {{ m.weightKg == null ? 'No registrado' : m.weightKg + ' kg' }}
        </p>
      </section>
    }

    @if (propietario(); as o) {
      <section class="panel">
        <h2>Datos del propietario</h2>
        <p><strong>Nombre:</strong> {{ o.firstName }} {{ o.lastName }}</p>
        <p><strong>Correo:</strong> {{ o.email }}</p>
        <p><strong>Teléfono:</strong> {{ o.phone }}</p>
        <p><strong>Dirección:</strong>
          {{ o.address || 'No registrada' }}</p>
      </section>
    }
  `,
  styles: `
    .consulta {
      margin: 20px 0;
    }

    select {
      padding: 10px;
      margin-left: 10px;
      min-width: 220px;
    }

    .panel {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-top: 20px;
    }

    .error {
      color: #c62828;
    }
  `,
})
export class PetDetail implements OnInit {
  private readonly petService = inject(PetService);
  private readonly http = inject(HttpClient);

  protected readonly mascotas = signal<Pet[]>([]);
  protected readonly mascota = signal<Pet | null>(null);
  protected readonly propietario = signal<Owner | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.petService.getAll().subscribe({
      next: (datos) => this.mascotas.set(datos),
      error: () => this.error.set('No se pudo cargar la lista de mascotas.'),
    });
  }

  consultar(valor: string): void {
    const id = Number(valor);

    this.mascota.set(null);
    this.propietario.set(null);
    this.error.set('');

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    this.cargando.set(true);

    this.petService.getById(id).pipe(
      switchMap((mascota) =>
        this.http.get<Owner>(
          `${environment.apiUrl}/owners/${mascota.ownerId}`
        ).pipe(
          map((propietario) => ({ mascota, propietario }))
        )
      )
    ).subscribe({
      next: ({ mascota, propietario }) => {
        this.mascota.set(mascota);
        this.propietario.set(propietario);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo consultar la información solicitada.');
        this.cargando.set(false);
      },
    });
  }
}
