import { Injectable } from '@angular/core';

import { Appointment, AppointmentRequest } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService extends CrudService<Appointment, AppointmentRequest> {
  protected readonly resource = 'appointments';
}
