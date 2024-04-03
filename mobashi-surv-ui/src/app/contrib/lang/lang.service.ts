import { Injectable, Inject } from '@angular/core';
import { TranslocoService, TranslateParams, HashMap, getBrowserLang, AvailableLangs, LangDefinition } from '@ngneat/transloco';
import { of, Observable, BehaviorSubject, forkJoin, firstValueFrom } from 'rxjs';
import { StorageService } from '../storage/storage.service';


const normalize = (langs: AvailableLangs) => {
  const res: any[] = [];
  langs.forEach(lang => {
    if (typeof lang === 'string') {
      res.push({ id: lang, label: lang })
    } else
      res.push(lang);
  });

  return res;
}


@Injectable({
  providedIn: 'root'
})
export class LangService {
  private storageKey = this.appConfig.APPNAME + ':lang-selectedlang';

  private langs$$: BehaviorSubject<any[]> = new BehaviorSubject([] as any[]);
  readonly langs$ = this.langs$$.asObservable();
  readonly selectedLang$ = this.storage.$(this.storageKey);

  constructor(
    @Inject('app.config') private appConfig: any,
    private storage: StorageService,
    private translocoService: TranslocoService
  ) { }

  public init() {
    //load translation files for all available Langs, waiting for all of them to finish loading
    let observables: Observable<any>[] = [];
    const langs = normalize(this.translocoService.getAvailableLangs());
    langs.forEach((lang) => observables.push(this.translocoService.load(lang.id)));

    //After loading all translation files, let them be available to client of this service
    //then see if selected Lang is already in storage
    //If it is, set Transloco active Lang accordingly, otherwise get the first available Lang 
    //and set it as Transloco active Lang
    // If current browser Lang is one of the available Langs, activate that instead
    return firstValueFrom(forkJoin(observables)).then(() => {
      this.langs$$.next(langs);

      return this.storage.get(this.storageKey)
        .then((data: any) => {
          let browserLang = getBrowserLang();
          let bestLang = langs.find((lang) => lang.id == data?.id ?? browserLang);
          this.langSelected(bestLang ?? langs[0]);

          return this.translocoService;
        });
    });
  }

  public getSelectedLang() {
    return this.translocoService.getActiveLang();
  }

  public setSelectedLang(lang: any) {
    this.storage.set(this.storageKey, lang).then(() => {
      this.translocoService.setActiveLang(lang.id);
    });
  }

  public langSelected(lang: any) {
    return this.setSelectedLang(lang);        //it's just an alias for another method
  }

  public langIdSelected(langs: any, id: string) {
    const lang = langs.find((lang: { id: string; }) => {
      return lang.id == id
    });

    this.langSelected(lang);
  }

  public t<T = any>(key: TranslateParams, params?: HashMap, lang?: string): T {
    return this.translocoService.translate(key, params, lang);
  }

  public st<T = any>(key: TranslateParams, params?: HashMap, lang?: string, _isObject?: boolean): Observable<T> {
    return this.translocoService.selectTranslate(key, params, lang);
  }

  /**
   * To call the function provided by the "*transloco" structural directive, circumventing
   * the bug inside the Angular Language Service for VSCode:
   *   https://github.com/angular/angular/issues/16643
   * 
   * Use as:
   * <ng-template transloco let-fn="$implicit">
   *   <p>{{ tr.t(fn,'SETTINGS.TITLE',{name: 'Sam'}) }}</p>
   * </ng-template>
   *
   * where "tr" is the name of the injected LangService instance.
   * 
   * @param callback
   * @param args 
   */
  public c(callback: any, ...args: any[]) {
    return callback(...args);
  }
}
