import { Component, OnInit } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { Device, DeviceInfo } from '@capacitor/device';
import { App, AppInfo } from '@capacitor/app';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  readonly deviceInfo$: Observable<DeviceInfo>;
  readonly appInfo$: Observable<AppInfo>;

  constructor() {
    this.deviceInfo$ = from(Device.getInfo());
    if (Capacitor.isNativePlatform())
      this.appInfo$ = from(App.getInfo());
    else
      this.appInfo$ = of<AppInfo>({} as unknown as AppInfo);
  }

  ngOnInit() {
  }

}
