import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LangSelectorComponent } from './lang-selector.component';

@NgModule({
  imports: [ CommonModule, FormsModule,IonicModule,],
  declarations: [LangSelectorComponent],
  exports: [LangSelectorComponent]
})
export class LangSelectorComponentModule {}
