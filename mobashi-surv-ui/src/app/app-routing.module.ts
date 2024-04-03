import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './contrib/auth/auth.guard';


const routes: Routes = [
  {
    path: 'login',
    children: [
      {
        path: '',
        loadChildren: () => import('./contrib/auth/auth.module').then(m => m.AuthModule)
      }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    data: {
      key: 'SETTINGS.MENUTITLE',
      icon: 'cog',
      isSettings: true
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
      }
    ],
  },
  {
    path: 'scan',
    loadChildren: () => import('./scan/scan.module').then(m => m.ScanModule)
  },
  {
    path: 'survey',
    children: [
      {
        path: '',
        loadChildren: () => import('./survey/survey.module').then(m => m.SurveyModule)
      }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'surveyadd',
    loadChildren: () => import('./survey/survey-add/survey-add.module').then(m => m.SurveyAddPageModule)
  },
  {
    path: '',
    redirectTo: '/survey',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
