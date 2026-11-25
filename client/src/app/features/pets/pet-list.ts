import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';

import { Owner, Pet } from '../../core/models';
import { OwnerService } from '../../core/services/owner.service';
import { PetService } from '../../core/services/pet.service';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

@Component({
  selector: 'app-pet-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
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

    <div class="header">
      <div>
        <h1>Mascotas</h1>
        <p class="subtitle">Pacientes registrados en la veterinaria</p>
      </div>

      <div class="tools">
        <label class="search">
          <mat-icon class="search-icon" aria-hidden="true">search</mat-icon>
          <input
            type="text"
            autocomplete="off"
            placeholder="Buscar por nombre o dueño"
            aria-label="Buscar mascota por nombre o dueño"
            [value]="search()"
            (input)="onSearch($event)"
          />
          @if (search()) {
            <button type="button" class="clear" (click)="clearSearch()" aria-label="Limpiar búsqueda">
              <mat-icon>close</mat-icon>
            </button>
          }
        </label>

        <!-- Botón para abrir el formulario de registro de mascotas -->
        <a mat-flat-button routerLink="/pets/new"><mat-icon>add</mat-icon>Registrar mascota</a>
      </div>
    </div>

    <div class="divider" aria-hidden="true"><span></span></div>

    <div class="table-card">
      <table mat-table [dataSource]="filtered()">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let p">
            <!-- Al hacer clic en el nombre se abre el detalle de la mascota -->
            <a
              class="pet-name"
              [routerLink]="['/pets', p.id, 'details']"
              [attr.aria-label]="'Ver detalles de ' + p.name"
            >
              <span class="avatar" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="currentColor"><use href="#vet-paw" /></svg>
              </span>
              {{ p.name }}
            </a>
          </td>
        </ng-container>
        <ng-container matColumnDef="species">
          <th mat-header-cell *matHeaderCellDef>Especie</th>
          <td mat-cell *matCellDef="let p"><span class="chip">{{ p.species }}</span></td>
        </ng-container>
        <ng-container matColumnDef="breed">
          <th mat-header-cell *matHeaderCellDef>Raza</th>
          <td mat-cell *matCellDef="let p">{{ p.breed }}</td>
        </ng-container>
        <ng-container matColumnDef="owner">
          <th mat-header-cell *matHeaderCellDef>Dueño</th>
          <td mat-cell *matCellDef="let p">
            <!-- Al pasar el cursor se muestra el correo y el teléfono del dueño -->
            <span
              class="owner-hover"
              [matTooltip]="ownerInfo(p)"
              matTooltipPosition="above"
              matTooltipClass="owner-tip"
              [matTooltipShowDelay]="150"
              >{{ p.ownerName }}</span
            >
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p">
            <button
              mat-icon-button
              class="edit"
              [routerLink]="['/pets', p.id]"
              aria-label="Editar mascota"
            >
              <mat-icon>edit</mat-icon>
            </button>

            <button
              mat-icon-button
              class="delete"
              (click)="remove(p)"
              aria-label="Eliminar mascota"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>

      @if (loaded() && filtered().length === 0) {
        <p class="empty">
          @if (search().trim()) {
            No se encontraron mascotas con «{{ search().trim() }}».
          } @else {
            Aún no hay mascotas registradas.
          }
        </p>
      }
    </div>
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

    /* Tarjeta con correo y teléfono del dueño (tooltip) */
    ::ng-deep .owner-tip .mdc-tooltip__surface {
      white-space: pre-line;
      max-width: 320px;
      padding: 10px 14px;
      font-size: 0.9rem;
      line-height: 1.6;
      color: #ffffff;
      background: #12384a;
    }

    .owner-hover {
      cursor: default;
      border-bottom: 1px dotted var(--vet-line);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    h1 {
      margin: 0;
      font-family: Georgia, 'Iowan Old Style', 'Palatino Linotype', serif;
      font-size: 1.9rem;
      font-weight: 700;
      letter-spacing: 0.2px;
      color: var(--vet-sea-ink);
    }

    button.edit {
      color: #0e7490;
    }

    button.edit:hover {
      color: #0b5d77;
      background: #c5e0e8;
    }

    /* Botón eliminar */
    button.delete {
      color: #c0442d;
    }

    button.delete:hover {
      color: #a83222;
      background: #f4dfd8;
    }

    .subtitle {
      margin: 4px 0 0;
      font-size: 0.9rem;
      color: var(--vet-muted);
    }

    .tools {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search {
      position: relative;
      display: flex;
      align-items: center;
      width: 280px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      width: 20px;
      height: 20px;
      font-size: 20px;
      color: var(--vet-muted);
      pointer-events: none;
    }

    .search input {
      width: 100%;
      height: 40px;
      padding: 0 38px 0 40px;
      font: inherit;
      font-size: 0.95rem;
      color: var(--vet-ink);
      background: #fcfaf4;
      border: 1px solid var(--vet-line);
      border-radius: 4px;
      outline: none;
      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease;
    }
    .search input::placeholder {
      color: #7c8f96;
    }
    .search input:hover {
      border-color: #bfae8a;
    }
    .search input:focus {
      border-color: var(--vet-sea);
      box-shadow: 0 0 0 3px var(--vet-sea-pale);
    }

    .clear {
      position: absolute;
      right: 6px;
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      padding: 0;
      color: var(--vet-muted);
      background: transparent;
      border: none;
      border-radius: 50%;
      cursor: pointer;
    }
    .clear:hover {
      background: var(--vet-sand);
    }
    .clear mat-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0 24px;
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

    .table-card {
      overflow-x: auto;
      background: #fcfaf4;
      border: 1px solid var(--vet-line);
    }

    table {
      width: 100%;
      background: transparent;
    }

    th[mat-header-cell] {
      height: 52px;
      padding: 0 20px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vet-sea-ink);
      background: var(--vet-sand);
      border-bottom: 2px solid var(--vet-sea);
    }

    td[mat-cell] {
      height: 64px;
      padding: 0 20px;
      font-size: 17px;
      color: var(--vet-ink);
      border-bottom: 1px solid #e9dfc9;
    }

    tr[mat-row] {
      transition: background-color 0.15s ease;
    }
    tr[mat-row]:hover {
      background: #f4eedf;
    }
    tr[mat-row]:last-child td[mat-cell] {
      border-bottom: none;
    }

    .empty {
      margin: 0;
      padding: 32px 20px;
      text-align: center;
      font-size: 0.95rem;
      color: var(--vet-muted);
    }

    .pet-name {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: var(--vet-sea-ink);
      text-decoration: none;
      cursor: pointer;
    }
    .pet-name:hover {
      color: var(--vet-sea-deep);
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .avatar {
      display: grid;
      place-items: center;
      flex: none;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--vet-sea-pale);
      color: var(--vet-sea-deep);
    }
    .avatar svg {
      width: 18px;
      height: 18px;
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

    @media (max-width: 720px) {
      .header {
        flex-wrap: wrap;
      }
      .tools {
        width: 100%;
      }
      .search {
        flex: 1;
        width: auto;
      }
    }

    @media (max-width: 560px) {
      h1 {
        font-size: 1.5rem;
      }
    }
  `,
})
export class PetList implements OnInit {
  private readonly service = inject(PetService);
  private readonly ownerService = inject(OwnerService);

  protected readonly pets = signal<Pet[]>([]);
  protected readonly loaded = signal(false);
  protected readonly search = signal('');
  protected readonly columns = ['name', 'species', 'breed', 'owner', 'actions'];

  // Dueños por ID, para mostrar su correo y teléfono en la tarjeta.
  protected readonly ownersById = signal(new Map<number, Owner>());

  protected readonly filtered = computed(() => {
    const terms = normalize(this.search()).split(' ').filter(Boolean);
    if (terms.length === 0) return this.pets();

    return this.pets().filter((pet) => {
      const text = normalize(`${pet.name} ${pet.ownerName ?? ''}`);
      return terms.every((term) => text.includes(term));
    });
  });

  ngOnInit(): void {
    this.load();

    this.ownerService
      .getAll()
      .subscribe((owners) => this.ownersById.set(new Map(owners.map((o) => [o.id, o]))));
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.search.set('');
  }

  // Texto de la tarjeta: correo y teléfono del dueño de la mascota.
  protected ownerInfo(pet: Pet): string {
    const owner = this.ownersById().get(pet.ownerId);
    if (!owner) return '';
    return `✉ ${owner.email}\n☎ ${owner.phone || 'Sin teléfono'}`;
  }

  protected remove(pet: Pet): void {
    if (!confirm(`¿Eliminar a ${pet.name}?`)) return;

    this.service.delete(pet.id).subscribe({
      next: () => {
        alert('La mascota se eliminó correctamente.');
        this.load();
      },
      error: (error) => {
        alert(
          error.status === 409
            ? 'No se puede eliminar esta mascota porque tiene información asociada.'
            : 'Ocurrió un error al intentar eliminar la mascota.'
        );
      }
    });
  }

  private load(): void {
    this.service.getAll().subscribe((pets) => {
      this.pets.set(pets);
      this.loaded.set(true);
    });
  }
}
