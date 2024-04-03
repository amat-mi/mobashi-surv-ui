import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MapQuestionComponent } from './map-question.component';
import { MapComponentModule } from 'src/app/contrib/map/map/map.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapComponentModule,
  ],
  declarations: [MapQuestionComponent],
  exports: [MapQuestionComponent]
})
export class MapQuestionComponentModule { }
