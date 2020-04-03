import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Lot } from './model/lot';
import { Label } from './model/label';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getCurrentLot(): Observable<Lot> {

    return this.http.get<Lot>(environment.baseUrl + '/lots/running');
  }

  getCurrentLotLabels(): Observable<Label[]> {
    return this.http.get<Label[]>(environment.baseUrl + '/labels');
  }

  addLot(info: string): Observable<Lot> {
    return this.http.post<Lot>(environment.baseUrl + '/lots', { lotno: info }, this.httpOptions);
  }

  getClosedLots(): Observable<Lot[]> {
    return this.http.get<Lot[]>(environment.baseUrl + '/lots/all');
  }

  getLabelsByLot(pLotId: number): Observable<Label[]> {
    return this.http.get<Label[]>(environment.baseUrl+'/labels/bylot?lotId=' + pLotId);
  }
}
