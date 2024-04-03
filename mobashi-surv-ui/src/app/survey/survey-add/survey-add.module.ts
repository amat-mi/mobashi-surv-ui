import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SurveyAddPageRoutingModule } from './survey-add-routing.module';

import { SurveyAddPage } from './survey-add.page';
import { TranslocoModule } from '@ngneat/transloco';
import { LangSelectorComponentModule } from 'src/app/contrib/lang/lang-selector/lang-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslocoModule,
    SurveyAddPageRoutingModule,
    LangSelectorComponentModule
  ],
  declarations: [SurveyAddPage]
})
export class SurveyAddPageModule { }
