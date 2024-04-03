import { Component, OnInit } from '@angular/core';
import { LangService } from '../lang.service';


@Component({
  selector: 'app-lang-overview',
  templateUrl: './lang-overview.component.html',
  styleUrls: ['./lang-overview.component.scss'],
})
export class LangOverviewComponent implements OnInit {
  selectedLang$ = this.service.selectedLang$;

  constructor(
    private service: LangService
  ) { }

  ngOnInit() { }

}
