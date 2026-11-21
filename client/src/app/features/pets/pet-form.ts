import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';

import { Owner } from '../../core/models';
import { OwnerService } from '../../core/services/owner.service';
import { PetService } from '../../core/services/pet.service';

// Quita tildes y mayúsculas para que al buscar "jose" también aparezca "José".
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Este componente sirve para registrar y editar mascotas.
@Component({
  selector: 'app-pet-form',

  // Estas son las herramientas que necesitamos para el formulario.
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
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

            <!-- Propietario: lista desplegable + burbujas con sus datos de contacto -->
            <div class="owner-field">
              <mat-form-field appearance="outline">
                <mat-label>Propietario</mat-label>
                <input
                  matInput
                  type="text"
                  autocomplete="off"
                  placeholder="Escribe para buscar"
                  [formControl]="busqueda"
                  [matAutocomplete]="auto" />
                <mat-autocomplete
                  #auto="matAutocomplete"
                  class="vet-select-panel"
                  [displayWith]="mostrarNombre"
                  (optionSelected)="elegirPropietario($event.option.value)">
                  @for (dueno of filtrados(); track dueno.id) {
                    <!-- En computadora, al pasar el mouse también se ve el tooltip -->
                    <mat-option
                      [value]="dueno"
                      [matTooltip]="'✉ ' + dueno.email + '\\n☎ ' + (dueno.phone || 'Sin teléfono')"
                      matTooltipPosition="left"
                      matTooltipClass="owner-tip"
                      [matTooltipShowDelay]="150">
                      {{ dueno.firstName }} {{ dueno.lastName }}
                    </mat-option>
                  }
                </mat-autocomplete>
                <mat-error>Elija un propietario de la lista</mat-error>

                @if (duenosCargados() && duenos().length === 0) {
                  <mat-hint>No hay propietarios registrados todavía</mat-hint>
                }
              </mat-form-field>

              <!-- Estas burbujas aparecen cuando hay un propietario seleccionado -->
              @if (propietario(); as p) {
                <div class="owner-chips">
                  <span class="owner-chip">
                    <mat-icon aria-hidden="true">call</mat-icon>
                    {{ p.phone || 'Sin teléfono' }}
                  </span>
                  <span class="owner-chip owner-chip-email" [attr.title]="p.email">
                    <mat-icon aria-hidden="true">mail</mat-icon>
                    <span class="owner-chip-text">{{ p.email || 'Sin correo' }}</span>
                  </span>
                </div>
              }
            </div>
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

    ::ng-deep .vet-select-panel {
      --mat-sys-primary: #0e7490;
      --mat-sys-on-surface: #1d3b47;
      --mat-sys-on-surface-variant: #44606b;
      --mat-sys-surface-container: #fcfaf4;
      --mat-sys-secondary-container: #d3ebef;
      --mat-sys-on-secondary-container: #12384a;
      --mat-sys-corner-extra-small: 4px;
    }

    /* Tarjeta con correo y teléfono del propietario (tooltip de cada opción) */
    ::ng-deep .owner-tip .mdc-tooltip__surface {
      white-space: pre-line;
      max-width: 320px;
      padding: 10px 14px;
      font-size: 0.9rem;
      line-height: 1.6;
      color: #ffffff;
      background: #12384a;
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
      align-items: start;
    }

    mat-form-field {
      width: 100%;
    }

    /* Burbujas con teléfono y correo del propietario seleccionado */
    .owner-field {
      min-width: 0;
    }

    .owner-chips {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: -6px;
    }

    .owner-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      max-width: 100%;
      box-sizing: border-box;
      padding: 2px 10px 2px 6px;
      font-size: 0.75rem;
      line-height: 1.3;
      font-weight: 600;
      white-space: nowrap;
      color: var(--vet-sea-ink, #0b4f63);
      background: #eedcbe;
      border: 1px solid #dcc8a3;
      border-radius: 999px;
    }
    .owner-chip mat-icon {
      flex: none;
      width: 14px;
      height: 14px;
      font-size: 14px;
    }
    .owner-chip-email {
      min-width: 0;
    }
    .owner-chip-text {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
  private servicioDuenos = inject(OwnerService);
  private router = inject(Router);

  // Este dato nos ayuda a saber si estamos editando una mascota.
  readonly id = input<string>();

  // Aquí guardamos la lista de propietarios que se muestra en el campo desplegable.
  protected readonly duenos = signal<Owner[]>([]);

  // Nos avisa cuando ya terminó de cargar la lista de propietarios.
  protected readonly duenosCargados = signal(false);

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
    // Aunque la persona elige un nombre, aquí se guarda el ID de ese propietario.
    ownerId: [0, [Validators.required, Validators.min(1)]]
  });

  // El ID del propietario elegido, como señal, para que la pantalla se actualice al cambiarlo.
  private readonly ownerIdSeleccionado = toSignal(this.form.controls.ownerId.valueChanges, {
    initialValue: this.form.controls.ownerId.value
  });

  // El propietario completo (con correo y teléfono) que corresponde al ID elegido.
  protected readonly propietario = computed(() =>
    this.duenos().find(d => d.id === this.ownerIdSeleccionado()) ?? null
  );

  // Texto que la persona escribe para buscar al propietario.
  // Cuando elige uno de la lista, aquí queda guardado el propietario completo.
  protected readonly busqueda = new FormControl<string | Owner>('', {
    nonNullable: true,
    validators: [
      Validators.required,
      // Escribir no basta: hay que elegir a alguien de la lista.
      (c) => (typeof c.value === 'object' && c.value !== null ? null : { noElegido: true })
    ]
  });

  private readonly busquedaValor = toSignal(this.busqueda.valueChanges, {
    initialValue: this.busqueda.value
  });

  // Propietarios que coinciden con lo escrito (por nombre, correo o teléfono).
  protected readonly filtrados = computed(() => {
    const valor = this.busquedaValor();
    const terminos = normalize(typeof valor === 'string' ? valor : '').split(' ').filter(Boolean);
    if (terminos.length === 0) return this.duenos();

    return this.duenos().filter(d => {
      const texto = normalize(`${d.firstName} ${d.lastName} ${d.email ?? ''} ${d.phone ?? ''}`);
      return terminos.every(t => texto.includes(t));
    });
  });

  // Cómo se muestra en el campo el propietario elegido.
  protected readonly mostrarNombre = (o: string | Owner | null): string =>
    !o ? '' : typeof o === 'string' ? o : `${o.firstName} ${o.lastName}`;

  constructor() {
    // Si la persona vuelve a escribir, se borra el propietario elegido hasta que elija otro.
    this.busqueda.valueChanges.pipe(takeUntilDestroyed()).subscribe(valor => {
      if (typeof valor === 'string') {
        this.form.controls.ownerId.setValue(0);
      }
    });

    // Al editar una mascota (o cuando llega la lista), el campo muestra el nombre de su dueño.
    effect(() => {
      const p = this.propietario();
      if (p && this.busqueda.value !== p) {
        this.busqueda.setValue(p, { emitEvent: false });
      }
    });
  }

  // Se ejecuta cuando la persona elige un propietario de la lista.
  protected elegirPropietario(dueno: Owner): void {
    this.form.controls.ownerId.setValue(dueno.id);
    this.form.controls.ownerId.markAsDirty();
  }

  // Este método se ejecuta cuando se abre la pantalla.
  ngOnInit(): void {

    // Pedimos la lista de propietarios registrados y la ordenamos por nombre.
    this.servicioDuenos.getAll().subscribe(lista => {

      const ordenada = [...lista].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'es')
      );

      this.duenos.set(ordenada);
      this.duenosCargados.set(true);
    });

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
