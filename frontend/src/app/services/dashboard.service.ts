import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Course, Student } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() { }

  getCourses(): Observable<Course[]> {
    const courses: Course[] = [
      { code: 'DLD', title: 'Digital Logic Design' },
      { code: 'DBMS', title: 'Database Management Systems' },
      { code: 'OS', title: 'Operating Systems' },
      { code: 'ML', title: 'Machine Learning' },
      { code: 'AI', title: 'Artificial Intelligence' },
    ];
    return of(courses); // Return fake data
  }

  getStudents(): Observable<Student[]> {
    const students: Student[] = [
      { index: 1, name: 'Fakhar Zaman', id: 'RP200E-100', semester: '8', attendance: 90, details: '<p>Participated in 3 projects.</p>' },
      { index: 2, name: 'Rizwan Ali', id: 'RP200E-101', semester: '7', attendance: 85, details: '<p>Excellent in algorithms.</p>' },
      { index: 3, name: 'Sarah Khan', id: 'RP200E-102', semester: '6', attendance: 95, details: '<p>Won a coding competition.</p>' },
      { index: 4, name: 'Ali Ahmed', id: 'RP200E-103', semester: '5', attendance: 80, details: '<p>Member of the robotics team.</p>' },
      { index: 5, name: 'Nadia Javed', id: 'RP200E-104', semester: '8', attendance: 92, details: '<p>Focused on web development.</p>' },
    ];
    return of(students); // Return fake data
  }
}
