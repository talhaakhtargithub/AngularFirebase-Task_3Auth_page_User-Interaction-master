import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent';
}

interface Student {
  firstName: string; // Assuming firstName is now included
  lastName: string;  // Assuming lastName is now included
  id: string;
  semester: string;
  course: {
    code: string;
    title: string;
  };
  attendanceRecords: AttendanceRecord[];
  emotion: 'Alert' | 'Bored' | 'Neutral' | 'Fear' | 'Non-serious';
}

interface Course {
  code: string;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private studentsUrl = 'assets/student.json'; // Replace with your actual API endpoint if needed
  private coursesUrl = 'assets/courses.json'; // Replace with your actual API endpoint if needed

  constructor(private http: HttpClient) { }

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.studentsUrl);
  }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.coursesUrl);
  }

  getFilteredAttendance(session: string, courseCode: string, time: 'week' | 'month' | 'year'): Observable<any> {
    return this.getStudents().pipe(
      map(students => {
        // Filter students by course code and semester
        const filteredStudents = students.filter(student =>
          student.course.code === courseCode && student.semester === session
        );

        // Compute attendance data
        const attendanceData = this.calculateAttendance(filteredStudents, time);
        return attendanceData;
      })
    );
  }

  private calculateAttendance(students: Student[], time: 'week' | 'month' | 'year'): any {
    const attendanceData = {
      days: [] as string[],
      counts: [] as number[]
    };

    const now = new Date();
    const dateRanges = this.getDateRanges(time, now);

    dateRanges.forEach(range => {
      attendanceData.days.push(range.label);
      attendanceData.counts.push(0); // Placeholder for count
    });

    students.forEach(student => {
      student.attendanceRecords.forEach(record => {
        const recordDate = new Date(record.date);
        dateRanges.forEach((range, index) => {
          if (recordDate >= range.start && recordDate <= range.end) {
            if (record.status === 'present') {
              attendanceData.counts[index] += 1;
            }
          }
        });
      });
    });

    return attendanceData;
  }

  private getDateRanges(time: 'week' | 'month' | 'year', now: Date) {
    const ranges = [];
    if (time === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        ranges.push({ label: date.toLocaleDateString(), start: date, end: date });
      }
    } else if (time === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      for (let i = 0; i < endOfMonth.getDate(); i++) {
        const date = new Date(startOfMonth);
        date.setDate(startOfMonth.getDate() + i);
        ranges.push({ label: date.toLocaleDateString(), start: date, end: date });
      }
    } else if (time === 'year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      for (let i = 0; i < 12; i++) {
        const start = new Date(now.getFullYear(), i, 1);
        const end = new Date(now.getFullYear(), i + 1, 0);
        ranges.push({ label: start.toLocaleString('default', { month: 'short' }), start: start, end: end });
      }
    }
    return ranges;
  }
}
