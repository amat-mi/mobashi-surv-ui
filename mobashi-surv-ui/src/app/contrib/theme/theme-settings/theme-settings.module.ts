import { TranslocoModule } from '@ngneat/transloco';
import { ThemeSelectorComponentModule } from './../theme-selector/theme-selector.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemeSettingsComponent } from './theme-settings.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, TranslocoModule, ThemeSelectorComponentModule],
  declarations: [ThemeSettingsComponent],
  exports: [ThemeSettingsComponent]
})
export class ThemeSettingsComponentModule {}
