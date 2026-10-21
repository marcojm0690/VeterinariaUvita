import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { Veterinarian } from '../../core/models';
import { VeterinarianService } from '../../core/services/veterinarian.service';

@Component({
  selector: 'app-veterinarian-list',
  imports: [MatTableModule],
  template: `
    <h1>Veterinarios</h1>

    <table mat-table [dataSource]="veterinarians()">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let v">{{ v.firstName }} {{ v.lastName }}</td>
      </ng-container>
      <ng-container matColumnDef="licenseNumber">
        <th mat-header-cell *matHeaderCellDef>Licencia</th>
        <td mat-cell *matCellDef="let v">{{ v.licenseNumber }}</td>
      </ng-container>
      <ng-container matColumnDef="specialty">
        <th mat-header-cell *matHeaderCellDef>Especialidad</th>
        <td mat-cell *matCellDef="let v">{{ v.specialty }}</td>
      </ng-container>
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Correo</th>
        <td mat-cell *matCellDef="let v">{{ v.email }}</td>
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
export class VeterinarianList implements OnInit {
  private readonly service = inject(VeterinarianService);

  protected readonly veterinarians = signal<Veterinarian[]>([]);
  protected readonly columns = ['name', 'licenseNumber', 'specialty', 'email'];

  ngOnInit(): void {
    this.service.getAll().subscribe((vets) => this.veterinarians.set(vets));
  }
}
