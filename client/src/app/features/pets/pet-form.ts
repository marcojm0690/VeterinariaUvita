import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { Owner } from '../../core/models';
import { OwnerService } from '../../core/services/owner.service';
import { PetService } from '../../core/services/pet.service';

// Límites que usa el sistema para validar. Se pueden cambiar aquí.
const MAX_PESO_KG = 200;
const MAX_EDAD_ANIOS = 40;
const LARGO_MINIMO_NOMBRE = 2;
const LARGO_MAXIMO_TEXTO = 50;

// Letras (con tildes), números, espacios, guiones, puntos y apóstrofes.
const PATRON_NOMBRE = /^[\p{L}\p{N}][\p{L}\p{N} .'’\-]*$/u;

// Opciones de especie que se pueden elegir.
const ESPECIES_BASE = ['Perro', 'Gato', 'Ave', 'Conejo', 'Roedor', 'Reptil', 'Pez', 'Caballo', 'Otro'];

// Quita tildes y mayúsculas para que al buscar "jose" también aparezca "José".
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Valida el nombre de la mascota: obligatorio, sin solo espacios, de 2 a 50 caracteres.
function validarNombre(c: AbstractControl): ValidationErrors | null {
  const valor = typeof c.value === 'string' ? c.value : '';
  if (valor.length === 0) return { required: true };

  const texto = valor.trim();
  if (texto.length === 0) return { soloEspacios: true };
  if (texto.length < LARGO_MINIMO_NOMBRE) return { largoMinimo: true };
  if (texto.length > LARGO_MAXIMO_TEXTO) return { largoMaximo: true };
  if (!PATRON_NOMBRE.test(texto)) return { caracteres: true };
  return null;
}

// Valida la raza: es opcional, pero no puede ser solo espacios ni pasar de 50 caracteres.
function validarRaza(c: AbstractControl): ValidationErrors | null {
  const valor = typeof c.value === 'string' ? c.value : '';
  if (valor.length === 0) return null;

  const texto = valor.trim();
  if (texto.length === 0) return { soloEspacios: true };
  if (texto.length > LARGO_MAXIMO_TEXTO) return { largoMaximo: true };
  return null;
}

// Valida la fecha de nacimiento: opcional, real, no futura y con sentido para una mascota.
function validarFechaNacimiento(c: AbstractControl): ValidationErrors | null {
  const valor = c.value as string;
  if (!valor) return null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return { fechaInvalida: true };

  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes - 1 || fecha.getDate() !== dia) {
    return { fechaInvalida: true };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha > hoy) return { fechaFutura: true };

  const limite = new Date(hoy);
  limite.setFullYear(hoy.getFullYear() - MAX_EDAD_ANIOS);
  if (fecha < limite) return { fechaMuyAntigua: true };

  return null;
}

// Valida el peso: opcional, numérico, mayor que 0 y menor o igual al límite del sistema.
function validarPeso(c: AbstractControl): ValidationErrors | null {
  const valor = c.value;
  if (valor === null || valor === undefined || valor === '') return null;

  if (typeof valor !== 'number' || !Number.isFinite(valor)) return { pesoNoNumerico: true };
  if (valor < 0) return { pesoNegativo: true };
  if (valor === 0) return { pesoCero: true };
  if (valor > MAX_PESO_KG) return { pesoExcesivo: true };
  return null;
}

// Este componente sirve para registrar y editar mascotas.
@Component({
  selector: 'app-pet-form',

  // Estas son las herramientas que necesitamos para el formulario.
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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

      <form [formGroup]="form" (ngSubmit)="guardar()" novalidate>

        <div class="group">
          <div class="section-label">La mascota</div>

          <div class="row">
            <!-- Campo para escribir el nombre de la mascota -->
            <mat-form-field appearance="outline">
              <mat-label>Nombre de la mascota</mat-label>
              <input matInput formControlName="name" autocomplete="off" />
              @if (form.controls.name.hasError('required')) {
                <mat-error>El nombre de la mascota es obligatorio.</mat-error>
              } @else if (form.controls.name.hasError('soloEspacios')) {
                <mat-error>El nombre no puede contener solo espacios.</mat-error>
              } @else if (form.controls.name.hasError('largoMinimo')) {
                <mat-error>El nombre debe contener al menos 2 caracteres.</mat-error>
              } @else if (form.controls.name.hasError('largoMaximo')) {
                <mat-error>El nombre no puede superar los 50 caracteres.</mat-error>
              } @else if (form.controls.name.hasError('caracteres')) {
                <mat-error>Use solo letras, números, espacios y guiones.</mat-error>
              }
            </mat-form-field>

            <!-- Lista para elegir la especie (no se puede escribir cualquier cosa) -->
            <mat-form-field appearance="outline">
              <mat-label>Especie</mat-label>
              <mat-select formControlName="species" panelClass="vet-select-panel">
                @for (especie of especies(); track especie) {
                  <mat-option [value]="especie">{{ especie }}</mat-option>
                }
              </mat-select>
              <mat-error>Debe seleccionar una especie.</mat-error>
            </mat-form-field>

            <!-- Campo para escribir la raza -->
            <mat-form-field appearance="outline">
              <mat-label>Raza</mat-label>
              <input matInput formControlName="breed" autocomplete="off" />
              @if (form.controls.breed.hasError('soloEspacios')) {
                <mat-error>La raza no puede contener solo espacios.</mat-error>
              } @else if (form.controls.breed.hasError('largoMaximo')) {
                <mat-error>La raza no puede superar los 50 caracteres.</mat-error>
              }
            </mat-form-field>
          </div>
        </div>

        <div class="group">
          <div class="section-label">Detalles y propietario</div>

          <div class="row">
            <!-- Campo para seleccionar la fecha de nacimiento -->
            <mat-form-field appearance="outline">
              <mat-label>Fecha de nacimiento</mat-label>
              <input matInput type="date" formControlName="birthDate" [max]="hoy" />
              @if (form.controls.birthDate.hasError('fechaFutura')) {
                <mat-error>La fecha de nacimiento no puede ser futura.</mat-error>
              } @else if (form.controls.birthDate.hasError('fechaMuyAntigua')) {
                <mat-error>La fecha no es realista para una mascota (máximo 40 años).</mat-error>
              } @else if (form.controls.birthDate.hasError('fechaInvalida')) {
                <mat-error>Ingrese una fecha de nacimiento válida.</mat-error>
              }
            </mat-form-field>

            <!-- Campo para escribir el peso de la mascota -->
            <mat-form-field appearance="outline">
              <mat-label>Peso en kilogramos</mat-label>
              <input matInput type="number" step="any" formControlName="weightKg" />
              @if (form.controls.weightKg.hasError('pesoNegativo')) {
                <mat-error>El peso no puede ser negativo.</mat-error>
              } @else if (form.controls.weightKg.hasError('pesoCero')) {
                <mat-error>El peso debe ser mayor que 0 kg.</mat-error>
              } @else if (form.controls.weightKg.hasError('pesoExcesivo')) {
                <mat-error>El peso no puede superar los 200 kg.</mat-error>
              } @else if (form.controls.weightKg.hasError('pesoNoNumerico')) {
                <mat-error>Ingrese un peso numérico válido.</mat-error>
              }
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
                @if (busqueda.hasError('required')) {
                  <mat-error>Debe seleccionar un propietario.</mat-error>
                } @else if (busqueda.hasError('noElegido')) {
                  <mat-error>El propietario seleccionado no es válido.</mat-error>
                }

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

        <!-- Avisos generales del formulario -->
        @if (intentoFallido()) {
          <p class="form-alert" role="alert">Revise los campos marcados antes de guardar.</p>
        }
        @if (errorGuardado(); as mensaje) {
          <p class="form-alert" role="alert">{{ mensaje }}</p>
        }

        <!-- Botones para cancelar o guardar -->
        <div class="actions">
          <a mat-button routerLink="/pets">Cancelar</a>
          <button mat-flat-button type="submit" [disabled]="obligatoriosInvalidos() || guardando()">
            {{ guardando() ? 'Guardando...' : 'Guardar' }}
          </button>
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

    /* Aviso general cuando hay errores o falla el guardado */
    .form-alert {
      margin: 0;
      padding: 10px 14px;
      font-size: 0.9rem;
      font-weight: 600;
      color: #8a2f1b;
      background: #f9e3dd;
      border: 1px solid #e3b4a8;
      border-radius: 6px;
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
  private snackBar = inject(MatSnackBar);

  // Este dato nos ayuda a saber si estamos editando una mascota.
  readonly id = input<string>();

  // Fecha de hoy (yyyy-MM-dd) para que el calendario no deje elegir días futuros.
  protected readonly hoy = (() => {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  })();

  // Lista de especies que se pueden elegir.
  protected readonly especies = signal<string[]>([...ESPECIES_BASE]);

  // Aquí guardamos la lista de propietarios que se muestra en el campo desplegable.
  protected readonly duenos = signal<Owner[]>([]);

  // Nos avisa cuando ya terminó de cargar la lista de propietarios.
  protected readonly duenosCargados = signal(false);

  // Avisos generales del formulario.
  protected readonly intentoFallido = signal(false);
  protected readonly errorGuardado = signal<string | null>(null);
  protected readonly guardando = signal(false);

  // Aquí creamos los campos del formulario.
  // Cada campo tiene sus validaciones (ver las funciones de arriba).
  protected form = this.fb.group({

    name: ['', validarNombre],
    species: ['', Validators.required],
    breed: ['', validarRaza],
    birthDate: ['', validarFechaNacimiento],

    // El peso es opcional, pero si se escribe debe ser positivo y razonable.
    weightKg: [null as number | null, validarPeso],

    // La mascota debe estar relacionada con un propietario.
    // Aunque la persona elige un nombre, aquí se guarda el ID de ese propietario.
    ownerId: [0, [Validators.required, Validators.min(1)]]
  });

  // Cambia cada vez que el formulario revisa sus validaciones (para actualizar la pantalla).
  private readonly estadoForm = toSignal(this.form.statusChanges, {
    initialValue: this.form.status
  });

  // El botón Guardar se deshabilita si los campos obligatorios no son válidos.
  protected readonly obligatoriosInvalidos = computed(() => {
    this.estadoForm();
    const c = this.form.controls;
    return c.name.invalid || c.species.invalid || c.ownerId.invalid;
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

    // Cuando el formulario vuelve a estar correcto, se quita el aviso de errores.
    this.form.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.form.valid) {
        this.intentoFallido.set(false);
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

        // Si la especie guardada no está en la lista, la agregamos para no perderla.
        if (mascota.species && !this.especies().includes(mascota.species)) {
          this.especies.update(lista => [...lista, mascota.species]);
        }

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

    // Evita guardar dos veces seguidas por un doble clic.
    if (this.guardando()) {
      return;
    }

    this.errorGuardado.set(null);

    // Si hay errores (o el propietario no existe en el sistema), no deja guardar
    // y marca todos los campos para que se vean sus mensajes.
    if (this.form.invalid || !this.propietario()) {
      this.form.markAllAsTouched();
      this.busqueda.markAsTouched();
      this.intentoFallido.set(true);
      return;
    }

    this.intentoFallido.set(false);

    // Obtenemos los datos que escribió el usuario.
    const datos = this.form.getRawValue();

    // Preparamos la información que enviaremos al servicio (sin espacios al inicio ni al final).
    const mascota = {
      name: datos.name.trim(),
      species: datos.species.trim(),
      breed: datos.breed.trim() || null,
      birthDate: datos.birthDate || null,
      weightKg: datos.weightKg,
      ownerId: datos.ownerId
    };

    // Revisamos si vamos a registrar o editar.
    const idMascota = this.id();

    // Antes de guardar, revisamos que no exista la misma mascota (mismo nombre, especie y propietario).
    this.guardando.set(true);

    this.servicio.getAll().subscribe({
      next: lista => {
        const duplicada = lista.some(p =>
          String(p.id) !== idMascota &&
          p.ownerId === mascota.ownerId &&
          normalize(p.name) === normalize(mascota.name) &&
          normalize(p.species) === normalize(mascota.species)
        );

        if (duplicada) {
          this.guardando.set(false);
          this.errorGuardado.set('Ya existe una mascota con el mismo nombre y especie para este propietario.');
          return;
        }

        this.enviar(mascota, idMascota);
      },
      error: () => {
        this.guardando.set(false);
        this.errorGuardado.set('No se pudo verificar si la mascota ya existe. Intente de nuevo; sus datos se conservaron.');
      }
    });
  }

  // Envía la mascota al servicio: la crea o la actualiza según el caso.
  private enviar(mascota: any, idMascota: string | undefined): void {

    const peticion = (idMascota
      ? this.servicio.update(Number(idMascota), mascota)
      : this.servicio.create(mascota)) as Observable<unknown>;

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.snackBar.open('Mascota guardada correctamente', 'Cerrar', { duration: 3000 });

        // Regresamos a la lista de mascotas.
        this.router.navigate(['/pets']);
      },
      error: () => {
        // Si falla, mostramos el mensaje y dejamos los datos escritos tal como están.
        this.guardando.set(false);
        this.errorGuardado.set('No se pudo guardar la mascota. Intente de nuevo; sus datos se conservaron.');
      }
    });
  }
}

