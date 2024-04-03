import { LangService } from 'src/app/contrib/lang/lang.service';
import { ScanService } from './../scan.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SurveyService } from 'src/app/survey/survey.service';


@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {
  capabs$ = this.scanService.capabs$;
  status$ = this.scanService.status$;
  result$ = this.scanService.result$;
  code: string = '';
  private resultSubscription: any;
  private webScanVideo: ElementRef | undefined;

  @ViewChild("webScanVideo", { static: false }) set WebScanVideo(ref: ElementRef) {
    //only if on Browser, get and use the native element needed for scanning from Javascript
    if (!!ref) {
      this.webScanVideo = ref;
      this.scanService.setWebScanVideo(this.webScanVideo.nativeElement);
    }
  }

  constructor(
    public tr: LangService,         //MUST be here and be public for template to use!!!
    private scanService: ScanService,
    private surveyService: SurveyService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    //reset any old input
    this.code = '';           
    this.scanService.reset();

    //when a result comes in from the scanner
    this.resultSubscription = this.scanService.result$.subscribe((result) => {
      //if successful scanning, extract the "code" part from the URL and navigate to the SurveyAdd page
      if (result && result.text) {
        this.resultSubscription.unsubscribe();
        this.surveyService.handleOpenURL(result.text);
      }
    });
  }

  ionViewWillLeave() {
    this.resultSubscription.unsubscribe();      //stop listening to scanner results
    this.scanService.stopScanning();            //ask service to stop scanning
  }

  inputDone() {
    this.scanService.inputDone(this.code);
  }

  scan() {
    this.scanService.scan();
  }

  cancel() {
    this.scanService.cancel();
  }

  toggleLight() {
    return this.scanService.toggleLight();
  }

  cycleWebCamera() {
    return this.scanService.cycleWebCamera();
  }
}
