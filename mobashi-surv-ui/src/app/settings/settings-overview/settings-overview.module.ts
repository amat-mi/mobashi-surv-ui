import { TranslocoModule } from '@ngneat/transloco';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsOverviewComponent } from './settings-overview.component';
import { LangOverviewComponentModule } from '../../contrib/lang/lang-overview/lang-overview.module';
import { AuthOverviewComponentModule } from '../../contrib/auth/auth-overview/auth-overview.module';


@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TranslocoModule,
    LangOverviewComponentModule,
    AuthOverviewComponentModule
  ],
  declarations: [SettingsOverviewComponent],
  exports: [SettingsOverviewComponent]
})
export class SettingsOverviewComponentModule { }
