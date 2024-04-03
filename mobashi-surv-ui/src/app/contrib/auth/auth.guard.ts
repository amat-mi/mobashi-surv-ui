import { Inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('app.config') private appConfig: any,
    private router: Router,
    private authApi: AuthService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const data = this.authApi.userdata['data'];       //must use the snchronous version of the data

    //if guarding the Login page itself, can activate only if stored JWT token is NOT present, otherwise don't move
    //HACK!!! URLs should come from config, or something!!!
    if (state.url == '/login' || state.url == '/auth')
      return !data;

    //can activate only if stored JWT token is present, otherwise go to Login page, after storing the target URL
    if (!!data)
      return true;

    this.authApi.setNextUrl(state.url);

    return this.router.parseUrl(this.appConfig.AFTER_LOGOUT_URL ?? '/login');
  }

}
