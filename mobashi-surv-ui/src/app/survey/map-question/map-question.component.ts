import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CUSTOM_TYPE, MapQuestionModel } from './map-question';
import { QuestionAngular, AngularComponentFactory } from 'survey-angular-ui';
import { ConfirmEvent, MapComponent } from 'src/app/contrib/map/map/map.component';


@Component({
  selector: 'app-map-question',
  templateUrl: './map-question.component.html',
  styleUrls: ['./map-question.component.scss'],
})
export class MapQuestionComponent extends QuestionAngular<MapQuestionModel> {
  showMap: boolean = true;          //by default show the Map component

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    viewContainerRef?: ViewContainerRef
  ) {
    super(changeDetectorRef, viewContainerRef);
  }

  @ViewChild(MapComponent) mapComponent: MapComponent | undefined;

  override ngOnInit(): void {
    //if requested by Model or if read only, show a static map
    this.model.interactive = this.model.interactive || !this.model.isReadOnly;

    //HACK!!! if parent is a Panel (in preview Page), do not show the Map component
/*     if (this.model.parent?.isPanel)
      this.showMap = false; */
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();

    if (!this.model.value) {

    }

    /* if (this.model.isReadOnly)
      this.model.interactive = false; */

    /*     this.interactive = !(this.model.coords && this.model.address);
    
        this.model.onPropertyChanged.add((_sender: any, options: any) => {
          if (options.name == "center") {
            this.center = options.newValue;
          }
        }); */
  }

  confirmation(ev: ConfirmEvent) {
    this.model.value = ev;
  }
}

AngularComponentFactory.Instance.registerComponent(
  CUSTOM_TYPE + "-question", MapQuestionComponent);
