import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, RouterLink],
  template: `
    <h1>Bienvenido</h1>
    <div class="cards">
      @for (item of items; track item.path) {
        <a [routerLink]="item.path" class="card-link">
          <mat-card appearance="outlined">
            <mat-card-header>
              <mat-icon mat-card-avatar>{{ item.icon }}</mat-icon>
              <mat-card-title>{{ item.label }}</mat-card-title>
            </mat-card-header>
          </mat-card>
        </a>
      }
    </div>
  `,
  styles: `
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 16px;
    }
    .card-link {
      text-decoration: none;
      color: inherit;
    }
  `,
})
export class Home {
  protected readonly items = [
    { path: '/owners', label: 'Dueños', icon: 'people' },
    { path: '/pets', label: 'Mascotas', icon: 'pets' },
    { path: '/veterinarians', label: 'Veterinarios', icon: 'medical_services' },
    { path: '/appointments', label: 'Citas', icon: 'event' },
  ];
}
