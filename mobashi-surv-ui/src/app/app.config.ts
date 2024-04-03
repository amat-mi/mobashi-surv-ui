import { InjectionToken } from "@angular/core";

export type AppConfig = {
    [x: string]: any;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');