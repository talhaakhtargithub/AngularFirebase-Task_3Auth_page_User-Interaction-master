import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface Course {
  name: string;
  session: string;
  semester: string;
  creditHours: number;
}

export interface Teacher {
  courses: string[];
  id: number;
  firstName: string;
  lastName:string;
  attendanceStatus: string;
  noOfTimesErased: number;
  time: string;
  semester: string;
  coursesList: Course[];
  uploadPicture: string;
}

@Component({
  selector: 'app-teacher-individual',
  templateUrl: './teacher-individual.component.html',
  styleUrls: ['./teacher-individual.component.scss']
})
export class TeacherIndividualComponent implements OnInit {
  teacher: Teacher = { courses: [], coursesList: [] } as unknown as Teacher;
  teacherId: string = '';
  private teacherIdSubject = new Subject<string>();

  // Chart Data for Attendance (Bar Chart)
  attendanceData: ChartData<'bar'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as string[],
    datasets: [
      {
        label: 'Attendance Percentage',
        data: []
      }
    ]
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

// Define the structure for assessmentData without predefined labels
assessmentData: ChartData<'doughnut'> | undefined = {
  datasets: [
    {
      label: 'Erased Count Assessment', // Label for the dataset
      data: [0, 0, 0], // Initial data values for each segment
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'], // Colors for each section of the doughnut
      hoverOffset: 4, // Optional: Increase the hover offset for better visual effect
    }
  ]
};

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.teacherIdSubject.pipe(debounceTime(100)).subscribe((id) => {
      this.filterTeacherData(id);
    });
  }

  onTeacherIdInput(id: string): void {
    this.teacherIdSubject.next(id);
  }

  filterTeacherData(teacherId: string): void {
    // Reset teacher details before fetching new data
    this.resetTeacherDetails();

    if (teacherId) {
      this.http.get<Teacher[]>('http://localhost:3000/api/teachers').subscribe((teachers) => {
        if (Array.isArray(teachers)) {
          const filteredTeacher = teachers.find(teacher => teacher.id && teacher.id.toString() === teacherId.trim());

          if (filteredTeacher) {
            this.teacher = { ...filteredTeacher };

            // Fetch attendance data and number of times erased
            this.fetchAttendanceData(filteredTeacher.id.toString());
            this.fetchErasedData(filteredTeacher.id.toString());
          } else {
            alert('No teacher found with the given ID');
          }
        } else {
          alert('Error: Teachers data is not in the expected format');
        }
      }, error => {
        alert('Error fetching teacher data');
        console.error('Error fetching teacher data:', error);
      });
    }
  }



  // Fetch and process attendance data for the bar chart
  fetchAttendanceData(teacherId: string): void {
    const attendanceUrl = 'http://localhost:3000/realteachers';

    this.http.get<any[]>(attendanceUrl).subscribe((teachers) => {
      const dailyAttendanceCount: { [key: string]: number } = {};
      const dailyTotalTeachers: { [key: string]: number } = {};

      if (this.attendanceData.labels) {
        this.attendanceData.labels.forEach((day: any) => {
          dailyAttendanceCount[day] = 0;
          dailyTotalTeachers[day] = 0;
        });
      }

      teachers.forEach(teacher => {
        const attendanceDate = new Date(teacher.Time).toLocaleDateString('en-US', { weekday: 'short' });
        if (this.attendanceData.labels && this.attendanceData.labels.includes(attendanceDate)) {
          dailyTotalTeachers[attendanceDate] = (dailyTotalTeachers[attendanceDate] || 0) + 1;
          if (teacher.Attendance_Status === 'Present') {
            dailyAttendanceCount[attendanceDate] = (dailyAttendanceCount[attendanceDate] || 0) + 1;
          }
        }
      });

      if (this.attendanceData.labels) {
        this.attendanceData.datasets[0].data = this.attendanceData.labels.map((day: any) => {
          const presentCount = dailyAttendanceCount[day] || 0;
          const totalCount = dailyTotalTeachers[day] || 0;
          return totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
        });
      }

      this.cdr.detectChanges();
    });
  }
  fetchErasedData(teacherId: string): void {
    const erasedUrl = 'http://localhost:3000/realteachers'; // Adjust this URL if necessary
    const maxErased = 3; // Maximum number of erased counts to consider

    this.http.get<any[]>(erasedUrl).subscribe((teachers) => {
        console.log('Fetched teachers:', teachers);

        // Filter teachers by ID
        const matchingTeachers = teachers.filter(teacher => teacher.id.toString() === teacherId);

        if (matchingTeachers.length === 0) {
            console.warn(`No teachers found with id: ${teacherId}`);
            return;
        }

        // Determine the maximum erased count (up to maxErased)
        const erasedCounts = matchingTeachers
            .map(teacher => teacher.No_of_times_Erased)
            .filter(count => count > 0 && count <= maxErased); // Only include counts that are 1, 2, or 3

        const maxErasedCount = erasedCounts.length > 0 ? Math.max(...erasedCounts) : 0;

        // Initialize a map to hold total teaching time for each date
        const dailyTeachingHours = new Map<string, number>();

        matchingTeachers.forEach(teacher => {
            const date = new Date(teacher.Time).toISOString().split('T')[0]; // Extract date (YYYY-MM-DD)
            const timeStamp = new Date(teacher.Time).getTime(); // Get time in milliseconds

            // If this is the first entry for the date, initialize it
            if (!dailyTeachingHours.has(date)) {
                dailyTeachingHours.set(date, 0);
            }

            // Increment the teaching hours for the date
            // Here we assume each entry corresponds to a certain amount of time
            // For example, we can set each entry to represent a fraction of an hour
            dailyTeachingHours.set(date, dailyTeachingHours.get(date)! + 0.5); // Assuming each entry represents 0.5 hours
        });

        // Calculate the total teaching hours across all days
        const overallTeachingHours = Array.from(dailyTeachingHours.values()).reduce((acc, hours) => acc + hours, 0);

        console.log(`Max Erased Count for teacherId ${teacherId}: ${maxErasedCount}`);
        console.log(`Overall Teaching Hours: ${overallTeachingHours.toFixed(2)} hr`); // Show total hours with 2 decimal precision

        // Set up the assessment data with the max erased count and overall hours
        this.assessmentData = {
            labels: ['Max Erased Count', 'Total Hours'],
            datasets: [
                {
                    label: 'Teaching Data',
                    data: [maxErasedCount, overallTeachingHours],
                    backgroundColor: ['#FF6384', '#36A2EB'], // Colors for max erased and total hours
                }
            ]
        };

        this.cdr.detectChanges();
    }, error => {
        console.error('Error fetching erased data:', error);
    });
}




  resetTeacherDetails(): void {
    this.teacher = {
      courses: [],
      coursesList: []
    } as unknown as Teacher;
    this.attendanceData.datasets[0].data = [];
    this.assessmentData = undefined; // Reset assessment data
    this.cdr.detectChanges();
  }
}
