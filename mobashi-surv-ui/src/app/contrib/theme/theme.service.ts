import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { StorageService } from '../storage/storage.service';
import { Observable, combineLatest, of, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as Color from 'color';
import { TranslocoService } from '@ngneat/transloco';
import { APP_CONFIG, AppConfig } from 'src/app/app.config';


const DEFAULT_THEME_DEFS = [
  {
    name: 'light',
    label: 'Light',
    theme: {
      "--ion-background-color": '#fbfbfb',
      "--ion-text-color": '#000000',
      brand: '#f2683b',             // characteristic color of the brand
      brandContrast: '#ffffff',
      primary: '#f2683b',           // primary color (usually equal to brand)
      primaryContrast: '#ffffff',
      secondary: '#424242',         // (usually inverse of the primary color)
      secondaryContrast: '#f2683b',
      tertiary: 'magenta',
      tertiaryContrast: 'cyan',
      success: '#f2683b', // positive event or response (usually equal to primary)
      successContrast: '#ffffff',
      warning: 'magenta',           // not used
      warningContrast: 'cyan',
      danger: '#ffce00',  // negative event or response
      dangerContrast: '#000000',
      light: 'magenta',           // not used
      lightContrast: 'cyan',
      medium: '#fbfbfb',          // tint e shade for separators (usually equal to base)
      mediumContrast: '#000000',
      dark: 'magenta',           // not used
      darkContrast: 'cyan'
    }
  },
  {
    name: 'dark',
    label: 'Dark',
    theme: {
      "--ion-background-color": '#424242',
      "--ion-text-color": '#ffffff',
      brand: '#f3774e',             // characteristic color of the brand (10% lighter!!!)
      brandContrast: '#ffffff',
      primary: '#f3774e',           // primary color (usually equal to brand)
      primaryContrast: '#ffffff',
      secondary: '#ffffff',         // (usually inverse of the primary color)
      secondaryContrast: '#f3774e',
      tertiary: 'magenta',
      tertiaryContrast: 'cyan',
      success: '#f3774e', // positive event or response (usually equal to primary)
      successContrast: '#ffffff',
      warning: 'magenta',           // not used
      warningContrast: 'cyan',
      danger: '#ffce00',  // negative event or response
      dangerContrast: '#000000',
      light: 'magenta',           // not used
      lightContrast: 'cyan',
      medium: '#424242',          // tint e shade for separators (usually equal to base)
      mediumContrast: '#ffffff',
      dark: 'magenta',           // not used
      darkContrast: 'cyan'
    }
  }
]


@Injectable()
export class ThemeServiceOptions {
  themeDefs?: any[];
  brandColors?: {
    lightColor: string,
    darkColor?: string
  };
}


type ThemeServiceConfig = {
  storageKey: string;
  themeDefs: any[];
  brandColors?: {
    lightColor: string,
    darkColor?: string
  };
}


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly config: ThemeServiceConfig;
  //private defaultThemeId = 'auto';
  private defaultThemeId = 'light';

  readonly themes$: Observable<any>;              //all possibile selection of themes
  readonly prefersDark$$: BehaviorSubject<boolean>;
  readonly brandTheme$$: BehaviorSubject<any> = new BehaviorSubject({ lightColor: null, darkColor: null });
  readonly selectedTheme$: Observable<any>;       //currently selected theme (or first theme)
  readonly theme$: Observable<any>;               //current theme to actually apply

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    @Inject(DOCUMENT) private document: Document,
    private storage: StorageService,
    private tr: TranslocoService,
    @Inject(ThemeServiceOptions) private options?: ThemeServiceOptions
  ) {
    this.config = {
      storageKey: this.appConfig['APPNAME'] + ':theme-selectedtheme',
      themeDefs: this.options?.themeDefs?.length ? this.options?.themeDefs : DEFAULT_THEME_DEFS,
      brandColors: this.options?.brandColors
    };

    //build an Observable upon the fixed Theme definitions, addying the 'auto' one first
    this.themes$ = combineLatest(of([{ name: 'auto', label: 'Automatico' }].concat(
      this.config.themeDefs.map((themeDef) => {
        return { name: themeDef.name, label: themeDef.label };
      })
    )), this.tr.selectTranslation(), this.tr.langChanges$).pipe(map(([themes, lang]) => {
      return themes.map((theme) => this.translateTheme(theme));
    }));

    //build an Observable upon changes to the prefers-color-scheme media query
    this.prefersDark$$ = new BehaviorSubject(false);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addListener((e) => this.prefersDark$$.next(e.matches));

    this.selectedTheme$ = combineLatest(this.themes$, this.storage.$(this.config.storageKey),
      this.tr.selectTranslation(), this.tr.langChanges$).pipe(
        map(([themes, selected, lang]) => {
          let selectedName = selected ? selected.name : this.defaultThemeId;     //if not selected, use default

          let theme = themes.find != undefined ?
            themes.find((theme: { name: any; }) => theme.name == selectedName) : undefined;

          return this.translateTheme(theme ? theme : themes.length ? themes[0] : undefined);
        })
      );

    //no custom brand theme, by default
    this.brandTheme$$ = new BehaviorSubject({ lightColor: null, darkColor: null });

    this.theme$ = combineLatest(this.themes$, this.selectedTheme$,
      this.brandTheme$$.asObservable(),
      this.prefersDark$$.asObservable()).pipe(
        map(([themes, selected, brandTheme, prefersDark]) => {
          let selectedName = selected ? selected.name : this.defaultThemeId;     //if not selected, use default

          if (selectedName == 'auto')     //if 'auto' is selected
            selectedName = prefersDark ? 'dark' : 'light';      //use 'light' or 'dark' depending on system choice

          let theme = themes.find != undefined ?
            themes.find((theme: { name: any; }) => theme.name == selectedName) : undefined;

          return theme ? theme : themes.length ? themes[1] : undefined;       //use first theme dy default (shouldn't happen)
        })
      );

    this.theme$.subscribe((theme) => {
      if (theme) {
        //look by name for the selected theme inside the Theme definitions
        const localTheme = this.config.themeDefs.find((themeDef) => themeDef.name == theme.name)?.theme;
        if (localTheme) {
          //if there's a custom brand theme set, use its color
          //get correct light/dark color 
          const brandTheme = this.brandTheme$$.value;
          const brandColor = theme.name == 'dark' ? brandTheme.darkColor : brandTheme.lightColor;

          //patch local theme with barnd color only if actually set
          const patchedTheme = !!brandColor ? {
            ...localTheme,
            brand: brandColor,
            primary: brandColor,
            secondaryContrast: brandColor,
            success: brandColor,
          } : localTheme;

          const css = this.CSSTextGenerator(patchedTheme);
          this.document.documentElement.style.cssText = css;
        }
      }
    });

    this.init();
  }

  private async init() {
    //set default Theme and then get it (MUST do it!!!)
    await this.storage.setDefault(this.config.storageKey, this.defaultThemeId);
    await this.storage.get(this.config.storageKey);

    //if there's a brand color set in App configuration, use it
    //MUST do it here, after everything else!!!
    if (this.config.brandColors) {
      this.setBrandTheme(this.config.brandColors.lightColor, this.config.brandColors.darkColor);
    }
  }

  private translateTheme(theme: any) {
    if (!!theme) {
      const key = 'THEME.NAMES.' + theme.name.toUpperCase();
      const label = this.tr.translate(key);
      if (label != key)
        theme.label = label;
    }

    return theme;
  }

  public themeSelected(theme: any) {
    this.storage.set(this.config.storageKey, theme);
  }

  public themeNameSelected(themes: any, name: string) {
    const theme = themes.find((theme: { name: string; }) => {
      return theme.name == name
    });

    this.themeSelected(theme);
  }

  public setBrandTheme(lightColor: string, darkColor?: string) {
    //if dark color not specified, use a 10% lighter version of light color,
    //but only if it was actually specified itself
    if (!darkColor && !!lightColor)
      darkColor = Color(lightColor).lighten(0.1).hex().toLowerCase();

    this.brandTheme$$.next({ lightColor: lightColor, darkColor: darkColor });
  }

  private CSSTextGenerator(colors: any) {
    const shadeRatio = 0.3;       //TODO!!! Config param!!!
    const tintRatio = 0.3;        //TODO!!! Config param!!!

    let res = {} as { [key: string]: any };

    let addValue = (key: string, normal: string = '') => {
      let color = key in colors ? colors[key] : normal;
      if (color) {
        res[key] = color
        res[`${key}-rgb`] = Color(color).rgb().array();
      }
    }

    let addColors = (name: string) => {
      let base = colors[name];
      let contrast = this.contrast(base, colors[`${name}Contrast`]);
      name = `--ion-color-${name}`;
      addValue(`${name}`, base);
      addValue(`${name}-contrast`, contrast);
      addValue(`${name}-shade`, Color(base).darken(shadeRatio).toString());
      addValue(`${name}-tint`, Color(base).lighten(tintRatio).toString());
    }

    //Ionic Application colors with custom values => REMOVE!!!
    /*     addValue('--ion-background-color', colors.light);
        addValue('--ion-text-color', colors.dark);
        addValue('--ion-toolbar-background', this.contrast(colors.light, 0.1));    //TODO!!! Config param!!!
        addValue('--ion-toolbar-color', this.contrast(colors.dark, 0.1));           //TODO!!! Config param!!!
        addValue('--ion-item-background', colors.light);
        addValue('--ion-item-color', this.contrast(colors.dark, 0.3));              //TODO!!! Config param!!! */

    //Ionic Application colors without custom values
    addValue('--ion-background-color');
    addValue('--ion-text-color');
    addValue('--ion-backdrop-color');
    addValue('--ion-overlay-background-color');
    addValue('--ion-border-color');
    addValue('--ion-box-shadow-color');
    addValue('--ion-tab-bar-background');
    addValue('--ion-tab-bar-background-focused');
    addValue('--ion-tab-bar-border-color');
    addValue('--ion-tab-bar-color');
    addValue('--ion-tab-bar-color-activated');
    addValue('--ion-toolbar-background');
    addValue('--ion-toolbar-color');
    addValue('--ion-toolbar-border-color');
    addValue('--ion-toolbar-color-activated');
    addValue('--ion-toolbar-color-unchecked');
    addValue('--ion-toolbar-color-checked');
    addValue('--ion-item-background');
    addValue('--ion-item-color');
    addValue('--item-background-activated');
    addValue('--ion-item-border-color');
    addValue('--ion-placeholder-color');

    //Custom Theme colors
    addColors('brand');

    //Ionic Theme colors
    addColors('primary');
    addColors('secondary');
    addColors('tertiary');
    addColors('success');
    addColors('warning');
    addColors('danger');
    addColors('light');
    addColors('medium');
    addColors('dark');

    //are these actually used???
    res['--ion-color-base'] = 'var(--ion-background-color)';
    res['--ion-color-contrast'] = 'var(--ion-text-color)';

    //generate stepped colors from background to text
    const colorFrom = colors['--ion-background-color'];
    const colorTo = colors['--ion-text-color'];
    if (colorFrom && colorTo) {
      const background = new Color(colorFrom);
      const text = new Color(colorTo);
      for (let i = 5; i < 100; i = i + 5) {
        const step = i + '0';
        const amount = i / 100.0;

        let color = background.mix(text, amount);
        res[`--ion-color-step-${step}`] = color.hex().toLowerCase();
        res[`--ion-color-step-${step}-rgb`] = color;
      }
    }

    let css = Object.keys(res).map((key) => `${key}: ${res[key]};`).join('\n');
    //console.log('CSS', css);

    return css;
  }

  private isDark(color: any) {
    // YIQ equation from http://24ways.org/2010/calculating-color-contrast
    var rgb = color.rgb().color;
    var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return yiq < 192;     //TODO!!! Config param!!!
  }

  private contrast(color: any, colorContrast: number, ratio = 2.0) {   //TODO!!! Config param!!!
    if (colorContrast)
      return colorContrast;

    color = Color(color);

    return color.isDark() ? color.lighten(ratio) : color.darken(ratio);
    //return this.isDark(color) ? '#fff' : '#000';
    /*     return this.isDark(color) ?
          new Color(color.lighten(ratio)).whiten(ratio) :
          new Color(color.darken(ratio)).blacken(ratio); */
  }
}

export const provideThemeService = (options?: ThemeServiceOptions) => {
  return {
    provide: ThemeService,
    useFactory: (
      appConfig: AppConfig,
      document: Document,
      storage: StorageService,
      tr: TranslocoService,
    ) => new ThemeService(appConfig, document, storage, tr, options),
    deps: [
      APP_CONFIG,
      DOCUMENT,
      StorageService,
      TranslocoService
    ]
  }
};
