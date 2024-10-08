import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentIndividualComponent } from './student-individual.component';

describe('StudentIndividualComponent', () => {
  let component: StudentIndividualComponent;
  let fixture: ComponentFixture<StudentIndividualComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentIndividualComponent]
    });
    fixture = TestBed.createComponent(StudentIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
