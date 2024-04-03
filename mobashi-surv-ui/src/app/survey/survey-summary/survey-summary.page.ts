import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/contrib/core/toast.service';
import { LangService } from 'src/app/contrib/lang/lang.service';
import { SurveyService } from '../survey.service';

@Component({
  selector: 'app-survey-summary',
  templateUrl: './survey-summary.page.html',
  styleUrls: ['./survey-summary.page.scss'],
})
export class SurveySummaryPage implements OnInit {
  readonly survey$ = this.service.surveyById(this.route.paramMap, 'id');

  constructor(
    public tr: LangService,         //MUST be here and be public for template to use!!!
    private route: ActivatedRoute,
    private toastService: ToastService,
    private service: SurveyService
  ) {
    this.service.ensure();
  }

  ngOnInit() {
  }

}
