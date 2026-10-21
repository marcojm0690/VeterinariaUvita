import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { Pet } from '../../core/models';
import { PetService } from '../../core/services/pet.service';

@Component({
  selector: 'app-pet-list',
  imports: [MatTableModule],
  template: `
    <h1>Mascotas</h1>

    <table mat-table [dataSource]="pets()">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let p">{{ p.name }}</td>
      </ng-container>
      <ng-container matColumnDef="species">
        <th mat-header-cell *matHeaderCellDef>Especie</th>
        <td mat-cell *matCellDef="let p">{{ p.species }}</td>
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
  `,
  styles: `
    table {
      width: 100%;
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
