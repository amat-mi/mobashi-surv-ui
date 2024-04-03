import { TranslocoModule } from '@ngneat/transloco';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemeOverviewComponent } from './theme-overview.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, TranslocoModule],
  declarations: [ThemeOverviewComponent],
  exports: [ThemeOverviewComponent]
})
export class ThemeOverviewComponentModule {}
