import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveyHomePage } from './survey-home.page';

const routes: Routes = [
  {
    path: '',
    component: SurveyHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveyHomePageRoutingModule {}
