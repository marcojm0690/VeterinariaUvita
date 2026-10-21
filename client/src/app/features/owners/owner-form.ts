import { Component, inject, input, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { OwnerService } from '../../core/services/owner.service';

@Component({
  selector: 'app-owner-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink],
  template: `
    <h1>{{ id() ? 'Editar dueño' : 'Nuevo dueño' }}</h1>

    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-form-field>
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="firstName" />
        <mat-error>Requerido</mat-error>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Apellidos</mat-label>
        <input matInput formControlName="lastName" />
        <mat-error>Requerido</mat-error>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Correo</mat-label>
        <input matInput type="email" formControlName="email" />
        <mat-error>Ingrese un correo válido</mat-error>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Teléfono</mat-label>
        <input matInput formControlName="phone" />
        <mat-error>Requerido</mat-error>
      </mat-form-field>
      <mat-form-field>
        <mat-label>Dirección</mat-label>
        <input matInput formControlName="address" />
      </mat-form-field>

      <div class="actions">
        <a mat-button routerLink="/owners">Cancelar</a>
        <button mat-flat-button type="submit" [disabled]="form.invalid">Guardar</button>
      </div>
    </form>
  `,
  styles: `
    form {
      display: flex;
      flex-direction: column;
      max-width: 480px;
    }
    .actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  `,
})
export class OwnerForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(OwnerService);
  private readonly router = inject(Router);

  /** Bound from the `:id` route param (withComponentInputBinding). */
  readonly id = input<string>();

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: [''],
  });

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.service.getById(Number(id)).subscribe((owner) => this.form.patchValue({ ...owner, address: owner.address ?? '' }));
    }
  }

  protected save(): void {
    if (this.form.invalid) return;

    const id = this.id();
    const request = this.form.getRawValue();
    const result$: Observable<unknown> = id ? this.service.update(Number(id), request) : this.service.create(request);
    result$.subscribe(() => this.router.navigate(['/owners']));
  }
}
