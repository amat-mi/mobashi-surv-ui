import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../contrib/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./survey-home/survey-home.module').then(m => m.SurveyHomePageModule)
  },
  {
    path: ':id/summary',
    loadChildren: () => import('./survey-summary/survey-summary.module').then(m => m.SurveySummaryPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: ':id',
    loadChildren: () => import('./survey/survey.module').then(m => m.SurveyPageModule),
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SurveyRoutingModule { }
