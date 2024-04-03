import { Component, OnInit } from '@angular/core';
import { LangService } from '../../lang/lang.service';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrls: ['./auth-settings.component.scss'],
})
export class AuthSettingsComponent implements OnInit {
  userdata$ = this.authApi.userdata$;

  constructor(
    public tr: LangService,         //MUST be here and be public for template to use!!!
    private authApi: AuthService
  ) { }

  ngOnInit() { }

  public logout() {
    this.authApi.logout();
  }

}
