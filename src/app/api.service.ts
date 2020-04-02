import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Lot } from './/lot';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getCurrentLot(): Observable<Lot> {

  return this.http.get<Lot>(environment.baseUrl+'/lots/running');
  }
}