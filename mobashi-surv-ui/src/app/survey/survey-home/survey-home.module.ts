import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveyHomePageRoutingModule } from './survey-home-routing.module';

import { SurveyHomePage } from './survey-home.page';
import { TranslocoModule } from '@ngneat/transloco';
import { LangSelectorComponentModule } from 'src/app/contrib/lang/lang-selector/lang-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslocoModule,
    SurveyHomePageRoutingModule,
    LangSelectorComponentModule
  ],
  declarations: [SurveyHomePage]
})
export class SurveyHomePageModule { }
