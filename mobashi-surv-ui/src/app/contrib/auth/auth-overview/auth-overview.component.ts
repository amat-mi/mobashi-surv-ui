import { Component, OnInit } from '@angular/core';
import { LangService } from '../../lang/lang.service';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-auth-overview',
  templateUrl: './auth-overview.component.html',
  styleUrls: ['./auth-overview.component.scss'],
})
export class AuthOverviewComponent implements OnInit {
  userdata$ = this.authApi.userdata$;

  constructor(
    public tr: LangService,         //MUST be here and be public for template to use!!!
    private authApi: AuthService
  ) { }

  ngOnInit() { }

}
