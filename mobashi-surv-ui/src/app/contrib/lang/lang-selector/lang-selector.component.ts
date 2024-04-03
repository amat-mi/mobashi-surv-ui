import { LangService } from '../lang.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lang-selector',
  templateUrl: './lang-selector.component.html',
  styleUrls: ['./lang-selector.component.scss'],
})
export class LangSelectorComponent implements OnInit {
  langs$ = this.service.langs$;
  selectedLang$ = this.service.selectedLang$;

  constructor(
    private service: LangService
  ) { }

  ngOnInit() { }

  changed(lang: any) {
    this.service.langSelected(lang);     //select this lang
  }

}
