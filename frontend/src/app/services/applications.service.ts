import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Application,
  ApplicationStats,
  ApplicationStatus,
  CreateApplicationPayload,
} from '../models/application.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly API = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  getAll(status?: ApplicationStatus): Observable<Application[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Application[]>(this.API, { params });
  }

  getOne(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.API}/${id}`);
  }

  create(payload: CreateApplicationPayload): Observable<Application> {
    return this.http.post<Application>(this.API, payload);
  }

  update(id: string, payload: Partial<CreateApplicationPayload>): Observable<Application> {
    return this.http.patch<Application>(`${this.API}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  getStats(): Observable<ApplicationStats> {
    return this.http.get<ApplicationStats>(`${this.API}/stats`);
  }
}
