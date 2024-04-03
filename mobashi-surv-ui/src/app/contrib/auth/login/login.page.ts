import { PopoverController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { LangService } from '../../lang/lang.service';
import { LangSelectorComponent } from '../../lang/lang-selector/lang-selector.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username: string | undefined;
  password: string | undefined;

  constructor(
    public tr: LangService,         //MUST be here and be public for template to use!!!
    private authApi: AuthService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.username = undefined;
    this.password = undefined;
  }

  public login() {
    this.authApi.login(this.username, this.password);
  }

  public async presentLangPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: LangSelectorComponent,
      event: ev,
      translucent: true
    });

    return await popover.present();
  }
}
