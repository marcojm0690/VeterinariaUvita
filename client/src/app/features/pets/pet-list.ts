import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

import { Pet } from '../../core/models';
import { PetService } from '../../core/services/pet.service';

@Component({
  selector: 'app-pet-list',
  imports: [MatTableModule,MatButtonModule,RouterLink],
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

      <!-- Botón para abrir el formulario de registro de mascotas -->
      <a mat-flat-button routerLink="/pets/new">Registrar mascota</a>
    </div>

    <div class="divider" aria-hidden="true"><span></span></div>

    <div class="table-card">
      <table mat-table [dataSource]="pets()">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let p">
            <span class="pet-name">
              <span class="avatar" aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="currentColor"><use href="#vet-paw" /></svg>
              </span>
              {{ p.name }}
            </span>
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
          <td mat-cell *matCellDef="let p">{{ p.ownerName }}</td>
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

    @media (max-width: 560px) {
      .header {
        flex-wrap: wrap;
      }
      h1 {
        font-size: 1.5rem;
      }
    }
  `,
})
export class PetList implements OnInit {
  private readonly service = inject(PetService);

  protected readonly pets = signal<Pet[]>([]);
  protected readonly columns = ['name', 'species', 'breed', 'owner'];

  ngOnInit(): void {
    this.service.getAll().subscribe((pets) => this.pets.set(pets));
  }
}
