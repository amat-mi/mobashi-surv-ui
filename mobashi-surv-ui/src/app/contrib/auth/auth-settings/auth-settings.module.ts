import { TranslocoModule } from '@ngneat/transloco';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthSettingsComponent } from './auth-settings.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, TranslocoModule],
  declarations: [AuthSettingsComponent],
  exports: [AuthSettingsComponent]
})
export class AuthSettingsComponentModule {}
