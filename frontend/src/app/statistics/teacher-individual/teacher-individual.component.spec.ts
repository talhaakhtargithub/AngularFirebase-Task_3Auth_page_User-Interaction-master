import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherIndividualComponent } from './teacher-individual.component';

describe('TeacherIndividualComponent', () => {
  let component: TeacherIndividualComponent;
  let fixture: ComponentFixture<TeacherIndividualComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherIndividualComponent]
    });
    fixture = TestBed.createComponent(TeacherIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
