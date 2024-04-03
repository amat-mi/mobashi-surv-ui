import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurveyRoutingModule } from './survey-routing.module';
import { MapQuestionComponentModule } from './map-question/map-question.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SurveyRoutingModule,
    MapQuestionComponentModule,
  ]
})
export class SurveyModule { }
