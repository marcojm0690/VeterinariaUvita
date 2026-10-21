import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
  {
    path: 'owners',
    children: [
      { path: '', loadComponent: () => import('./features/owners/owner-list').then((m) => m.OwnerList) },
      { path: 'new', loadComponent: () => import('./features/owners/owner-form').then((m) => m.OwnerForm) },
      { path: ':id', loadComponent: () => import('./features/owners/owner-form').then((m) => m.OwnerForm) },
    ],
  },
  { path: 'pets', loadComponent: () => import('./features/pets/pet-list').then((m) => m.PetList) },
  {
    path: 'veterinarians',
    loadComponent: () => import('./features/veterinarians/veterinarian-list').then((m) => m.VeterinarianList),
  },
  {
    path: 'appointments',
    loadComponent: () => import('./features/appointments/appointment-list').then((m) => m.AppointmentList),
  },
  { path: '**', redirectTo: '' },
];
