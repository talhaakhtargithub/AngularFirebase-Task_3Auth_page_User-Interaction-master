import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Student {
  firstName: string;
  lastName: string;
  semester: string;
  identificationNumber: string;
  dateOfBirth: string;
  dateOfAdmission: string;
  degreeTitle: string;
  yearOfStudy: number;
  uploadPicture: string; // Include picture URL
}

@Component({
  selector: 'app-student-table',
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
})
export class StudentTableComponent implements OnInit {
  students: Student[] = [];
  page = 1; // For pagination

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchStudents();
  }

  fetchStudents() {
    this.http.get<Student[]>(`http://localhost:3000/api/students?page=${this.page}`).subscribe(
      (data) => {
        this.students = [...this.students, ...data]; // Append new data to existing list
      },
      (err) => {
        console.error('Error fetching students:', err);
      }
    );
  }

  onScroll() {
    this.page++;
    this.fetchStudents(); // Fetch next set of students
  }

  onEdit(student: Student) {
    console.log('Edit student:', student);
    // Navigate to the edit component
  }

  onDelete(identificationNumber: string) {
    if (confirm('Are you sure you want to delete this student?')) {
      this.http.delete(`http://localhost:3000/api/students/${identificationNumber}`).subscribe({
        next: () => {
          this.students = this.students.filter(student => student.identificationNumber !== identificationNumber);
          alert('Student deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting student:', err);
          alert('Error deleting student: ' + err.error.message);
        }
      });
    }
  }
}
