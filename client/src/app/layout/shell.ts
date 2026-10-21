import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly links = [
    { path: '/', label: 'Inicio', icon: 'home', exact: true },
    { path: '/owners', label: 'Dueños', icon: 'people', exact: false },
    { path: '/pets', label: 'Mascotas', icon: 'pets', exact: false },
    { path: '/veterinarians', label: 'Veterinarios', icon: 'medical_services', exact: false },
    { path: '/appointments', label: 'Citas', icon: 'event', exact: false },
  ];
}
