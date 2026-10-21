import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

import { Appointment } from '../../core/models';
import { AppointmentService } from '../../core/services/appointment.service';

@Component({
  selector: 'app-appointment-list',
  imports: [MatTableModule, DatePipe],
  template: `
    <h1>Citas</h1>

    <table mat-table [dataSource]="appointments()">
      <ng-container matColumnDef="scheduledAt">
        <th mat-header-cell *matHeaderCellDef>Fecha</th>
        <td mat-cell *matCellDef="let a">{{ a.scheduledAt | date: 'dd/MM/yyyy HH:mm' }}</td>
      </ng-container>
      <ng-container matColumnDef="pet">
        <th mat-header-cell *matHeaderCellDef>Mascota</th>
        <td mat-cell *matCellDef="let a">{{ a.petName }}</td>
      </ng-container>
      <ng-container matColumnDef="veterinarian">
        <th mat-header-cell *matHeaderCellDef>Veterinario</th>
        <td mat-cell *matCellDef="let a">{{ a.veterinarianName }}</td>
      </ng-container>
      <ng-container matColumnDef="reason">
        <th mat-header-cell *matHeaderCellDef>Motivo</th>
        <td mat-cell *matCellDef="let a">{{ a.reason }}</td>
      </ng-container>
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let a">{{ a.status }}</td>
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
export class AppointmentList implements OnInit {
  private readonly service = inject(AppointmentService);

  protected readonly appointments = signal<Appointment[]>([]);
  protected readonly columns = ['scheduledAt', 'pet', 'veterinarian', 'reason', 'status'];

  ngOnInit(): void {
    this.service.getAll().subscribe((items) => this.appointments.set(items));
  }
}
