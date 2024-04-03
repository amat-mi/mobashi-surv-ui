import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../survey.service';
import { ActivatedRoute } from '@angular/router';
import { CityService } from 'src/app/city/city.service';
import { LangService } from 'src/app/contrib/lang/lang.service';
import { PopoverController } from '@ionic/angular';
import { LangSelectorComponent } from 'src/app/contrib/lang/lang-selector/lang-selector.component';

@Component({
  selector: 'app-survey-add',
  templateUrl: './survey-add.page.html',
  styleUrls: ['./survey-add.page.scss'],
})
export class SurveyAddPage implements OnInit {
  readonly selectedCity$ = this.cityService.selectedCity$;
  readonly surveys$ = this.service.addSurvey(this.route.paramMap, 'code');

  constructor(
    public tr: LangService,         //MUST be here and be public for template to use!!!
    private route: ActivatedRoute,
    private popoverController: PopoverController,
    private cityService: CityService,
    private service: SurveyService
  ) {
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
