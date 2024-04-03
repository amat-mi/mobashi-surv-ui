import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class FeathersDRFInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        //ONLY if NOT a request for a file with extension (or i18n and other files won't be found by Apache)
        const s = request.url.split(/\?|#/)[0].split('/').pop();
        if (s && s.indexOf('.') < 0)
            request = request.clone({
                url: request.url.replace(/\/?(\?|#|$)/, '/$1'),          //MUST ALWAYS ensure trailing slash!!!
            });

        request = request.clone({ withCredentials: true });         //needed by Django Session Authentication

        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                // do stuff with response if you want
            }
        }, (err: any) => {
            throw { error: err };      //let the whole error object available (see AngularHttpService in FeatherJS rest-client)
        }));
    }
}