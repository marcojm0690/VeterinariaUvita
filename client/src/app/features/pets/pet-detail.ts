import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { Owner, Pet } from '../../core/models';
import { OwnerService } from '../../core/services/owner.service';
import { PetService } from '../../core/services/pet.service';

// Convierte "2020-05-14" en una fecha local (evita que se corra un día por la zona horaria).
function parseFecha(valor: string): Date | null {
  const [anio, mes, dia] = valor.substring(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) return null;
  return new Date(anio, mes - 1, dia);
}

// Este componente muestra todos los datos de una mascota y de su propietario.
@Component({
  selector: 'app-pet-detail',
  imports: [MatButtonModule, MatIconModule, RouterLink],
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
        <div class="badge" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 64 64" fill="currentColor"><use href="#vet-paw" /></svg>
        </div>
        <div class="titles">
          <h1>{{ pet()?.name ?? 'Detalle de mascota' }}</h1>
          <p class="subtitle">Información de la mascota y de su propietario</p>
        </div>
      </header>

      <div class="body">
        @if (noEncontrada()) {
          <p class="message">No se encontró la mascota solicitada.</p>
        } @else if (!pet()) {
          <p class="message">Cargando...</p>
        } @else {
          @let p = pet()!;

          <div class="group">
            <div class="section-label">La mascota</div>
            <dl class="grid">
              <div><dt>Nombre</dt><dd>{{ p.name }}</dd></div>
              <div><dt>Especie</dt><dd><span class="chip">{{ p.species }}</span></dd></div>
              <div><dt>Raza</dt><dd>{{ p.breed || 'Sin registrar' }}</dd></div>
              <div><dt>Fecha de nacimiento</dt><dd>{{ nacimiento() }}</dd></div>
              <div><dt>Edad</dt><dd>{{ edad() }}</dd></div>
              <div><dt>Peso</dt><dd>{{ p.weightKg ? p.weightKg + ' kg' : 'Sin registrar' }}</dd></div>
            </dl>
          </div>

          <div class="group">
            <div class="section-label">Propietario</div>
            <dl class="grid">
              <div><dt>Nombre</dt><dd>{{ p.ownerName || 'Sin registrar' }}</dd></div>
              <div>
                <dt>Teléfono</dt>
                <dd>{{ propietario()?.phone || 'Sin teléfono' }}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd class="email">{{ propietario()?.email || 'Sin correo' }}</dd>
              </div>
            </dl>
          </div>
        }

        <div class="actions">
          <a mat-button routerLink="/pets"><mat-icon>arrow_back</mat-icon>Volver a la lista</a>
          @if (pet(); as p) {
            <a mat-flat-button [routerLink]="['/pets', p.id]"><mat-icon>edit</mat-icon>Editar</a>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    :host {
      --vet-sand-light: #f8f4ea;
      --vet-sand: #ecdfc4;
      --vet-line: #d9cdb2;
      --vet-sea: #0e7490;
      --vet-sea-deep: #0b5d77;
      --vet-sea-ink: #0b4f63;
      --vet-sea-pale: #c5e0e8;
      --vet-navy: #12384a;
      --vet-ink: #1d3b47;
      --vet-muted: #44606b;
      --vet-palm: #3f7a4a;

      display: block;

      --mat-sys-primary: var(--vet-sea);
      --mat-sys-on-primary: #ffffff;
      --mat-sys-on-surface: var(--vet-ink);
      --mat-sys-on-surface-variant: var(--vet-muted);
      --mat-sys-corner-full: 6px;
    }

    .card {
      background: var(--vet-sand-light);
      border: 1px solid var(--vet-line);
    }

    .header {
      display: flex;
      align-items: center;
      gap: 18px;
      padding: 24px 40px;
      background: var(--vet-sand);
      border-bottom: 3px solid var(--vet-sea);
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

    h1 {
      margin: 0;
      font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
      font-size: 1.9rem;
      font-weight: 700;
      letter-spacing: 0.2px;
      color: var(--vet-navy);
    }

    .subtitle {
      margin: 4px 0 0;
      font-size: 0.92rem;
      color: var(--vet-muted);
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: 28px;
      padding: 28px 40px 32px;
    }

    .message {
      margin: 0;
      padding: 24px 0;
      text-align: center;
      color: var(--vet-muted);
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
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

    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px 24px;
      margin: 0;
    }

    .grid div {
      min-width: 0;
    }

    dt {
      margin-bottom: 4px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--vet-muted);
    }

    dd {
      margin: 0;
      font-size: 1.05rem;
      color: var(--vet-ink);
    }

    .email {
      overflow-wrap: anywhere;
    }

    .chip {
      display: inline-block;
      padding: 3px 12px;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--vet-sea-ink);
      background: var(--vet-sand);
      border: 1px solid var(--vet-line);
      border-radius: 999px;
    }

    .actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }

    .actions a:first-child {
      color: var(--vet-muted);
    }

    @media (max-width: 860px) {
      .grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 560px) {
      .header,
      .body {
        padding-left: 22px;
        padding-right: 22px;
      }
      .grid {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 1.5rem;
      }
    }
  `,
})
export class PetDetail implements OnInit {
  private readonly petService = inject(PetService);
  private readonly ownerService = inject(OwnerService);

  // El ID de la mascota llega desde la ruta (/pets/:id/details).
  readonly id = input<string>();

  protected readonly pet = signal<Pet | null>(null);
  protected readonly propietario = signal<Owner | null>(null);
  protected readonly noEncontrada = signal(false);

  // Fecha de nacimiento en formato legible, por ejemplo "14 de mayo de 2020".
  protected readonly nacimiento = computed(() => {
    const valor = this.pet()?.birthDate;
    const fecha = valor ? parseFecha(valor) : null;
    return fecha
      ? fecha.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Sin registrar';
  });

  // Edad calculada a partir de la fecha de nacimiento.
  protected readonly edad = computed(() => {
    const valor = this.pet()?.birthDate;
    const fecha = valor ? parseFecha(valor) : null;
    if (!fecha) return 'Sin registrar';

    const hoy = new Date();
    let meses = (hoy.getFullYear() - fecha.getFullYear()) * 12 + (hoy.getMonth() - fecha.getMonth());
    if (hoy.getDate() < fecha.getDate()) meses--;
    if (meses < 0) return 'Sin registrar';

    const anios = Math.floor(meses / 12);
    const resto = meses % 12;
    const textoAnios = `${anios} ${anios === 1 ? 'año' : 'años'}`;
    const textoMeses = `${resto} ${resto === 1 ? 'mes' : 'meses'}`;

    if (anios === 0) return textoMeses;
    return resto === 0 ? textoAnios : `${textoAnios} y ${textoMeses}`;
  });

  ngOnInit(): void {
    const idMascota = this.id();
    if (!idMascota) {
      this.noEncontrada.set(true);
      return;
    }

    // Buscamos la mascota y, cuando llega, buscamos los datos de contacto de su dueño.
    this.petService.getById(Number(idMascota)).subscribe({
      next: (mascota) => {
        this.pet.set(mascota);

        this.ownerService
          .getAll()
          .subscribe((duenos) =>
            this.propietario.set(duenos.find((d) => d.id === mascota.ownerId) ?? null)
          );
      },
      error: () => this.noEncontrada.set(true)
    });
  }
}

