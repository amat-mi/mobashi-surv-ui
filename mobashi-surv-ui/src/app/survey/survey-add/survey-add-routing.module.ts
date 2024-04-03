import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyAddPage } from './survey-add.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyAddPage
  },
  {
    path: ':code',
    component: SurveyAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyAddPageRoutingModule { }
