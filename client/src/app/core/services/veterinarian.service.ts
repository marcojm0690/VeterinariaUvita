import { Injectable } from '@angular/core';

import { Veterinarian, VeterinarianRequest } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class VeterinarianService extends CrudService<Veterinarian, VeterinarianRequest> {
  protected readonly resource = 'veterinarians';
}
