import { APP_INITIALIZER, InjectionToken, NgModule, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TranslocoRootModule } from './transloco-root.module';
import { StorageRootModule } from './storage-root.module';
import { LangOverviewComponentModule } from './contrib/lang/lang-overview/lang-overview.module';
import { ThemeOverviewComponentModule } from './contrib/theme/theme-overview/theme-overview.module';
import { NgReduxModule } from './contrib/store/src/ng-redux.module';
import { DjangoKeyInterceptor } from './contrib/core/django-key-interceptor';
import { FeathersDRFInterceptor } from './contrib/core/feathersdrf.interceptor';
import { AuthService } from './contrib/auth/auth.service';
import { ThemeRootModule } from './theme-root.module';
import { APP_CONFIG } from './app.config';

import { CONFIG } from './local_configs/app';
import { MapRootModule } from './map-root.module';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgReduxModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    TranslocoRootModule,
    StorageRootModule,
    ThemeRootModule,
    MapRootModule,
    LangOverviewComponentModule,
    ThemeOverviewComponentModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: DjangoKeyInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: FeathersDRFInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { dateFormat: 'yyyy/MM/dd HH:mm' } },
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const authApi = inject(AuthService);
        return () => authApi.login();
      },
      multi: true
    },
    {
      provide: APP_CONFIG,
      useValue: Object.assign({
        APPNAME: 'mobashi-surv-ui',
        HOST: 'http://localhost:4002',
        AFTER_LOGIN_URL: '/survey',
        AFTER_LOGOUT_URL: "/surveyadd",
        TITLE: "AMAT Milano",
        LOGO: {
          url: "assets/logo.png",
          width: 194,
          height: 77
        },
        FAVICON: {
          type: "image/x-icon",
          href: "assets/icon/favicon.ico"
        }
      }, CONFIG ?? {})
    },
    {
      provide: 'app.config',
      useExisting: APP_CONFIG
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
