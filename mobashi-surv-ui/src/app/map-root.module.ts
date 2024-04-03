import { NgModule } from '@angular/core';
import { MapModule } from './contrib/map/map.module';
import { provideMapService } from './contrib/map/map.service';

import {CONFIG} from './local_configs/map'


@NgModule({
  exports: [MapModule],
  providers: [
    provideMapService(CONFIG)
  ]
})
export class MapRootModule { }
