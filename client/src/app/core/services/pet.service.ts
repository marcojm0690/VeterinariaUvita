import { Injectable } from '@angular/core';

import { Pet, PetRequest } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class PetService extends CrudService<Pet, PetRequest> {
  protected readonly resource = 'pets';
}
