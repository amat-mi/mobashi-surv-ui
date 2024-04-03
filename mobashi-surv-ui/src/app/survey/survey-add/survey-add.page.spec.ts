import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SurveyAddPage } from './survey-add.page';

describe('SurveyAddPage', () => {
  let component: SurveyAddPage;
  let fixture: ComponentFixture<SurveyAddPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(SurveyAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
