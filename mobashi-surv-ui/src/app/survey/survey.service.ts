import { Inject, Injectable } from '@angular/core';
import { ParamMap, Router } from '@angular/router';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { FeathersService } from '../contrib/feathers/feathers.service';
import _ from 'lodash';
import { APP_CONFIG, AppConfig } from '../app.config';
import { ScanService } from '../scan/scan.service';
import { AuthService } from '../contrib/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private surveyRestService;
  private surveyAddRestService;
  public scanResult$ = this.scanService.result$;

  //do NOT let empty values be emitted
  public readonly surveys$ = this.api.selectResult('surveys', { excludeEmpty: true });

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private router: Router,
    private api: FeathersService,
    private authApi: AuthService,
    private scanService: ScanService
  ) {
    this.surveyRestService = this.api.createRestService('/surveys',
      this.appConfig['HOST'], 'surv/surveys/');
    this.api.attachLoadingLoader('surveys');        //present Loader while loading
    this.api.attachErrorToast('surveys', { duration: 0 });           //present Toast if error (with no autoclosing)

    this.surveyAddRestService = this.api.createRestService('/surveyadd',
      this.appConfig['HOST'], 'surv/surveys/');
    this.api.attachSavingLoader('surveyadd');        //present Loader while saving
    this.api.attachErrorToast('surveyadd', { duration: 0 });           //present Toast if error (with no autoclosing)
  }

  /**
   * If requested data is already inside the store, return it, otherwise ask server for list of Surveys
   * 
   * @returns A Promise that will resolve with the data
   */
  public async ensure(refresh = false) {
    const data = this.api.getResult('surveys');
    return !refresh && data?.length != undefined ?
      Promise.resolve(data) :
      this.surveyRestService.find()
        .then((data: { value: any; }) => data.value);     //MUST use value here!!!
  }

  /**
   * Get the Survey with the specified id.
   * 
   * @param paramMap Use ActivatedRoute.paramMap for this
   * @param name Name of param to get the Survey id from
   * @returns An Observable that emits the Survey having the id specified in paramMap
   */
  public surveyById(paramMap: Observable<ParamMap>, name: string) {
    return combineLatest([paramMap, this.surveys$]).pipe(
      map(([params, surveys]) => _.find(surveys, ['id', Number(params.get(name))]))
    );
  }

  public addSurvey(paramMap: Observable<ParamMap>, name: string) {
    return combineLatest([paramMap, this.authApi.getUsername()]).pipe(
      switchMap(([params, username], index) => {
        const code = params.get(name);
        this.surveyAddRestService.reset();                   //clear last data from the redux Store for Add Survey API
        this.surveyRestService.reset();                      //clear last data from the redux Store for List Survey API

        if (!code)
          return of([]);

        this.surveyAddRestService.create({ code, username })
          .then((data: { value: any; }) => {            //MUST use value here!!!
            //Login using token sent from server, or Logout, if permission denied
            this.authApi.didLogin(Promise.resolve({ data: { key: data.value.token } }))
              .then(() => data.value)
          });

        //always return Observable from the redux Store, but only the surveys list
        return this.api.selectData('surveyadd').pipe(map((data) => data?.surveys ?? []));
      })
    );
  }

  public async save(survey: any) {
    return this.surveyRestService.patch(survey.id, {
      content: survey.content
    }).then((data: any) => {
      console.debug(data?.value);

      return data?.value;
    });
  }

  public handleOpenURL(url: string | any) {
    if (typeof url != 'string')     //from external QR code reader, or direct text input in Scan page "URL"
      url = url.data;                 //from QR code scanner in Scan page "{data: URL}"

    let params = { code: '' };
    let error: string = '';

    let parser = null;
    try {
      parser = new URL(url);          //try building parser URL upon specified url
    } catch (exc) {
      error = '' + exc;               //turn exception into string
    }

    while (!!parser) {          //do not enter if parser not created (i.e. specified url was NOT valid)
      //MUST be like: https://<HOST>:<PORT>/surveyadd/<CODE>
      //It can give "parts" array like:
      //  0 => ''
      //  1 => 'surveyadd'
      //  2 => '<CODE>
      // or
      //  0 => 'surveyadd'
      //  1 => '<CODE>
      if (parser.protocol == "http:" || parser.protocol == "https:") {
        const parts = parser.pathname.split('/');

        const index = parts.indexOf("surveyadd");       //find index of "surveyadd" in parts
        if (index < 0) {
          error = "Path invalido: " + parser.pathname;
          break;
        }

        if (parts.length != 2 + index) {                //parts can be 2 or 3 elements
          error = "Path invalido: " + parser.pathname;
          break;
        }

        if (parts[index] != "surveyadd") {
          error = "Path invalido: " + parser.pathname;
          break;
        }

        params.code = parts[index + 1];
      } else {
        error = "Protocol invalido: " + parser.protocol;
        break;
      }

      break;					//exit while with no errors
    }

    if (error) {
      console.error(error);
    } else {
      console.log("params: " + JSON.stringify(params));

      this.router.navigate(['/surveyadd/', params.code]);
    }
  }
}
