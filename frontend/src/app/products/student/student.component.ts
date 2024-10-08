import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { io } from 'socket.io-client';

interface Student {
  firstName: string;
  lastName: string;
  semester: string;
  id: string;
  dateOfBirth: string;
  dateOfAdmission: string;
  degreeTitle: string;
  yearOfStudy: number;
  uploadPicture: string;
}

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
})
export class StudentComponent implements OnInit, OnDestroy {
  studentForm: FormGroup;
  students: Student[] = [];
  semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  years = ['2020-2024', '2021-2025', '2022-2026', '2023-2027'];
  degrees = [
    'Bachelor of Science in Electrical Engineering',
    'Bachelor of Science in Chemical Engineering',
    'Bachelor of Science in Industrial Engineering',
    'Bachelor of Science in Metallurgical Engineering',
    'Bachelor of Science in Environmental Engineering',
    'Bachelor of Science in Software Engineering',
    'Bachelor of Science in Computer Science (CS)',
    'Bachelor of Science in Information Technology Engineering',
  ];

  selectedFile: File | null = null;
  studentId: string | null = null;
  page = 1;
  isShowForm = true;
  socket: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.studentForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      semester: ['', Validators.required],
      id: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      dateOfAdmission: ['', Validators.required],
      degreeTitle: ['', Validators.required],
      yearOfStudy: ['', Validators.required],
      uploadPicture: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.initializeSocket();
    this.loadStudents();
    this.route.paramMap.subscribe((params) => {
      this.studentId = params.get('id');
      if (this.studentId) {
        this.getStudentDetails(this.studentId);
      } else {
        this.toastr.warning('No student ID found in route.', 'Warning');
      }
    });
  }

  private initializeSocket(): void {
    this.socket = io('http://localhost:3000'); // Change to your server URL

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('studentAdded', (student: Student) => {
      this.students.push(student);
      this.toastr.success('A new student has been added', 'Success');
      console.log('Student added:', student);
    });

    this.socket.on('studentUpdated', (updatedStudent: Student) => {
      const index = this.students.findIndex(s => s.id === updatedStudent.id);
      if (index !== -1) {
        this.students[index] = updatedStudent; // Update the student in the array
        this.toastr.success('Student details updated', 'Success');
        console.log('Student updated:', updatedStudent);
      }
    });

    this.socket.on('studentDeleted', (id: string) => {
      this.students = this.students.filter(student => student.id !== id);
      this.toastr.success('Student deleted successfully', 'Success');
      console.log('Student deleted:', id);
      this.checkAndDeleteAllPictures(); // Check and delete pictures if no students left
    });
  }

  loadStudents(): void {
    this.http.get<Student[]>(`http://localhost:3000/api/students?page=${this.page}`).subscribe(
      (data) => {
        console.log('Students loaded:', data); // Log the response data
        this.students = [...this.students, ...data];
        this.toastr.success('Students loaded successfully', 'Success');
      },
      (err) => {
        console.error('Error fetching students:', err);
        this.toastr.error('Error fetching students: ' + (err.error?.message || 'Unknown error'), 'Error');
      }
    );
  }

  getStudentDetails(id: string): void {
    this.http.get<Student>(`http://localhost:3000/api/students/${id}`).subscribe({
      next: (student) => {
        this.studentForm.patchValue(student);
        this.toastr.success('Student details loaded successfully', 'Success');
      },
      error: (err) => {
        console.error('Error fetching student details:', err);
        this.toastr.error('Error fetching student details: ' + (err.error?.message || 'Unknown error'), 'Error');
      },
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = file || null;
    this.studentForm.get('uploadPicture')?.setErrors(this.selectedFile ? null : { required: true });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.toastr.warning('Please fill out the form correctly before submitting.', 'Form Validation');
      return;
    }

    // Check for duplicate ID only when creating
    if (!this.studentId) {
      this.checkStudentId(this.studentForm.value.id);
    } else {
      this.updateStudent();
    }
  }

  private checkStudentId(id: string): void {
    this.http.get<any>(`http://localhost:3000/api/students/check/${id}`).subscribe({
      next: () => {
        this.createStudent();
      },
      error: (err) => {
        this.toastr.error('Error: ' + (err.error?.message || 'Unknown error'), 'Error');
      }
    });
  }

  createStudent(): void {
    const formData = this.buildFormData();
    console.log('FormData being sent:', formData); // Log FormData

    this.http.post<any>('http://localhost:3000/api/students', formData).subscribe({
      next: (response) => {
        this.toastr.success('Student added successfully', 'Success');
        this.resetForm();
      },
      error: (err) => {
        this.toastr.error('Error adding student: ' + (err.error?.message || 'Unknown error'), 'Error');
        console.error('Error adding student:', err);
      },
    });
  }

  updateStudent(): void {
    const formData = this.buildFormData();
    console.log('Updating student with FormData:', formData); // Log FormData

    this.http.put<any>(`http://localhost:3000/api/students/${this.studentId}`, formData).subscribe({
      next: (response) => {
        this.toastr.success('Student updated successfully', 'Success');
        this.resetForm();
      },
      error: (err) => {
        this.toastr.error('Error updating student: ' + (err.error?.message || 'Unknown error'), 'Error');
        console.error('Error updating student:', err);
      },
    });
  }

  deleteStudent(id: string): void {
    this.http.delete<any>(`http://localhost:3000/api/students/${id}`).subscribe({
      next: () => {
        this.socket.emit('studentDeleted', id); // Notify others about the deletion
        this.students = this.students.filter(student => student.id !== id);
        this.toastr.success('Student deleted successfully', 'Success');
        this.checkAndDeleteAllPictures(); // Check and delete pictures if no students left
      },
      error: (err) => {
        this.toastr.error('Error deleting student: ' + (err.error?.message || 'Unknown error'), 'Error');
        console.error('Error deleting student:', err);
      },
    });
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    Object.keys(this.studentForm.value).forEach(key => {
      formData.append(key, this.studentForm.value[key]);
    });
    if (this.selectedFile) {
      formData.append('uploadPicture', this.selectedFile, this.selectedFile.name);
    }
    return formData;
  }

  resetForm(): void {
    this.studentForm.reset();
    this.selectedFile = null;
    this.studentId = null;
    this.loadStudents();
  }

  checkAndDeleteAllPictures(): void {
    if (this.students.length === 0) {
      this.http.delete('http://localhost:3000/api/students/pictures').subscribe({
        next: () => {
          this.toastr.success('All student pictures deleted successfully', 'Success');
        },
        error: (err) => {
          this.toastr.error('Error deleting pictures: ' + (err.error?.message || 'Unknown error'), 'Error');
          console.error('Error deleting pictures:', err);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.socket.disconnect(); // Disconnect WebSocket when the component is destroyed
  }
}
