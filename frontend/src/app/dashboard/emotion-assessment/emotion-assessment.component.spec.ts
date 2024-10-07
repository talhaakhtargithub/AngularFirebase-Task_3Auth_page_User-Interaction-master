import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmotionAssessmentComponent } from './emotion-assessment.component';

describe('EmotionAssessmentComponent', () => {
  let component: EmotionAssessmentComponent;
  let fixture: ComponentFixture<EmotionAssessmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmotionAssessmentComponent]
    });
    fixture = TestBed.createComponent(EmotionAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
