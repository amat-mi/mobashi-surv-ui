import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-theme-overview',
  templateUrl: './theme-overview.component.html',
  styleUrls: ['./theme-overview.component.scss'],
})
export class ThemeOverviewComponent implements OnInit {
  selectedTheme$ = this.service.selectedTheme$;

  constructor(
    private service: ThemeService
  ) { }

  ngOnInit() {}

}
