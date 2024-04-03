import { ThemeService } from './../theme.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss'],
})
export class ThemeSelectorComponent implements OnInit {
  themes$ = this.service.themes$;
  selectedTheme$ = this.service.selectedTheme$;

  constructor(
    private service: ThemeService
  ) { }

  ngOnInit() { }

  changed(theme: any) {
    this.service.themeSelected(theme);     //select this theme
  }
}
