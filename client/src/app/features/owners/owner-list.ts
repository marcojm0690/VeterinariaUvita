import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { Owner } from '../../core/models';
import { OwnerService } from '../../core/services/owner.service';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

@Component({
  selector: 'app-owner-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="header">
      <div>
        <h1>Dueños</h1>
        <p class="subtitle">Personas responsables de las mascotas</p>
      </div>

      <div class="tools">
        <label class="search">
          <mat-icon class="search-icon" aria-hidden="true">search</mat-icon>
          <input
            type="text"
            autocomplete="off"
            placeholder="Buscar por nombre"
            aria-label="Buscar dueño por nombre"
            [value]="search()"
            (input)="onSearch($event)"
          />
          @if (search()) {
            <button type="button" class="clear" (click)="clearSearch()" aria-label="Limpiar búsqueda">
              <mat-icon>close</mat-icon>
            </button>
          }
        </label>

        <a mat-flat-button routerLink="/owners/new"><mat-icon>add</mat-icon>Nuevo</a>
      </div>
    </div>

    <div class="divider" aria-hidden="true"><span></span></div>

    <div class="table-card">
      <table mat-table [dataSource]="filtered()">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let o">
            <span class="owner-name">
              <span class="avatar" aria-hidden="true"><mat-icon>people</mat-icon></span>
              {{ o.firstName }} {{ o.lastName }}
            </span>
          </td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Correo</th>
          <td mat-cell *matCellDef="let o">{{ o.email }}</td>
        </ng-container>
        <ng-container matColumnDef="phone">
          <th mat-header-cell *matHeaderCellDef>Teléfono</th>
          <td mat-cell *matCellDef="let o">{{ o.phone }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let o">
            <a mat-icon-button class="edit" [routerLink]="['/owners', o.id]" aria-label="Editar"><mat-icon>edit</mat-icon></a>
            <button mat-icon-button class="delete" (click)="remove(o)" aria-label="Eliminar"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>

      @if (loaded() && filtered().length === 0) {
        <p class="empty">
          @if (search().trim()) {
            No se encontraron dueños con «{{ search().trim() }}».
          } @else {
            Aún no hay dueños registrados.
          }
        </p>
      }
    </div>
  `,
  styles: `
    :host {
      /* Paleta Uvita: cambia estos valores para ajustar todo el look */
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
      --vet-coral: #b4442d;

      display: block;

      /* Tokens de Angular Material (tema M3) */
      --mat-sys-primary: var(--vet-sea);
      --mat-sys-on-primary: #ffffff;
      --mat-sys-on-surface: var(--vet-ink);
      --mat-sys-on-surface-variant: var(--vet-muted);
      --mat-sys-corner-full: 6px;
    }

    /* ---------- Encabezado ---------- */
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

    /* Línea con un detalle verde palma al centro */
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

    /* ---------- Tabla ---------- */
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
      height: 48px;
      padding: 0 20px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--vet-sea-ink);
      background: var(--vet-sand);
      border-bottom: 2px solid var(--vet-sea);
    }

    td[mat-cell] {
      height: 60px;
      padding: 0 20px;
      font-size: 0.95rem;
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

    .owner-name {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: var(--vet-sea-ink);
    }

    .avatar {
      display: grid;
      place-items: center;
      flex: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--vet-sea-pale);
      color: var(--vet-sea-deep);
    }
    .avatar mat-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
    }

    .mat-column-actions {
      width: 112px;
      text-align: right;
      white-space: nowrap;
    }

    a.edit,
    button.delete {
      transition: background-color 0.15s ease;
    }
    a.edit {
      color: var(--vet-sea);
    }
    a.edit:hover {
      background: var(--vet-sea-pale);
    }
    button.delete {
      color: var(--vet-coral);
    }
    button.delete:hover {
      background: #f3dcd5;
    }

    /* ---------- Pantallas angostas ---------- */
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
export class OwnerList implements OnInit {
  private readonly service = inject(OwnerService);

  protected readonly owners = signal<Owner[]>([]);
  protected readonly loaded = signal(false);
  protected readonly search = signal('');
  protected readonly columns = ['name', 'email', 'phone', 'actions'];

  protected readonly filtered = computed(() => {
    const terms = normalize(this.search()).split(' ').filter(Boolean);
    if (terms.length === 0) return this.owners();

    return this.owners().filter((owner) => {
      const name = normalize(`${owner.firstName} ${owner.lastName}`);
      return terms.every((term) => name.includes(term));
    });
  });

  ngOnInit(): void {
    this.load();
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.search.set('');
  }

  protected remove(owner: Owner): void {
    if (!confirm(`¿Eliminar a ${owner.firstName} ${owner.lastName}?`)) return;

    this.service.delete(owner.id).subscribe({
      next: () => {
        alert('El dueño se eliminó correctamente.');
        this.load();
      },
      error: (error) => {
        if (error.status === 409) {
          alert('No se puede eliminar este dueño porque tiene mascotas asociadas. Primero debes reasignarlas o eliminarlas.');
        } else {
          alert('Ocurrió un error al intentar eliminar el dueño.');
        }
      }
    });
  }

  private load(): void {
    this.service.getAll().subscribe((owners) => {
      this.owners.set(owners);
      this.loaded.set(true);
    });
  }
}
