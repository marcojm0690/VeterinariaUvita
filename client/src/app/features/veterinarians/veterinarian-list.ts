import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { Veterinarian } from '../../core/models';
import { VeterinarianService } from '../../core/services/veterinarian.service';

@Component({
  selector: 'app-veterinarian-list',
  imports: [MatTableModule],
  template: `
    <div class="header">
      <div>
        <h1>Veterinarios</h1>
        <p class="subtitle">Equipo médico de la veterinaria</p>
      </div>
    </div>

    <div class="divider" aria-hidden="true"><span></span></div>

    <div class="table-card">
      <table mat-table [dataSource]="veterinarians()">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let v">
            <span class="vet-name">
              <span class="avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" /></svg>
              </span>
              {{ v.firstName }} {{ v.lastName }}
            </span>
          </td>
        </ng-container>
        <ng-container matColumnDef="licenseNumber">
          <th mat-header-cell *matHeaderCellDef>Licencia</th>
          <td mat-cell *matCellDef="let v"><span class="license">{{ v.licenseNumber }}</span></td>
        </ng-container>
        <ng-container matColumnDef="specialty">
          <th mat-header-cell *matHeaderCellDef>Especialidad</th>
          <td mat-cell *matCellDef="let v"><span class="chip">{{ v.specialty }}</span></td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Correo</th>
          <td mat-cell *matCellDef="let v" class="email">{{ v.email }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
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
      --mat-sys-on-surface: var(--vet-ink);
      --mat-sys-on-surface-variant: var(--vet-muted);
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

    .vet-name {
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
      width: 16px;
      height: 16px;
    }

    .license {
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.04em;
    }

    .chip {
      display: inline-block;
      padding: 3px 12px;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--vet-sea-ink);
      background: var(--vet-sand);
      border: 1px solid var(--vet-line);
      border-radius: 999px;
    }

    .email {
      color: var(--vet-muted);
    }

    @media (max-width: 560px) {
      h1 {
        font-size: 1.5rem;
      }
    }
  `,
})
export class VeterinarianList implements OnInit {
  private readonly service = inject(VeterinarianService);

  protected readonly veterinarians = signal<Veterinarian[]>([]);
  protected readonly columns = ['name', 'licenseNumber', 'specialty', 'email'];

  ngOnInit(): void {
    this.service.getAll().subscribe((vets) => this.veterinarians.set(vets));
  }
}
