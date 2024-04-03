import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SurveySummaryPage } from './survey-summary.page';

describe('SurveySummaryPage', () => {
  let component: SurveySummaryPage;
  let fixture: ComponentFixture<SurveySummaryPage>;

  beforeEach(waitForAsync () => {
    fixture = TestBed.createComponent(SurveySummaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
