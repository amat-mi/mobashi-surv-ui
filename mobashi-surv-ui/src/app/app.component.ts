import { Component, Inject, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

import { OicomIconService } from './contrib/oicom-icon/oicom-icon.service';
import { ToastService } from './contrib/core/toast.service';
import { LangService } from './contrib/lang/lang.service';
import { ThemeService } from './contrib/theme/theme.service';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { MapQuestionComponent } from './survey/map-question/map-question.component';
import { MapService } from './contrib/map/map.service';
import { CityService } from './city/city.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  //This is needed!!!
  //see: https://surveyjs.io/form-library/documentation/customize-question-types/third-party-component-integration-angular
  static declaration = [MapQuestionComponent];

  readonly pagesLinks$: Observable<any>;            //not actually used
  readonly settingslinks$: Observable<any>;         //not actually used
  readonly selectedCity$ = this.cityService.selectedCity$;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private platform: Platform,
    private zone: NgZone,
    private titleService: Title,
    public router: Router,
    public tr: LangService,         //MUST be here and be public for template to use!!!
    private iconService: OicomIconService,
    private themeService: ThemeService,         //this MUST be here for the service to initialize when App starts
    private toastService: ToastService,
    private mapService: MapService,         //this MUST be here for the service to initialize when App starts
    private cityService: CityService
  ) {
    this.pagesLinks$ = of(this.router.config.filter(
      (route) => !!route.data && !route.data['isSettings']));
    this.settingslinks$ = of(this.router.config.filter(
      (route) => !!route.data && !!route.data['isSettings']));

    this.initializeApp();
  }

  initializeApp() {
    //at startup retrieve session data from server, and only after that initializa the App
    this.platform.ready().then(() => {
      this.selectedCity$.subscribe((city) => {
        if (city.name) {
          this.titleService.setTitle(city.name);
        }

        if (city.favIcon) {
          const favIcon = this.document.getElementById('appIcon') as HTMLLinkElement;
          favIcon.type = city.favIcon.type ?? favIcon.type
          favIcon.href = city.favIcon.href ?? favIcon.href
        }
      });

      const icons = [
        'arrow-back', 'close', 'search', 'checkmark', 'checkmark-done',
        'chevron-back', 'chevron-forward', 'close-circle', 'exit',
        'caret-up', 'caret-down',         //md
        'chevron-up', 'chevron-down',     //ios
        'arrow-forward',
        'refresh',
        'language',
        'key',
        'eye', 'eye-off',
        'expand', 'contract',
        'information', 'information-circle',
        'alert-circle', 'checkmark-circle',
        'square', 'checkbox', 'radio-button-off', 'radio-button-on',
        'log-in', 'log-out',
        'shield-checkmark',
        'call', 'globe', 'mail', 'navigate', 'person', 'settings', 'share', 'share-social',
        'heart', 'bicycle', 'fast-food', 'restaurant', 'home',
        //'storefront',           //this is NOT present in Ionicons 5.0.1 (it is present in Ionicons 5.5.2)
        'notifications',
        'calculator',
        'qr-code', 'scan', 'flash', 'flash-off', 'camera-reverse',
        'basket', 'cart', 'send', 'time',
        'list', 'receipt', 'wallet', 'cash', 'card', 'newspaper',
        'add', 'remove', 'pencil', 'add-circle', 'remove-circle', 'trash',
        'filter',
        'eyedrop', 'flag', 'school', 'lock-closed'
      ];
      this.iconService.addIcons(icons, 'outline');

      const logos = [
        'logo-apple', 'logo-facebook', 'logo-google', 'logo-twitter'
      ];
      this.iconService.addIcons(logos);       //can't specify a prefer for logos

      //at startup initialize Lang service to have all Lang translations files preloaded and active Lang set
      this.tr.init().then(() => {
        App.addListener('appUrlOpen', (data: any) => {
          this.zone.run(() => {
          });
        });

        this.toastService.setDefaultDurationError(0);       //by default do NOT close Error Toast automatically
        this.toastService.setTranslateSuccess('SUCCESS');   //use translations for Success Toast
        this.toastService.setTranslateError('ERROR');       //use translations for Error Toast
      });
    });
  }
}
