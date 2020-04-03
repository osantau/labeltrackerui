import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Lot } from './model/lot';
import { Label } from './model/label';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as ExcelProper from 'exceljs';
import * as fs from 'file-saver';


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
    return this.http.get<Label[]>(environment.baseUrl + '/labels/bylot?lotId=' + pLotId);
  }

  async downLoadLabelsforLot(pLotId: number) {
    let lot = await this.http.get<Lot>(environment.baseUrl + '/lots/single/' + pLotId).toPromise();
    let labels: Label[] = await this.getLabelsByLot(pLotId).toPromise();

    let workbook: ExcelProper.Workbook = new Excel.Workbook();
    let ws = workbook.addWorksheet(lot.lotno);
    ws.addRow(['Nr.Crt', 'Eticheta', 'Creat', 'Se repeta', 'Erorare']);

    let nrCrt = 1;
    labels.forEach((lbl) => {
      ws.addRow([nrCrt, lbl.label, lbl.created, lbl.repeated, lbl.error])
      nrCrt++;
    });
    workbook.xlsx.writeBuffer().then((buf)=>{
      fs.saveAs( new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), lot.lotno + '.xlsx');
    });


  }
}
