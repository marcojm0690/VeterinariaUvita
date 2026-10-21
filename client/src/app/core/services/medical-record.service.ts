import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MedicalRecord, MedicalRecordRequest } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class MedicalRecordService extends CrudService<MedicalRecord, MedicalRecordRequest> {
  protected readonly resource = 'medical-records';

  getByPet(petId: number): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${environment.apiUrl}/pets/${petId}/medical-records`);
  }
}
