import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherAttendanceComponent } from './teacher-attendance.component';

describe('TeacherAttendanceComponent', () => {
  let component: TeacherAttendanceComponent;
  let fixture: ComponentFixture<TeacherAttendanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherAttendanceComponent]
    });
    fixture = TestBed.createComponent(TeacherAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
