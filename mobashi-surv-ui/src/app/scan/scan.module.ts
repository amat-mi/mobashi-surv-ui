import { TranslocoModule } from '@ngneat/transloco';
import { ScanPage } from './scan/scan.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ScanPageRoutingModule } from './scan-routing.module';



@NgModule({
  declarations: [ScanPage],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslocoModule,
    ScanPageRoutingModule
  ]
})
export class ScanModule { }
