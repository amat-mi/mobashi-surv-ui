import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SurveyModule as SurveyJS } from "survey-angular-ui";

import { SurveyPageRoutingModule } from './survey-routing.module';
import { SurveyPage } from './survey.page';
import { TranslocoModule } from '@ngneat/transloco';
import { MapComponentModule } from 'src/app/contrib/map/map/map.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslocoModule,
    SurveyJS,
    SurveyPageRoutingModule,
    MapComponentModule
  ],
  declarations: [SurveyPage]
})
export class SurveyPageModule { }
