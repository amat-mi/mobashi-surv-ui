import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveySummaryPageRoutingModule } from './survey-summary-routing.module';

import { SurveySummaryPage } from './survey-summary.page';
import { TranslocoModule } from '@ngneat/transloco';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslocoModule,
    SurveySummaryPageRoutingModule
  ],
  declarations: [SurveySummaryPage]
})
export class SurveySummaryPageModule { }
