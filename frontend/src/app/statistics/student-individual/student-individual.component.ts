import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
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
    datasets: [{
      data: [0, 0, 0], // Initialize with zeros
      backgroundColor: ['#FF5733', '#33FF57', '#3357FF'], // Example background colors for the segments
    }]
  };



  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          generateLabels: (chart) => {
            const data = chart.data.datasets[0].data;
            const labels = chart.data.labels || [];
            const total = data.reduce((acc: number, curr: any) => {
              // Ensure the value is treated as a number
              return acc + (typeof curr === 'number' ? curr : 0);
            }, 0);

            return labels.map((label, i) => {
              const value = data[i];
              // Ensure value is a number before performing arithmetic
              const numericValue = typeof value === 'number' ? value : 0;
              const percentage = total > 0 ? ((numericValue / total) * 100).toFixed(2) : '0';  // Calculate percentage
              return {
                text: `${label}: ${percentage}%`,  // Display percentage next to the label
                fillStyle: chart.data.datasets[0].backgroundColor instanceof Array
                          ? (chart.data.datasets[0].backgroundColor as string[])[i]
                          : '#000000',  // Ensure we access the color from the array
              };
            });
          },
        },
      },
    },
  };

  attendanceData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as string[],
    datasets: [
      { label: 'Attendance Percentage', data: [] }
    ]
  };

  courses: Course[] = [
    { id: 1, title: "Introduction to Programming", session: "2023-2024", semester: "Fall", creditHours: 3 },
    { id: 2, title: "Data Structures and Algorithms", session: "2023-2024", semester: "Fall", creditHours: 4 },
    { id: 3, title: "Database Management Systems", session: "2023-2024", semester: "Spring", creditHours: 3 },
    { id: 4, title: "Web Development", session: "2023-2024", semester: "Spring", creditHours: 4 },
    { id: 5, title: "Software Engineering", session: "2023-2024", semester: "Summer", creditHours: 3 },
    { id: 6, title: "Machine Learning", session: "2023-2024", semester: "Summer", creditHours: 4 }
  ];

  private socket!: WebSocket;
  teacherId: any;
  teacher: any;
  toastr: any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

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
      this.cdr.detectChanges(); // Trigger change detection when new data is received
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
      // Fetch stored data from /api/students
      this.http.get<any[]>('http://localhost:3000/api/students')?.subscribe({
        next: (students) => {
          const filteredStudent = students.find(student => student.id === studentId.trim());

          if (filteredStudent) {
            this.student.name = `${filteredStudent.firstName} ${filteredStudent.lastName}`;
            this.student.id = filteredStudent.id;
            this.student.semester = parseInt(filteredStudent.semester.trim(), 10);
            this.student.yearOfStudy = filteredStudent.yearOfStudy;
            this.student.uploadPicture = filteredStudent.uploadPicture;

            // Fetch assessment data and attendance for this student
            this.fetchRealTimeData(studentId);

          } else {
            this.resetStudentDetails();
            alert('Student not found in stored data');

          }
        },
        error: (error) => {
          alert('Error fetching student data');
          console.error('Error fetching student data:', error);
        }
      });
    } else {
      alert('Please enter a valid ID');
    }
  }

  fetchRealTimeData(studentId: string): void {
    // Fetch real-time data from /realstudents/:studentId
    this.http.get<any>(`http://localhost:3000/realstudents/${studentId}`).subscribe({
      next: (studentData) => {
        if (studentData) {
          // Process the real-time data to calculate attendance and assessments
          this.fetchAttendanceData(studentId); // Fetch attendance based on studentId
          this.fetchAssessmentData(studentId); // Update assessment data
        } else {
          console.log('Real-time student data not found');
        }
      },
      error: (error) => {
        console.error('Error fetching real-time data:', error);
        alert('Error fetching real-time data');
      }
    });
  }

  fetchAttendanceData(studentId: string): void {
    const attendanceUrl = `http://localhost:3000/realstudents/${studentId}`;

    this.http.get<any[]>(attendanceUrl).subscribe({
      next: (students) => {
        const dailyAttendanceCount: { [key: string]: number } = {};
        const dailyTotalStudents: { [key: string]: number } = {};

        // Ensure attendanceData.labels exists before proceeding
        if (this.attendanceData.labels) {
          this.attendanceData.labels.forEach((day: any) => {
            dailyAttendanceCount[day] = 0;
            dailyTotalStudents[day] = 0;
          });
        } else {
          console.warn('Attendance data labels are not defined');
          return;
        }

        students.forEach((student) => {
          const attendanceDate = new Date(student.Time).toLocaleDateString('en-US', { weekday: 'short' });

          if (this.attendanceData.labels && this.attendanceData.labels.includes(attendanceDate)) {
            dailyTotalStudents[attendanceDate] = (dailyTotalStudents[attendanceDate] || 0) + 1;

            if (student.Attendance_status === 'Present') {
              dailyAttendanceCount[attendanceDate] = (dailyAttendanceCount[attendanceDate] || 0) + 1;
            }
          }
        });

        // Ensure there are labels to work with
        const newData = (this.attendanceData.labels || []).map((day: any) => {
          const present = dailyAttendanceCount[day] || 0;
          const total = dailyTotalStudents[day] || 0;
          return total ? (present / total) * 100 : 0;
        });

        // Update attendance data immutably
        this.attendanceData = {
          ...this.attendanceData,
          datasets: [
            {
              ...this.attendanceData.datasets[0],
              data: newData,
            },
          ],
        };

        // Trigger change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching attendance data:', error);
        alert('Error fetching attendance data');
      },
    });
  }


  fetchAssessmentData(studentId: string): void {
    const assessmentUrl = `http://localhost:3000/realstudents/${studentId}`;

    this.http.get<any>(assessmentUrl).subscribe({
      next: (studentData) => {
        if (studentData) {
          // Update assessment data after fetching
          this.updateAssessmentData(studentData);
        } else {
          console.log('Student data not found for assessments');
        }
      },
      error: (error) => {
        console.error('Error fetching assessment data:', error);
        alert('Error fetching assessment data');
      }
    });
  }

  updateAssessmentData(studentDataArray: any[]): void {
    let focusedCount = 0;
    let nonSeriousCount = 0;
    let demotivatedCount = 0;

    // Loop through the array of student data and count the occurrences
    studentDataArray.forEach(studentData => {
      focusedCount += studentData.Focused === 1 ? 1 : 0;
      nonSeriousCount += studentData.Non_Serious === 1 ? 1 : 0;
      demotivatedCount += studentData.Demotivated === 1 ? 1 : 0;
    });

    const totalCount = focusedCount + nonSeriousCount + demotivatedCount;

    // Calculate the percentages and update the assessment chart dataset
    this.assessmentData = {
      labels: ['Focused', 'Non-serious', 'Demotivated'],
      datasets: [{
        data: [
          totalCount ? (focusedCount / totalCount) * 100 : 0,  // Focused percentage
          totalCount ? (nonSeriousCount / totalCount) * 100 : 0,  // Non-serious percentage
          totalCount ? (demotivatedCount / totalCount) * 100 : 0  // Demotivated percentage
        ],
        backgroundColor: ['#42A5F5', '#FF6384', '#FF9F40']
      }]
    };

    this.cdr.detectChanges();  // Detect changes for chart update
  }

  resetStudentDetails(): void {
    this.student = {};

    // Reset assessment data immutably
    this.assessmentData = {
      ...this.assessmentData,
      datasets: [
        {
          ...this.assessmentData.datasets[0],
          data: [0, 0, 0], // Reset data
        },
      ],
    };

    // Reset attendance data immutably
    this.attendanceData = {
      ...this.attendanceData,
      datasets: [
        {
          ...this.attendanceData.datasets[0],
          data: [], // Reset data
        },
      ],
    };

    this.cdr.detectChanges(); // Trigger change detection
  }

}
