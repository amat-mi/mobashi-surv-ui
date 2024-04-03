import { TranslocoModule } from '@ngneat/transloco';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LangOverviewComponent } from './lang-overview.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, TranslocoModule],
  declarations: [LangOverviewComponent],
  exports: [LangOverviewComponent]
})
export class LangOverviewComponentModule {}
