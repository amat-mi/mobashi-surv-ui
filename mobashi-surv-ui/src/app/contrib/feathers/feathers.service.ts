import { Injectable, Inject } from '@angular/core';
import { NgRedux, DevToolsExtension } from './../store';
import { combineReducers } from 'redux';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { ToastService } from '../core/toast.service';

import * as _ from 'lodash';

declare var require: any;
const feathers = require('@feathersjs/feathers');
const fmemory = require('feathers-memory');
const fstorage = require('feathers-localstorage');
const frest = require('@feathersjs/rest-client');
const fsocket = require('@feathersjs/socketio-client');
const io = require('socket.io-client');
const auth = require('@feathersjs/authentication-client');
const fredux = require('feathers-redux');

const middlewares = require('./redux-middleware');

@Injectable({
  providedIn: 'root'
})
export class FeathersService {
  private reducers: any;       //map service name to its reducer
  private _services: any = {};

  constructor(
    @Inject('app.config') private appConfig: any,
    private httpClient: HttpClient,
    private store: NgRedux<any>,
    private devTools: DevToolsExtension,
    private loadingController: LoadingController,
    private toastService: ToastService
  ) {
    // Initialize feathers
    this._app = feathers();

    // create SocketIO client with SOCKETHOST base URL and configure it as default service provider
    // but only if SocketIO support is enabled
    if (this.appConfig.SOCKETHOST) {
      const socket = io(this.appConfig.SOCKETHOST);
      this._app.configure(fsocket(socket, {
        timeout: 20000
      }));
    }

    this._app.configure(auth({
      path: '/authenticate',        //this is for REST only
      timeout: 20000,
    }));
  }

  private _app: any;
  /* get app(): any {
    return this._app;
  } */

  /**
   * Returns the low lever SocketIO instance, configured as the defualt service provider
   */
  get io(): any {
    return this._app.io;
  }

  public service(name: string): any {
    return this._services[name];
  }

  public rawService(route: string): any {
    return this._app.service(route);
  }

  public select(path: string[], options: any = {}): Observable<any> {
    options = Object.assign({
      excludeEmpty: false       //let empty values be emitted, by default
    }, options || {});

    const res = this.store.select<any>(path);

    return !!options.excludeEmpty ? res.pipe(
      filter((data) => !!data)) : res;
  }

  public selectData(name: string): Observable<any> {
    return this.select([name, 'data']);
  }

  public selectResult(name: string, options: any = {}): Observable<any> {
    options = Object.assign({
      excludeEmpty: false       //let empty values be emitted, by default
    }, options || {});

    const res = this.select([name, 'queryResult'], options);

    return !!options.excludeEmpty ? res.pipe(
      filter((data) => data?.length != undefined)) : res;
  }

  public get(path: string[]): any {
    return _.get(this.store.getState(), path);
  }

  public getData(name: string): any {
    return this.get([name, 'data']);
  }

  public getResult(name: string): any {
    return this.get([name, 'queryResult']);
  }

  public set(path: string[], value: any): any {
    return _.set(this.store.getState(), path, value);
  }

  public setData(name: string, value: any): any {
    return this.set([name, 'data'], value);
  }

  public setResult(name: string, value: any): any {
    return this.set([name, 'queryResult'], value);
  }

  public attachLoader(name: string, field: string, options: Object = {}) {
    options = Object.assign({
      //no defaults to set
    }, options || {});

    return this.select([name, field]).subscribe((data) => {
      //console.log('attachLoader 0', name, field, data);
      if (data) {
        //console.log('attachLoader 1', name, field, data);
        this.loadingController.create(options).then((loading) => {
          //console.log('attachLoader 2', name, field, data);
          loading.present().then(() => {
            //console.log('attachLoader 3', name, field, data);
            this.select([name, field]).subscribe((data) => {
              //console.log('attachLoader 4', name, field, data);
              if (!data) {
                //console.log('attachLoader 5', name, field, data);
                loading.dismiss();
              }
            });
          });
        });
      }
    });
  }

  public attachLoadingLoader(name: string, options: Object = {}) {
    return this.attachLoader(name, 'isLoading');
  }

  public attachSavingLoader(name: string, options: Object = {}) {
    return this.attachLoader(name, 'isSaving');
  }

  public attachToast(name: string, field: string, options: Object = {}) {
    options = Object.assign({
      //no defaults to set
    }, options || {});

    return this.select([name, field]).subscribe((data) => {
      this.toastService.present(data, options)
    });
  }

  public attachErrorToast(name: string, options: Object = {}) {
    options = Object.assign({
      //no defaults to set
    }, options || {});

    return this.select([name, 'isError']).subscribe((error) => {
      if (error) {
        const message = ((error['error'] || {})['message']) || error;
        this.toastService.presentError(message, options)
      }
    });
  }

  /**
 * Create a Feathers service using a Feathers REST client, 
 * configured to use the HTTP client from Angular but do NOT reduxify it.
 * 
 * @param route The local Feathers service name (with leading slash)
 * @param host The base URL of the REST server
 * @param path The server's path called for this REST service
 * @returns The created service
 */
  public createRest(route: string, host: string, path: string): any {
    let client = frest(host).angularHttpClient(this.httpClient, { HttpHeaders: HttpHeaders })
    this._app.use(route, client.service(path));

    return this.rawService(route);        //return the new service
  }

  /**
   * Create a Feathers service using a Feathers REST client, 
   * configured to use the HTTP client from Angular and then reduxify it.
   * 
   * @param route The local Feathers service name (with leading slash)
   * @param host The base URL of the REST server
   * @param path The server's path called for this REST service
   * @returns The created reduxified service
   */
  public createRestService(route: string, host: string, path: string): any {
    this.createRest(route, host, path);           //create the service

    return this._prepareService(route);         //return the new reduxified service
  }

  /**
   * Update an existing REST Feathers service, changing the host and path it uses.
   * 
   * @param route The local Feathers service name (with leading slash)
   * @param host The base URL of the REST server
   * @param path The server's path called for this REST service
   * @returns The updated raw service
   */
  public updateRestService(route: string, host: string, path: string): any {
    let service = this.rawService(route);         //retrieve the requested service
    if (service) {                                 //only if found
      //modify the complete URL stored inside the service
      //HACK!!! see constructor inside "node_modules\@feathersjs\rest-client\lib\base.js"!!!
      //TODO!!! Verify it is indeed a REST service!!!
      let client = frest(host).angularHttpClient(this.httpClient, { HttpHeaders: HttpHeaders })
      service.base = client.service(path).base;      //create a service instance only to get its base property 
    }

    return service;           //return the updated raw service (or null, if not found)
  }

  /**
   * Create a Feathers service using a Feathers memory client but do NOT reduxify it.
   * 
   * @param route The local Feathers service name (with leading slash)
   * @returns The created service
   */
  public createMemory(route: string, options: Object = {}, prepareOptions: Object = {}): any {
    options = Object.assign({
      /* paginate: {
        default: 200,
        max: 400
      }, */
    }, options || {});

    let client = fmemory(options);
    this._app.use(route, client);

    return this.rawService(route);        //return the new service
  }

  /**
   * Create a Feathers service using a Feathers memory client and then reduxify it.
   * 
   * @param route The local Feathers service name (with leading slash)
   * @returns The created reduxified service
   */
  public createMemoryService(route: string, options: Object = {}, prepareOptions: Object = {}): any {
    this.createMemory(route, options, prepareOptions);           //create the service

    return this._prepareService(route, undefined, prepareOptions);        //return the new reduxified service
  }

  /**
   * Create a Feathers service using a Feathers local storage client and then reduxify it.
   * 
   * @param route The local Feathers service name (with leading slash)
   * @param storageName The name to use for the storage of this service
   * @returns The created reduxified service
   */
  public createStorageService(route: string, storageName?: string, options: Object = {}, prepareOptions: Object = {}): any {
    options = Object.assign({
      /* paginate: {
        default: 200,
        max: 400
      }, */
      name: storageName,
    }, options || {});

    let client = fstorage(options);
    this._app.use(route, client);

    return this._prepareService(route, undefined, prepareOptions);        //return the new reduxified service
  }

  private _prepareService(route: string, name?: string, options: Object = {}): any {
    //name defaults to route without the leading slash, if any
    name = name || route;
    if (name.charAt(0) == '/')
      name = name.substring(1);

    let service = this._services[name];
    if (service)
      return service;         //if a service with this name was already prepared, return it

    // note that this function only works on a map of route => name and return a map of name => service
    let routeMap = {} as { [key: string]: string };
    routeMap[route] = name;
    let reduxedServices = fredux.default(this._app, routeMap, options || {});
    let reduxedService = reduxedServices[name];
    let isFirst = !this.reducers;       //if never constructed, this is the first service added
    if (isFirst)
      this.reducers = {};         //create it, if first time

    this.reducers[name] = reduxedService.reducer;      //store service reducer into map of reducers by service name

    // Create new combined reducers to have all services linked to a single Redux store
    let rootReducer = combineReducers(this.reducers);

    // if firt time, configure the Redux store with the combined reducers for all feathers services,
    // otherwise replace combined reducer inside the already configured store
    if (isFirst) {
      //const enhancer = this.devTools.enhancer();
      //const enhancers = this.devTools.isEnabled() ? this.devTools.enhancer() : undefined;
      this.store.configureStore(
        rootReducer,
        {},//{start: {queryResult: {esercizi: ['1','2','3']}}},
        middlewares.default,
        //this.devTools.isEnabled() ? [enhancer] : [undefined]
      );
    } else
      this.store.replaceReducer(rootReducer);

    // Let modules call service, without needing to get a reference to the Redux store too
    // note that this function only works on a map of name => service and returns a map of name => service
    // directly store the new reduxified and bound service into the services map
    this._services[name] = fredux.bindWithDispatch(this.store.dispatch, reduxedServices)[name];

    return this._services[name];         //return new reduxified and bound service
  }

  public realtimeService(route: string, name?: string): any {
    //name defaults to route without the leading slash, if any
    name = name || route;
    if (name.charAt(0) == '/')
      name = name.substring(1);

    let service = this._services[name];
    // let the service update the store in realtime when its data changes
    // TODO!!! Should raise or do something if service not found???
    if (service) {
      const raw = this._app.service(route);
      raw.on('created', (data: any) => {
        this.store.dispatch(service.onCreated(data));
      });
      raw.on('updated', (data: any) => {
        this.store.dispatch(service.onUpdated(data));
      });
      raw.on('patched', (data: any) => {
        this.store.dispatch(service.onPatched(data));
      });
      raw.on('removed', (data: any) => {
        this.store.dispatch(service.onRemoved(data));
      });
    }

    return service;         //return the now realtime enabled service
  }
}
