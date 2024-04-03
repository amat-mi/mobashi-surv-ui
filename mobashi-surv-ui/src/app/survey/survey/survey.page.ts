import { Component, OnInit } from '@angular/core';
import { LangService } from 'src/app/contrib/lang/lang.service';
import { Model } from "survey-core";
import { SurveyService } from '../survey.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import "survey-core/survey.i18n";
import { ToastService } from 'src/app/contrib/core/toast.service';


@Component({
  selector: 'app-survey',
  templateUrl: './survey.page.html',
  styleUrls: ['./survey.page.scss'],
})
export class SurveyPage implements OnInit {
  readonly survey$ = this.service.surveyById(this.route.paramMap, 'id');
  readonly surveyModel$: Observable<Model>;
  saving: boolean = false;
  fromTo?: [number, number, number, number];         //[from lng, from lat, to lng, to lat]

  constructor(
    public tr: LangService,         //MUST be here and be public for template to use!!!
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private service: SurveyService
  ) {
    this.service.ensure();

    this.surveyModel$ = this.survey$.pipe(
      map((survey) => {
        //from "survey" JSON field of Campaign, get the "forth" or "back" SurveyJS template,
        //based upon the "kind" field of Survey and create a SurverJS Model from it.
        //If the corresponding template is not available, it's an error (it should never happen)
        const template = survey.campaign.survey[survey.kind];
        if (!template) {
          const error = this.tr.t('SURVEY.ERRORS.MISSING_TEMPLATE', { 'KIND': survey.kind });
          this.toastService.presentError(error);
          throw error;
        }

        const res = new Model(template);
        const lang = this.tr.getSelectedLang();
        res.locale = lang;                                    //set Survey locale to selected Lang
        res.data = survey.content;                            //set data with "content" JSON field of Survey

        res.onComplete.add((sender, options) => {             //when SurveyJS is complete
          survey.content = sender.data;                         //replace "content" JSON field of Survey
          //also store current Browser timezone name, for correct server side datetime usage
          survey.content["TZ"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
          console.log(JSON.stringify(survey.content, null, 3));

          //and save it to server          
          //options.showSaveInProgress();
          this.saving = true;
          this.service.save(survey)
            .then(() => {
              options.showSaveSuccess();
              // options.clearSaveMessages();

              setTimeout(() => {
                this.service.ensure(true);        //request updated list of Surveys from server
                this.saving = false;
                this.router.navigate(['../']);
              }, 3000);
            })
            .catch((error) => {
              options.showSaveError();
              this.saving = false;
            });

          const orig = survey.content["trip-orig"];
          const dest = survey.content["trip-dest"];
          if (!!orig && !!dest) {
            this.fromTo = [orig.lng, orig.lat, dest.lng, dest.lat];
          }
        });

        return res;
      })
    )
  }

  ngOnInit() {
    /*     const surveyJson = {
          showProgressBar: "top",
          firstPageIsStarted: true,
          startSurveyText: "Iniziamo!",
          completedHtml: "<h4>Grazie per il tuo aiuto!</h4>",
          //showPreviewBeforeComplete: "showAllQuestions",
          showPreviewBeforeComplete: "showAnsweredQuestions",
          previewText: "Rivedi",
          pages: [
            {
              elements: [
                {
                  type: "html",
                  html: `
                  <h4>Ti chiediamo di descrivere il tuo viaggio da casa a scuola</h4>
                  <p>
                    Considera l'ultimo viaggio che hai fatto,
                    anche se non hai seguito il tuo solito tragitto.
                  </p>
                `
                }
              ]
            },
            {
              elements: [
                {
                  name: "trip-orig_stamp",
                  title: "Quando sei partito:",
                  type: "text",
                  inputType: "datetime-local",
                  "isRequired": true,
                }
              ]
            },
            {
              elements: [
                {
                  name: "trip-orig",
                  title: "Da dove sei partito:",
                  type: "map",
                  address: "Via Arzaga, 30, Milano",
                  coords: [9.1328519, 45.4555113],
                  "isRequired": true,
                }
              ]
            },
            {
              elements: [
                {
                  name: "trip-mode",
                  title: "Come hai viaggiato:",
                  type: "radiogroup",
                  "isRequired": true,
                  "showNoneItem": true,
                  "colCount": 1,
                  "separateSpecialChoices": true,
                  "showClearButton": true,
                  choices: [
                    {
                      "value": "tpl",
                      "text": "Con i trasporti pubblici"
                    },
                    {
                      "value": "car",
                      "text": "In macchina"
                    },
                    {
                      "value": "bike",
                      "text": "In bicicletta"
                    },
                    {
                      "value": "foot",
                      "text": "A piedi"
                    },
                  ]
                }
              ]
            },
            {
              elements: [
                {
                  name: "trip-dest_stamp",
                  title: "Quando sei arrivato:",
                  type: "text",
                  inputType: "datetime-local",
                  "isRequired": true,
                }
              ]
            },
            {
              elements: [
                {
                  name: "trip-dest",
                  title: "Dove sei arrivato:",
                  type: "map",
                  address: "Piazzale Arduino 4, 20149 Milano MI",
                  coords: [9.1507584, 45.4780944],
                  "isRequired": true,
                }
              ]
            },
          ]
        };
    
        this.surveyModel = new Model(surveyJson);
        this.surveyModel.onComplete.add((sender, options) => {
          console.log(JSON.stringify(sender.data, null, 3));
        }); */
  }
}
