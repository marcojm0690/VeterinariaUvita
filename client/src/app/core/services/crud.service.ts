import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/** Base class with the CRUD calls shared by every resource of the API. */
export abstract class CrudService<TModel, TRequest> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly resource: string;

  protected get url(): string {
    return `${environment.apiUrl}/${this.resource}`;
  }

  getAll(): Observable<TModel[]> {
    return this.http.get<TModel[]>(this.url);
  }

  getById(id: number): Observable<TModel> {
    return this.http.get<TModel>(`${this.url}/${id}`);
  }

  create(request: TRequest): Observable<TModel> {
    return this.http.post<TModel>(this.url, request);
  }

  update(id: number, request: TRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
