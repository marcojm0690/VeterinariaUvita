import { Injectable } from '@angular/core';

import { Owner, OwnerRequest } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class OwnerService extends CrudService<Owner, OwnerRequest> {
  protected readonly resource = 'owners';
}
