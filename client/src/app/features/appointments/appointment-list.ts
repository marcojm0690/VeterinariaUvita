import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

// Ajusta estas rutas/nombres a los de tu proyecto
import { Appointment } from '../../core/models';
import { AppointmentService } from '../../core/services/appointment.service';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

@Component({
  selector: 'app-appointment-list',
  imports: [MatTableModule, MatIconModule, DatePipe],
  template: `
    <div class="header">
      <div>
        <h1>Citas</h1>
        <p class="subtitle">Agenda de atención de la veterinaria</p>
      </div>

      <div class="tools">
        <label class="search">
          <mat-icon class="search-icon" aria-hidden="true">search</mat-icon>
          <input
            type="text"
            autocomplete="off"
            placeholder="Buscar por mascota, veterinario o motivo"
            aria-label="Buscar cita por mascota, veterinario o motivo"
            [value]="search()"
            (input)="onSearch($event)"
          />
          @if (search()) {
            <button type="button" class="clear" (click)="clearSearch()" aria-label="Limpiar búsqueda">
              <mat-icon>close</mat-icon>
            </button>
          }
        </label>
      </div>
    </div>

    <div class="divider" aria-hidden="true"><span></span></div>

    <div class="table-card">
      <table mat-table [dataSource]="filtered()">
        <ng-container matColumnDef="scheduledAt">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let a">
            <span class="date">{{ a.scheduledAt | date: 'dd/MM/yyyy HH:mm' }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="pet">
          <th mat-header-cell *matHeaderCellDef>Mascota</th>
          <td mat-cell *matCellDef="let a">
            <span class="pet-name">
              <span class="avatar" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="currentColor"><use href="#vet-paw" /></svg>
              </span>
              {{ a.petName }}
            </span>
          </td>
        </ng-container>
        <ng-container matColumnDef="veterinarian">
          <th mat-header-cell *matHeaderCellDef>Veterinario</th>
          <td mat-cell *matCellDef="let a">{{ a.veterinarianName }}</td>
        </ng-container>
        <ng-container matColumnDef="reason">
          <th mat-header-cell *matHeaderCellDef>Motivo</th>
          <td mat-cell *matCellDef="let a" class="reason">{{ a.reason }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let a"><span class="chip">{{ a.status }}</span></td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>

      @if (loaded() && filtered().length === 0) {
        <p class="empty">
          @if (search().trim()) {
            No se encontraron citas con «{{ search().trim() }}».
          } @else {
            Aún no hay citas registradas.
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
      width: 320px;
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

    .date {
      font-variant-numeric: tabular-nums;
      font-weight: 600;
      color: var(--vet-sea-ink);
    }

    .reason {
      color: var(--vet-muted);
    }

    .pet-name {
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
export class AppointmentList implements OnInit {
  private readonly service = inject(AppointmentService);

  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly loaded = signal(false);
  protected readonly search = signal('');
  protected readonly columns = ['scheduledAt', 'pet', 'veterinarian', 'reason', 'status'];

  protected readonly filtered = computed(() => {
    const terms = normalize(this.search()).split(' ').filter(Boolean);
    if (terms.length === 0) return this.appointments();

    return this.appointments().filter((a) => {
      const text = normalize(
        `${a.petName ?? ''} ${a.veterinarianName ?? ''} ${a.reason ?? ''} ${a.status ?? ''}`,
      );
      return terms.every((term) => text.includes(term));
    });
  });

  ngOnInit(): void {
    this.service.getAll().subscribe((items) => {
      this.appointments.set(items);
      this.loaded.set(true);
    });
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.search.set('');
  }
}
