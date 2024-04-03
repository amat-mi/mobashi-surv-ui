import { LangSelectorComponentModule } from './../lang/lang-selector/lang-selector.module';
import { LangModule } from './../lang/lang.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPage } from './login/login.page';
import { TranslocoModule } from '@ngneat/transloco';
import { LangSelectorComponent } from '../lang/lang-selector/lang-selector.component';


@NgModule({
  declarations: [
    LoginPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthRoutingModule,
    TranslocoModule,
    LangModule,
    LangSelectorComponentModule
  ]
})
export class AuthModule { }
