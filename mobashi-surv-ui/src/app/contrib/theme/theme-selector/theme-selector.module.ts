import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemeSelectorComponent } from './theme-selector.component';

@NgModule({
  imports: [ CommonModule, FormsModule,IonicModule,],
  declarations: [ThemeSelectorComponent],
  exports: [ThemeSelectorComponent]
})
export class ThemeSelectorComponentModule {}
