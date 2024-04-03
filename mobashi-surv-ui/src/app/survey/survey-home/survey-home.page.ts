import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LangService } from 'src/app/contrib/lang/lang.service';
import { SurveyService } from '../survey.service';
import { CityService } from 'src/app/city/city.service';
import { LangSelectorComponent } from 'src/app/contrib/lang/lang-selector/lang-selector.component';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-survey-home',
  templateUrl: './survey-home.page.html',
  styleUrls: ['./survey-home.page.scss'],
})
export class SurveyHomePage implements OnInit {
  readonly selectedCity$ = this.cityService.selectedCity$;
  readonly surveys$ = this.service.surveys$;

  constructor(
    public tr: LangService,         //MUST be here and be public for template to use!!!
    private route: ActivatedRoute,
    private popoverController: PopoverController,
    private cityService: CityService,
    private service: SurveyService
  ) {
    this.service.ensure();
  }

  ngOnInit() {
  }

  public async presentLangPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: LangSelectorComponent,
      event: ev,
      translucent: true
    });

    return await popover.present();
  }
}
