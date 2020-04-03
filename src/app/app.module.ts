import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { NotifierModule }  from 'angular-notifier';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    DataTablesModule,
    NotifierModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
