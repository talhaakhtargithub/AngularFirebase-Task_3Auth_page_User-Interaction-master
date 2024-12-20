import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ChartData, ChartType, ChartOptions } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, Observable, throwError } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  loading: boolean = true;
  sessions: String[] = [
    '2020-2024', '2021-2025', '2022-2026', '2023-2027'
  ];

  // Student Attendance Data
  public studentAttendanceData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Student Attendance' }]
  };
  public studentAttendanceOptions: ChartOptions = {
    responsive: true,
  };
  public studentAttendanceChartType: ChartType = 'bar';

  // Teacher Attendance Data
  public teacherAttendanceData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Teacher Attendance' }]
  };
  public teacherAttendanceChartType: ChartType = 'bar';

  // Course Assessment Data
  public courseAssessmentData: ChartData<'doughnut'> = {
    labels: ['Course Assessment'],
    datasets: [{ data: [0, 100], backgroundColor: ['#42A5F5', '#EBEFF2'] }]
  };
  public courseAssessmentChartType: ChartType = 'doughnut';

  // Emotion Data
  public emotionData: ChartData<'pie'> = {
    labels: ['Focused', 'Non-serious', 'Demotivated'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#42A5F5', '#FF6384', '#FF9F40'] }]
  };
  public emotionChartType: ChartType = 'pie';

  // Emotion Percentages
  public emotionPercentages: { [key: string]: number } = {
    'Focused': 0,
    'Non-serious': 0,
    'Demotivated': 0
  };

  public students: any[] = [];
  public courses: any[] = [];
  selectedSession: string = '';
  selectedTime: 'week' | 'month' | 'year' = 'week';

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadInitialData();
  }

  loadCourses(): void {
    this.http.get<any[]>('http://localhost:3000/api/courses').subscribe(
      courses => {
        this.courses = courses;
        this.toastr.success('Courses loaded successfully!'); // Success message
      },
      error => {
        console.error('Error loading courses:', error);
        this.toastr.error('Failed to load courses. Please try again.'); // Error message
      }
    );
  }

  loadInitialData(): void {
    this.applyFilter();
    this.updateEmotionData();
  }

  private lastExecuted: number = 0;

  applyFilter(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const currentTime = Date.now();

      // Check if 5 minutes have passed since the last execution
      if (currentTime - this.lastExecuted <  60*1000 ) {
        console.log('The filter was recently applied. Try again after 5 minutes.');
        resolve(false);  // Reject if the function was called too soon
        return;
      }

      if (this.selectedSession) {
        this.http.get<any[]>(`http://localhost:3000/realstudents?session=${this.selectedSession}&time=${this.selectedTime}`).subscribe(
          studentData => {
            const uniqueStudents = this.getUniqueStudentsById(studentData);
            uniqueStudents.sort((a, b) => a.id - b.id);

            // Process student attendance data and update teacher attendance and emotion data
            this.processStudentAttendanceData(uniqueStudents);
            this.updateTeacherAttendance();
            this.updateEmotionData();

            // Map student data to display
            this.students = uniqueStudents.map(student => ({
              name: student.Name,
              id: student.id,
              semester: student.Semester,
              attendance: this.getAttendancePercentage(student.id, studentData)
            }));

            // Informational message after filter is applied
            this.toastr.info('Filter applied successfully!');

            // Update the timestamp to mark the last execution
            this.lastExecuted = currentTime;

            // Resolve with true to indicate the filter was applied successfully
            resolve(true);
          },
          error => {
            // Error handling in case of a failed HTTP request
            console.error('Error loading student data:', error);
            this.toastr.error('Failed to load student data. Please try again.');

            // Reject the promise in case of an error
            resolve(false);
          }
        );
      } else {
        // If no session is selected, resolve with false
        resolve(false);
      }
    });
  }



  uniqueIDs: string[] = [];

  getUniqueIDs(): Observable<string[]> {
    const apiUrl = 'http://localhost:3000/realteachers'; // API endpoint
    return this.http.get<any[]>(apiUrl).pipe(
      map(teachers => {
        this.uniqueIDs = teachers.map(teacher => teacher.identificationNo); // Extract unique IDs
        console.log('Unique IDs fetched:', this.uniqueIDs);
        return this.uniqueIDs; // Return the unique IDs
      }),
      catchError(error => {
        console.error('Error fetching unique IDs:', error);
        return throwError('Failed to fetch unique IDs.');
      })
    );
  }

  updateTeacherAttendance(): void {
    this.getUniqueIDs().subscribe({
      next: (uniqueIDs) => {
        this.http.get<any[]>(`http://localhost:3000/realteachers`).subscribe(
          teacherData => {
            const uniqueStudents = this.getUniqueStudentsById(teacherData); // Call the uniqueStudents function

            const attendanceCounts: { [key: string]: number } = {};
            const days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            uniqueStudents.forEach(student => {
              const day = new Date(student.Time).toLocaleDateString('en-US', { weekday: 'short' });
              attendanceCounts[day] = (attendanceCounts[day] || 0) + (student.Attendance_Status === 'Present' ? 1 : 0);
            });

            const counts = days.map(day => attendanceCounts[day] || 0);

            this.teacherAttendanceData = {
              labels: days,
              datasets: [{ data: counts, label: 'Teacher Attendance' }]
            };

            this.loading = false; // Data loading complete
            this.updateCourseAssessment();
            this.toastr.success('Teacher attendance updated successfully!'); // Success message
          },
          error => {
            console.error('Error loading teacher data:', error);
            this.toastr.error('Failed to load teacher data. Please try again.'); // Error message
          }
        );
      },
      error: (error) => {
        this.loading = false; // Stop loading if there's an error fetching unique IDs
        this.toastr.error(error); // Show error message
      }
    });
  }

  updateEmotionData(): void {
    this.applyFilter().then((filterApplied) => {
      if (filterApplied) {
        this.http.get<any[]>('http://localhost:3000/realstudents').subscribe(
          students => {
            let focusedCount = 0;
            let nonSeriousCount = 0;
            let demotivatedCount = 0;

            students.forEach(student => {
              focusedCount += student.Focused;
              nonSeriousCount += student.Non_Serious;
              demotivatedCount += student.Demotivated;
            });

            const totalEmotions = focusedCount + nonSeriousCount + demotivatedCount;

            this.emotionData = {
              labels: ['Focused', 'Non-serious', 'Demotivated'],
              datasets: [{
                data: [focusedCount, nonSeriousCount, demotivatedCount],
                backgroundColor: ['#42A5F5', '#FF6384', '#FF9F40']
              }]
            };

            this.emotionPercentages['Focused'] = totalEmotions ? Math.round((focusedCount / totalEmotions) * 100) : 0;
            this.emotionPercentages['Non-serious'] = totalEmotions ? Math.round((nonSeriousCount / totalEmotions) * 100) : 0;
            this.emotionPercentages['Demotivated'] = totalEmotions ? Math.round((demotivatedCount / totalEmotions) * 100) : 0;

            this.toastr.success('Emotion data updated successfully!'); // Success message
          },
          error => {
            console.error('Error updating emotion data:', error);
            this.toastr.error('Failed to update emotion data. Please try again.'); // Error message
          }
        );
      }
    });
  }


  getAttendancePercentage(studentId: number, studentData: any[]): string {
    const attendanceMap = new Map<string, { status: string }>();

    studentData.forEach(record => {
      if (record.id === studentId) {
        const date = new Date(record.Time).toISOString().split('T')[0];
        if (!attendanceMap.has(date)) {
          attendanceMap.set(date, { status: record.Attendance_status });
        }
      }
    });

    let uniquePresentDays = 0;
    const totalUniqueDays = attendanceMap.size;

    attendanceMap.forEach(entry => {
      if (entry.status === 'Present') {
        uniquePresentDays++;
      }
    });

    const attendancePercentage = totalUniqueDays > 0
      ? (uniquePresentDays / totalUniqueDays) * 100
      : 0;

    return `${attendancePercentage.toFixed(2)}%`;
  }

  private getUniqueStudentsById(students: any[]): any[] {
    const unique = new Map<number, any>();
    students.forEach(student => {
      if (!unique.has(student.id)) {
        unique.set(student.id, student);
      }
    });
    return Array.from(unique.values());
  }

  processStudentAttendanceData(studentData: any[]): void {
    const attendanceCounts: { [key: string]: number } = {};
    const days: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    studentData.forEach(student => {
      const day = new Date(student.Time).toLocaleDateString('en-US', { weekday: 'short' });
      attendanceCounts[day] = (attendanceCounts[day] || 0) + (student.Attendance_status === 'Present' ? 1 : 0);
    });

    const counts = days.map(day => attendanceCounts[day] || 0);

    this.studentAttendanceData = {
      labels: days,
      datasets: [{ data: counts, label: 'Student Attendance' }]
    };

    this.updateTeacherAttendance();
  }

  updateCourseAssessment(): void {
    this.courseAssessmentData = {
      labels: ['Course Assessment'],
      datasets: [{
        data: [this.teacherAttendanceData.datasets[0].data.length, 100 - this.teacherAttendanceData.datasets[0].data.length],
        backgroundColor: ['#42A5F5', '#EBEFF2']
      }]
    };
  }
}
