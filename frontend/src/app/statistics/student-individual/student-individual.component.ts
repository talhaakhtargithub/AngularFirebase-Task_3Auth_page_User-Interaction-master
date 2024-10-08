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
    {
      id: 1,
      title: "Introduction to Programming",
      session: "2023-2024",
      semester: "Fall",
      creditHours: 3
    },
    {
      id: 2,
      title: "Data Structures and Algorithms",
      session: "2023-2024",
      semester: "Fall",
      creditHours: 4
    },
    {
      id: 3,
      title: "Database Management Systems",
      session: "2023-2024",
      semester: "Spring",
      creditHours: 3
    },
    {
      id: 4,
      title: "Web Development",
      session: "2023-2024",
      semester: "Spring",
      creditHours: 4
    },
    {
      id: 5,
      title: "Software Engineering",
      session: "2023-2024",
      semester: "Summer",
      creditHours: 3
    },
    {
      id: 6,
      title: "Machine Learning",
      session: "2023-2024",
      semester: "Summer",
      creditHours: 4
    }
  ];

  // Chart Data for Attendance (Bar Chart)
  attendanceData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as string[], // Explicitly cast as string[]
    datasets: [
      {
        label: 'Attendance Percentage',
        data: [] // Will hold the calculated attendance percentage for each day
      }
    ]
  };

  private socket!: WebSocket;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Initialize WebSocket connection
    this.initializeWebSocket();

    // Debounce student ID input
    this.studentIdSubject.pipe(debounceTime(100)).subscribe((id) => {
      this.filterStudentData(id);
    });
  }

  // Method to initialize WebSocket
  initializeWebSocket(): void {
    this.socket = new WebSocket('ws://localhost:3000'); // Update with your WebSocket URL

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket data received:', data);
      this.updateAssessmentData(data); // Update assessment data with incoming WebSocket data
      this.cdr.detectChanges(); // Trigger change detection
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  // Method to filter student data based on identification number
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

  // Handle student ID input
  onStudentIdInput(id: string): void {
    this.studentIdSubject.next(id); // Emit the input value
  }

  // Fetch and process attendance data for the bar chart
  fetchAttendanceData(studentAssessment?: any): void {
    const attendanceUrl = 'http://localhost:3000/realstudents';

    this.http.get<any[]>(attendanceUrl).subscribe((students) => {
      const dailyAttendanceCount: { [key: string]: number } = {};
      const dailyTotalStudents: { [key: string]: number } = {};

      // Initialize the day count if attendanceData.labels is defined
      if (this.attendanceData.labels) {
        this.attendanceData.labels.forEach((day: any) => {
          dailyAttendanceCount[day] = 0;
          dailyTotalStudents[day] = 0;
        });
      }

      // Process each student's attendance data
      students.forEach(student => {
        const attendanceDate = new Date(student.Time).toLocaleDateString('en-US', { weekday: 'short' });
        if (this.attendanceData.labels && this.attendanceData.labels.includes(attendanceDate)) {
          dailyTotalStudents[attendanceDate] = (dailyTotalStudents[attendanceDate] || 0) + 1;
          if (student.Attendance_status === 'Present') {
            dailyAttendanceCount[attendanceDate] = (dailyAttendanceCount[attendanceDate] || 0) + 1;
          }
        }
      });

      // Calculate attendance percentage for each day
      if (this.attendanceData.labels) {
        this.attendanceData.datasets[0].data = this.attendanceData.labels.map((day: any) => {
          const presentCount = dailyAttendanceCount[day] || 0;
          const totalCount = dailyTotalStudents[day] || 0;
          return totalCount ? (presentCount / totalCount) * 100 : 0;
        });
      }

      // Update the chart
      this.cdr.detectChanges(); // Trigger change detection
    }, error => {
      console.error('Error fetching attendance data:', error);
      alert('Error fetching attendance data');
    });
  }

  // Fetch and process assessment data for the doughnut chart based on student ID
  fetchAssessmentData(studentId: string): void {
    const assessmentUrl = 'http://localhost:3000/realstudents';

    this.http.get<any[]>(assessmentUrl).subscribe((assessments) => {
      const studentAssessment = assessments.find(assessment => assessment.id.toString() === studentId.trim());

      if (studentAssessment) {
        this.fetchAttendanceData(studentAssessment); // Pass studentAssessment
        this.updateAssessmentData(studentAssessment);
      } else {
        this.assessmentData.datasets[0].data = [0, 0, 0];
        this.attendanceData.datasets[0].data = [];
      }

      // Update the charts after fetching data
      this.cdr.detectChanges(); // Trigger change detection
    }, error => {
      alert('Error fetching assessment data');
      console.error('Error fetching assessment data:', error);
    });
  }

  // Update the assessment data based on incoming WebSocket data
  updateAssessmentData(studentAssessment: any): void {
    const focusedCount = studentAssessment.Focused ? 1 : 0;
    const nonSeriousCount = studentAssessment.Non_Serious ? 1 : 0;
    const demotivatedCount = studentAssessment.Demotivated ? 1 : 0;

    const totalCount = focusedCount + nonSeriousCount + demotivatedCount;

    this.assessmentData.datasets[0].data = [
      totalCount ? (focusedCount / totalCount) * 100 : 0,
      totalCount ? (nonSeriousCount / totalCount) * 100 : 0,
      totalCount ? (demotivatedCount / totalCount) * 100 : 0
    ];

    // Update the chart
    this.cdr.detectChanges(); // Trigger change detection
  }

  // Reset student details
  resetStudentDetails(): void {
    this.student = {};
    this.assessmentData.datasets[0].data = [0, 0, 0]; // Reset assessment data
    this.attendanceData.datasets[0].data = []; // Reset attendance data
    this.cdr.detectChanges(); // Trigger change detection
  }
}
