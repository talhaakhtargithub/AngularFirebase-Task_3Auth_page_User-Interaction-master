import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartData } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface Course {
  id: number;
  title: string;
  session: string;
  semester: string;
  creditHours: number;
}

@Component({
  selector: 'app-student-individual',
  templateUrl: './student-individual.component.html',
  styleUrls: ['./student-individual.component.scss']
})
export class StudentIndividualComponent implements OnInit {
  student: any = {}; // Student data will be fetched from API
  studentId: string = ''; // Holds the entered student ID
  private studentIdSubject = new Subject<string>(); // For debouncing student ID input

  assessmentData: ChartData<'doughnut'> = {
    labels: ['Focused', 'Non_Serious', 'Demotivated'],
    datasets: [{ data: [0, 0, 0] }] // Initialize with zeros
  };

  courses: Course[] = [
    { id: 1, title: "Introduction to Programming", session: "2023-2024", semester: "Fall", creditHours: 3 },
    { id: 2, title: "Data Structures and Algorithms", session: "2023-2024", semester: "Fall", creditHours: 4 },
    { id: 3, title: "Database Management Systems", session: "2023-2024", semester: "Spring", creditHours: 3 },
    { id: 4, title: "Web Development", session: "2023-2024", semester: "Spring", creditHours: 4 },
    { id: 5, title: "Software Engineering", session: "2023-2024", semester: "Summer", creditHours: 3 },
    { id: 6, title: "Machine Learning", session: "2023-2024", semester: "Summer", creditHours: 4 }
  ];

  attendanceData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as string[],
    datasets: [
      { label: 'Attendance Percentage', data: [] }
    ]
  };

  private socket!: WebSocket;
  teacherId: any;
  teacher: any;
  toastr: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeWebSocket();

    this.studentIdSubject.pipe(debounceTime(100)).subscribe((id) => {
      this.filterStudentData(id);
    });
  }

  initializeWebSocket(): void {
    this.socket = new WebSocket('ws://localhost:3000'); // Customize WebSocket URL

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket data received:', data);
      this.updateAssessmentData(); // Update with incoming WebSocket data
      this.cdr.detectChanges(); // Trigger change detection
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  filterStudentData(studentId: string): void {
    if (studentId) {
      this.http.get<any[]>('http://localhost:3000/api/students').subscribe((students) => {
        const filteredStudent = students.find(student => student.id === studentId.trim());

        if (filteredStudent) {
          this.student.name = `${filteredStudent.firstName} ${filteredStudent.lastName}`;
          this.student.id = filteredStudent.id;
          this.student.semester = parseInt(filteredStudent.semester.trim(), 10);
          this.student.yearOfStudy = filteredStudent.yearOfStudy;
          this.student.uploadPicture = filteredStudent.uploadPicture;

          // Fetch assessment data
          this.fetchAssessmentData(filteredStudent.id);
        } else {
          alert('Student not found');
          this.resetStudentDetails();
        }
      }, error => {
        alert('Error fetching student data');
        console.error('Error fetching student data:', error);
      });
    } else {
      alert('Please enter a valid ID');
    }
  }

  onStudentIdInput(id: string): void {
    this.studentIdSubject.next(id);
  }

  fetchAttendanceData(studentAssessment?: any): void {
    const attendanceUrl = 'http://localhost:3000/realstudents';

    this.http.get<any[]>(attendanceUrl).subscribe((students) => {
      const dailyAttendanceCount: { [key: string]: number } = {};
      const dailyTotalStudents: { [key: string]: number } = {};

      if (this.attendanceData.labels) {
        this.attendanceData.labels.forEach((day: any) => {
          dailyAttendanceCount[day] = 0;
          dailyTotalStudents[day] = 0;
        });
      }

      students.forEach(student => {
        const attendanceDate = new Date(student.Time).toLocaleDateString('en-US', { weekday: 'short' });
        if (this.attendanceData.labels && this.attendanceData.labels.includes(attendanceDate)) {
          dailyTotalStudents[attendanceDate] = (dailyTotalStudents[attendanceDate] || 0) + 1;
          if (student.Attendance_status === 'Present') {
            dailyAttendanceCount[attendanceDate] = (dailyAttendanceCount[attendanceDate] || 0) + 1;
          }
        }
      });

      if (this.attendanceData.labels) {
        this.attendanceData.datasets[0].data = this.attendanceData.labels.map((day: any) => {
          const presentCount = dailyAttendanceCount[day] || 0;
          const totalCount = dailyTotalStudents[day] || 0;
          return totalCount ? (presentCount / totalCount) * 100 : 0;
        });
      }

      this.cdr.detectChanges();
    }, error => {
      console.error('Error fetching attendance data:', error);
      alert('Error fetching attendance data');
    });
  }

  fetchAssessmentData(studentId: string): void {
    const assessmentUrl = 'http://localhost:3000/realstudents';

    this.http.get<any[]>(assessmentUrl).subscribe((assessments) => {
      const studentAssessment = assessments.find(assessment => assessment.id.toString() === studentId.trim());

      if (studentAssessment) {
        this.fetchAttendanceData(studentAssessment);
        this.updateAssessmentData();
      } else {
        this.assessmentData.datasets[0].data = [0, 0, 0];
        this.attendanceData.datasets[0].data = [];
      }

      this.cdr.detectChanges();
    }, error => {
      alert('Error fetching assessment data');
      console.error('Error fetching assessment data:', error);
    });
  }






  updateAssessmentData(): void {
    this.http.get<any[]>('http://localhost:3000/realstudents').subscribe(
      students => {
        let focusedCount = 0;
        let nonSeriousCount = 0;
        let demotivatedCount = 0;

        // Iterate through each student's assessment
        students.forEach(studentAssessment => {
          focusedCount += studentAssessment.Focused ? 1 : 0;
          nonSeriousCount += studentAssessment.Non_Serious ? 1 : 0;
          demotivatedCount += studentAssessment.Demotivated ? 1 : 0;
        });

        const totalCount = focusedCount + nonSeriousCount + demotivatedCount;

        // Update the chart dataset with percentages
        this.assessmentData = {
          labels: ['Focused', 'Non-serious', 'Demotivated'],
          datasets: [{
            data: [
              totalCount ? (focusedCount / totalCount) * 100 : 0,
              totalCount ? (nonSeriousCount / totalCount) * 100 : 0,
              totalCount ? (demotivatedCount / totalCount) * 100 : 0
            ],
            backgroundColor: ['#42A5F5', '#FF6384', '#FF9F40']
          }]
        };

        this.cdr.detectChanges();  // Detect changes for chart update
        this.toastr.success('Assessment data updated successfully!');  // Success message
      },
      error => {
        console.error('Error updating assessment data:', error);
        this.toastr.error('Failed to update assessment data. Please try again.');  // Error message
      }
    );
  }


  resetStudentDetails(): void {
    this.student = {};
    this.assessmentData.datasets[0].data = [0, 0, 0];
    this.attendanceData.datasets[0].data = [];
    this.cdr.detectChanges();
  }
}
