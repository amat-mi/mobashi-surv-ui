import { Injectable, Inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class DjangoKeyInterceptor implements HttpInterceptor {
    constructor(
        @Inject('app.config') private appConfig: any,
        private authApi: AuthService
    ) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if (req.url.indexOf(this.appConfig.HOST) != 0)        //if request not for the right server
            return next.handle(req);        //send received request to the next handler

        const data = this.authApi.userdata['data'];         //must use the snchronous version of the data
        if (!data)           //if stored User data not present
            return next.handle(req);        //send received request to the next handler

        //othewise get the User key from the stored User data,
        //clone the request and set the new header in one step
        //and send cloned request with header to the next handler.
        return next.handle(req.clone({ setHeaders: { Authorization: 'Token ' + data.key } }));
    }
}