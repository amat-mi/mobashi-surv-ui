import { LangSelectorComponentModule } from './../lang-selector/lang-selector.module';
import { TranslocoModule } from '@ngneat/transloco';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LangSettingsComponent } from './lang-settings.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, TranslocoModule, LangSelectorComponentModule],
  declarations: [LangSettingsComponent],
  exports: [LangSettingsComponent]
})
export class LangSettingsComponentModule {}
