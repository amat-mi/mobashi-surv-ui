import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { NgxMapLibreGLModule } from '@maplibre/ngx-maplibre-gl';

import { MapComponent } from './map.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxMapLibreGLModule,
  ],
  declarations: [MapComponent],
  exports: [MapComponent]
})
export class MapComponentModule { }
