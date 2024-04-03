import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SurveySummaryPage } from './survey-summary.page';

const routes: Routes = [
  {
    path: '',
    component: SurveySummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SurveySummaryPageRoutingModule {}
