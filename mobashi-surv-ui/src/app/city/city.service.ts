import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APP_CONFIG, AppConfig } from '../app.config';


@Injectable({
  providedIn: 'root'
})
export class CityService {
  readonly selectedCity$$ = new BehaviorSubject<any>(null);
  readonly selectedCity$ = this.selectedCity$$.asObservable();

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
  ) {
    this.selectedCity$$.next({
      name: this.appConfig["TITLE"],
      immagine_small: this.appConfig["LOGO"],
      favIcon: this.appConfig["FAVICON"]
    });
  }
}
