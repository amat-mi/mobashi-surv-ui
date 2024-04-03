import { TranslocoModule } from '@ngneat/transloco';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthOverviewComponent } from './auth-overview.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, TranslocoModule],
  declarations: [AuthOverviewComponent],
  exports: [AuthOverviewComponent]
})
export class AuthOverviewComponentModule {}
