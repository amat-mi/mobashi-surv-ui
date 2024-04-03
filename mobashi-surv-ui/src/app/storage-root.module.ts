import { NgModule } from '@angular/core';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { StorageModule } from './contrib/storage/storage.module';


@NgModule({
  exports: [StorageModule],
  imports: [
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
    })
  ]
})
export class StorageRootModule { }
