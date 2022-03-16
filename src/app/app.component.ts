import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
import { ApiService } from '../app/api.service';
import { Lot } from './model/lot';
import { Label } from './model/label';
import { Subject } from 'rxjs';
import { NotifierService } from 'angular-notifier';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {DataTableDirective} from 'angular-datatables';
import { Howl } from 'howler';
import { HttpDownloadProgressEvent } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  myWebSocket: WebSocketSubject<any> = webSocket(environment.wsUrl);
  currentLot: Lot;
  newLabel: Label;
  labels: Label[] = [];
  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject();
  notifier: NotifierService;
  angForm: FormGroup;
  oldLots: Lot[] = [];
  dtOptions2: any = {};
  dtTrigger2: Subject<any> = new Subject();

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  constructor(private apiService: ApiService, private notifierService: NotifierService, private fb: FormBuilder) {

    this.notifier = notifierService;
    this.apiService.getCurrentLot().subscribe((data) => {
      this.currentLot = data;
    }, error => {
      console.log(error);
    });

    let soundRepeat = new Howl({src:['/assets/audio/beep-02.mp3','/assets/audio/beep-02.wav']});
    let soundError = new Howl({src:['/assets/audio/beep-03.mp3','/assets/audio/beep-03.wav']});
    this.myWebSocket.asObservable().subscribe((data) => {
      if (data.lot) {
        this.currentLot = data.lot[0];
      }
      if (data.label) {
        this.newLabel = data.label[0];
        const tmp = this.newLabel;
        this.labels.forEach(function (val) {
          if (val.label === tmp.label) {
            val.repeated = tmp.repeated;
            val.error = tmp.error;
          }
        });
        if (tmp.repeated === 'Y' && tmp.error === 'N') {
          this.notifier.notify('warning', tmp.label + ' se repeta !');
          soundRepeat.play();
        } else if (tmp.error === 'Y') {
          this.notifier.notify('error', 'A aparut o eroare !');
          soundError.play();
        } else if (tmp.repeated === 'N' && tmp.error === 'N') {
          this.notifier.notify('success', tmp.label + ' ok !');
        }
        this.labels.push(tmp);

        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.ajax.reload();
        });
      }
    });
  }

  ngOnInit(): void {
    this.angForm = this.fb.group({
      name: ['', Validators.required]
    });

    this.dtOptions = {
      ajax: environment.baseUrl + '/labels/assoc',
      pagingType: 'full_numbers',
      pageLength: 20,
      dom: 'Bfrtip',
      order: [[1, 'desc']],
      autoWidth: false,
      buttons: [
        {
          extend: 'excel',
          title: '',
          filename: () =>{return this.currentLot.lotno;},
        //  'csv',
        // 'print'
        }
      ],
      columns: [{
        title: 'Eticheta',
        data: 'label',
        width: "35%"
      }, {
        title: 'Data',
        data: 'created',
        width: "35%"
      }, {
        title: 'Se repeta',
        data: 'repeated',
        width: "15%"
      }, {
        title: 'Eroare',
        data: 'error',
        width: "15%"
      }]
    };

    this.apiService.getCurrentLotLabels().subscribe((data) => {
      this.labels = data;
      this.dtTrigger.next();
    });

    this.dtOptions2 = {
      scrollY: '400px',
      scrollCollapse: true,
      paging: false

    };


    this.apiService.getClosedLots().subscribe((data) => {
      this.oldLots = data;
      this.dtTrigger2.next();
    });
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
    this.dtTrigger2.unsubscribe();
  }

  ngAfterViewInit() {
    //Fix AudioContext initialization in chrome, safari, mobile browsers.
    let elem = document.getElementById('cLot');
    let evt = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
  });
    elem.dispatchEvent(evt);
  }

  onSubmit() {
    if (this.angForm.valid) {
      this.apiService.addLot(this.angForm.value.name).subscribe((val) => {
      this.currentLot = val;
      this.labels = [];
    this.apiService.getClosedLots().subscribe((data)=>{

      this.oldLots = data;
    });
      });
      this.angForm.reset();
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        // Call the dtTrigger to rerender again
        this.dtTrigger.next();
      });
    }
  }

  onLotDownload(id) {

    this.apiService.downLoadLabelsforLot(id);
  }

}
