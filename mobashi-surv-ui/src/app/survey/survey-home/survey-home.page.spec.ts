import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SurveyHomePage } from './survey-home.page';

describe('SurveyHomePage', () => {
  let component: SurveyHomePage;
  let fixture: ComponentFixture<SurveyHomePage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(SurveyHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
