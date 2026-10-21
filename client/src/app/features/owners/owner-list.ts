import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';

import { Owner } from '../../core/models';
import { OwnerService } from '../../core/services/owner.service';

@Component({
  selector: 'app-owner-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="header">
      <h1>Dueños</h1>
      <a mat-flat-button routerLink="/owners/new"><mat-icon>add</mat-icon>Nuevo</a>
    </div>

    <table mat-table [dataSource]="owners()">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let o">{{ o.firstName }} {{ o.lastName }}</td>
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
          <a mat-icon-button [routerLink]="['/owners', o.id]" aria-label="Editar"><mat-icon>edit</mat-icon></a>
          <button mat-icon-button (click)="remove(o)" aria-label="Eliminar"><mat-icon>delete</mat-icon></button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns"></tr>
    </table>
  `,
  styles: `
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    table {
      width: 100%;
    }
  `,
})
export class OwnerList implements OnInit {
  private readonly service = inject(OwnerService);

  protected readonly owners = signal<Owner[]>([]);
  protected readonly columns = ['name', 'email', 'phone', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  protected remove(owner: Owner): void {
    if (!confirm(`¿Eliminar a ${owner.firstName} ${owner.lastName}?`)) return;
    this.service.delete(owner.id).subscribe(() => this.load());
  }

  private load(): void {
    this.service.getAll().subscribe((owners) => this.owners.set(owners));
  }
}
