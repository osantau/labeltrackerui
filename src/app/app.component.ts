import { Component, OnInit, OnDestroy } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { ApiService } from '../app/api.service';
import { Lot } from './model/lot';
import { Label } from './model/label';
import { Subject } from 'rxjs';
import { NotifierService } from 'angular-notifier';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  myWebSocket: WebSocketSubject<any> = webSocket(environment.wsUrl);
  currentLot: Lot;
  newLabel: Label;
  labels: Label[] = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  notifier: NotifierService;

  constructor(private apiService: ApiService, private notifierService: NotifierService) {

    this.notifier = notifierService;
    this.apiService.getCurrentLot().subscribe((data) => {
      this.currentLot = data;
    }, error => {
      console.log(error);
    });

    this.myWebSocket.asObservable().subscribe((data) => {
      if (data.lot) {
        this.currentLot = data.lot[0];
      }
      if (data.label) {
        this.newLabel = data.label[0];
        const tmp = this.newLabel;
        this.labels.forEach(function(val){
          if (val.label === tmp.label) {
            val.repeated = tmp.repeated;
            val.error = tmp.error;
          }
        });
        this.labels.push(tmp);

        if(tmp.repeated ==='Y' && tmp.error==='N') {
          this.notifier.notify('warning', tmp.label +' se repeta !');
        } else if(tmp.error==='Y') {
          this.notifier.notify('error', 'A aparut o eroare !');
        } else if(tmp.repeated ==='N'  && tmp.error==='N'){
          this.notifier.notify('success', tmp.label + ' ok !');
        }
      }
    });
  }

  ngOnInit(): void {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      dom: 'Bfrtip',
      order: [[1,'desc']],
      buttons: [
         'excel',
         'csv',
         'print'
      ]
    };

    this.apiService.getCurrentLotLabels().subscribe((data) => {
      this.labels = data;
      this.dtTrigger.next();
    });

  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
}
