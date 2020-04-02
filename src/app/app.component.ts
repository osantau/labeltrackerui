import { Component, OnInit } from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { ApiService } from '../app/api.service';
import { Lot } from './lot';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  myWebSocket: WebSocketSubject = webSocket(environment.wsUrl);
  currentLot: Lot;
  total = 0;
  repeats = 0;
  errors = 0;
  viables = 0;

  constructor(private apiService: ApiService) {
    apiService.getCurrentLot().subscribe((data)=>{
      this.currentLot = data;
    });

    this.myWebSocket.asObservable().subscribe((data)=>{
      if (data.lot && data.label) {
        this.currentLot = JSON.parse(data.lot);
        console.log(this.currentLot);
      }
    })
  }
  ngOnInit(): void {
  }
}
