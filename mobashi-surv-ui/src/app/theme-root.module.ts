import { NgModule } from '@angular/core';
import { ThemeModule } from './contrib/theme/theme.module';
import { provideThemeService } from './contrib/theme/theme.service';

import { CONFIG } from './local_configs/theme'


@NgModule({
    exports: [ThemeModule],
    providers: [
        provideThemeService(CONFIG)
    ]
})
export class ThemeRootModule { }
