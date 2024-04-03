import { TranslocoService } from '@ngneat/transloco';
import { ToastService } from '../core/toast.service';
import { Router } from '@angular/router';
import { Injectable, Inject } from '@angular/core';

import { JwtHelperService } from "@auth0/angular-jwt";
import { Observable } from 'rxjs';
import { FeathersService } from '../feathers/feathers.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private storageKey = this.appConfig.APPNAME + ':auth-username';
  private readonly loginService: any;
  private readonly usersService: any;
  private readonly userdataService: any;

  public readonly userdata$ = this.api.select(['userdata', 'data', 'data']);       //directly get the User's data
  public readonly userdata = {} as { [key: string]: any };
  public readonly getUsername = () => this.storage.get(this.storageKey);

  constructor(
    @Inject('app.config') private appConfig: any,
    private tr: TranslocoService,
    public api: FeathersService,
    private storage: StorageService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.loginService = this.api.createRestService('/login',
      this.appConfig.HOST, 'auth/token/login/');
    this.api.attachSavingLoader('login');         //present Loader while saving
    this.api.attachErrorToast('login', { duration: 0 });           //present Toast if error (with no autoclosing)

    this.usersService = this.api.createRestService('/users',
      this.appConfig.HOST, 'auth/users/');
    this.api.attachSavingLoader('users');         //present Loader while saving
    this.api.attachErrorToast('users', { duration: 0 });           //present Toast if error (with no autoclosing)

    //Create a service to locally store User data, and ensure the one and only record actually exists for it
    this.userdataService = this.api.createStorageService('/userdata',
      this.appConfig.APPNAME + ':auth-userdata');
    this.userdataService.get('key').catch((error: any) => {
      this.userdataService.create({ id: 'key' });
    });
  }

  public async didLogin(promise: Promise<any>) {
    return await promise
      .then((resp: { value: any; }) => {
        //mangle received data to be in a different format:
        //FROM
        //  {
        //    "token": token (it may be a true JWT token)
        //  }
        //TO:
        //  {
        //    "token": token
        //    "data": {
        //      "key": token
        //    }
        //  }
        //FROM
        //  {
        //    "auth_token": token
        //  }
        //TO:
        //  {
        //    "auth_token": token
        //    "data": {
        //      "key": token
        //    }
        //  }
        //also remove the "value" part, if any (i.e. data.value => data)
        let data = !!resp.value ? resp.value : resp;
        if (!data.data)
          data.data = { key: data.auth_token ?? data.token };

        //locally store the User data received from server, 
        //as a simple Object too, for Interceptors to have it available synchronously
        //MUST store User data as simple Object BEFORE anything else, 
        //or it won't be immediately available synchronously (i.e. to AuthGuard)
        Object.keys(data).forEach((key) => { this.userdata[key] = data[key] });

        //ask server for User's data
        this.usersService.get('me')
          .then((resp: { value: any; }) => {
            let user = !!resp.value ? resp.value : resp;

            Object.keys(user).forEach((key) => { data.data[key] = user[key] });

            console.log('authenticated:', data);

            //no need to actually show anything
            //this.toastService.presentSuccess(data);

            //store the username for it to be sent along when needed
            this.storage.set(this.storageKey, data.data.username).then(() => {
              //use "patch()" here, store object data, preserving any existing field (i.e. "nextUrl")
              this.userdataService.patch('key', data).then((data: any) => {
                //if there is a next URL stored, clear it and then navigate to it
                if (!!data.value.nextUrl) {
                  const nextUrl = data.value.nextUrl;           //MUST use value here!!!
                  this.clearNextUrl().then((data: any) => {
                    this.router.navigateByUrl(nextUrl, { replaceUrl: true });       //remove Login page URL from history
                  });
                } else if (this.appConfig.AFTER_LOGIN_URL)        //if configuration specifies an URL, navigate to it
                  this.router.navigateByUrl(this.appConfig.AFTER_LOGIN_URL, { replaceUrl: true });       //remove Login page URL from history
              });
            });
          });
      })
      .catch((error: any) => {
        console.log('unauthorized:', error);

        //HACK!!! Maybe should not bother with presentation matters here!!!
        this.toastService.presentError(this.tr.translate('AUTH.INVALIDLOGIN'));
        this.logout();

        throw error;        //let the error pass through
      });
  }

  private async _login(username: string, password: string) {
    return this.didLogin(this.loginService.create({ username, password }));
  }

  /**
   * If both parameters are specified, do a true login with server.
   * Otherwise, make the locally stored User data available synchronously for HTTP Interceptors to use.
   * 
   * @param username 
   * @param password
   */
  public async login(username?: string, password?: string) {
    if (!!username && !!password)
      return this._login(username, password);

    return this.userdataService.get('key')
      .then((data: { value: { [x: string]: any; }; }) => {
        Object.keys(data.value).forEach((key) => { this.userdata[key] = data.value[key] });
      })
      .catch((error: any) => {        //it may not exists, already
        this.userdataService.create({ id: 'key' });
      });
  }

  /**
   * Remove the locally stored User data.
   * The User data is also removed from the synchronous version used by HTTP Interceptors.
   */
  public async logout() {
    //MUST remove User data as simple Object to make it immediately NOT available synchronously anymore
    Object.keys(this.userdata).forEach((key) => { delete this.userdata[key] });

    //remove the username
    await this.storage.remove(this.storageKey);

    //use "update()" here, to completely replace the stored object
    return this.userdataService.update('key', {}).then((data: any) => {
      //if configuration specifies an URL, navigate to it
      if (this.appConfig.AFTER_LOGOUT_URL)
        this.router.navigateByUrl(this.appConfig.AFTER_LOGOUT_URL);
    });
  }

  /**
   * Store specified URL as the next to go to after successful Login together with the other user data.
   * 
   * @param url The next URL to navigate to
   */
  public async setNextUrl(url: string) {
    //use "patch()" here, to add a single field to the stored object
    return this.userdataService.patch('key', { nextUrl: url });
  }

  /**
   * Remove stored next URL to go to after successful Login from user data.
   */
  public async clearNextUrl() {
    //use "patch()" here, to remove a single field from the stored object
    return this.userdataService.patch('key', { nextUrl: undefined });
  }
}
