import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io'; // Ensure you have the correct import for Socket
import { ToastrService } from 'ngx-toastr'; // Import Toastr Service
import { Subscription } from 'rxjs';

interface Teacher {
  firstName: string;
  lastName: string;
  cnic: string;
  semester: string;
  courses: string[];
  uploadPicture?: string | null;
}

interface Course {
  Code: string;
  title: string;
}

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.scss']
})
export class TeacherComponent implements OnInit {
  teacherForm!: FormGroup;
  teachers: Teacher[] = [];
  courses: Course[] = [];
  semesters: string[] = [
    'Semester 1', 'Semester 2', 'Semester 3',
    'Semester 4', 'Semester 5', 'Semester 6',
    'Semester 7', 'Semester 8'
  ];
  isShowPage: boolean = false;
  private imageUrl: string | null = null; // Variable to hold the image URL
  private socketSubscription!: Subscription; // Subscription for socket events

  constructor(private fb: FormBuilder, private http: HttpClient, private socket: Socket, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadTeachers();
    this.loadCourses();
    this.setupSocketListeners(); // Set up socket listeners
  }

  initializeForm(): void {
    this.teacherForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      cnic: ['', [Validators.required, Validators.maxLength(13), Validators.pattern(/^\d{13}$/)]],
      semester: ['', Validators.required],
      courses: [[], Validators.required],
      uploadPicture: [null]
    });
  }

  loadTeachers(): void {
    this.http.get<Teacher[]>('http://localhost:3000/api/teachers')
      .subscribe(
        (data: Teacher[]) => {
          this.teachers = data.map(teacher => ({
            ...teacher,
            uploadPicture: teacher.uploadPicture || null,
            courses: teacher.courses || []
          }));
        },
        (error: any) => {
          console.error('Error fetching teachers:', error);
        }
      );
  }

  loadCourses(): void {
    this.http.get<Course[]>('http://localhost:3000/api/courses')
      .subscribe(
        (data: Course[]) => {
          this.courses = data;
        },
        (error: any) => {
          console.error('Error fetching courses:', error);
        }
      );
  }

  setupSocketListeners(): void {
    // Listen for teacherAdded event
    this.socket.fromEvent<Teacher>('teacherAdded').subscribe((teacher) => {
      this.teachers.push(teacher); // Add the new teacher to the list
      this.toastr.success('Teacher added successfully!'); // Show success toast
      console.log('Teacher added via socket:', teacher);
    });

    // Listen for teacherDeleted event
    this.socket.fromEvent<string>('teacherDeleted').subscribe((cnic) => {
      this.teachers = this.teachers.filter(teacher => teacher.cnic !== cnic); // Remove the deleted teacher
      this.toastr.success('Teacher deleted successfully!'); // Show success toast
      console.log('Teacher deleted via socket:', cnic);
    });
  }

  onSubmit(): void {
    if (this.teacherForm.valid) {
      const formData = this.createFormData();
      this.http.post('http://localhost:3000/api/teachers', formData)
        .subscribe({
          next: (response: any) => {
            this.toastr.success('Teacher added successfully!'); // Show success toast
            console.log('Teacher added successfully:', response);
            this.loadTeachers(); // Reload teachers after adding
            this.resetForm();
            this.isShowPage = false; // Hide the form after submission
          },
          error: (error: any) => {
            console.error('Error adding teacher:', error);
            this.toastr.error('Error adding teacher!'); // Show error toast
          }
        });
    } else {
      console.warn('Form is invalid', this.teacherForm.errors);
    }
  }

  private createFormData(): FormData {
    const formData = new FormData();
    formData.append('firstName', this.teacherForm.get('firstName')?.value);
    formData.append('lastName', this.teacherForm.get('lastName')?.value);
    formData.append('cnic', this.teacherForm.get('cnic')?.value);
    formData.append('semester', this.teacherForm.get('semester')?.value);
    formData.append('courses', JSON.stringify(this.teacherForm.get('courses')?.value));
    if (this.teacherForm.get('uploadPicture')?.value) {
      formData.append('uploadPicture', this.teacherForm.get('uploadPicture')?.value);
    }
    return formData;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.teacherForm.patchValue({
        uploadPicture: file
      });
      this.imageUrl = URL.createObjectURL(file); // Create an object URL
    }
  }

  getImageUrl(): string | null {
    return this.imageUrl; // Return the object URL
  }

  resetForm(): void {
    this.teacherForm.reset();
    this.teacherForm.get('courses')?.setValue([]); // Reset courses
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl); // Revoke the object URL
      this.imageUrl = null; // Clear the image URL reference
    }
  }

  toggleView(): void {
    this.isShowPage = !this.isShowPage;
    this.resetForm();
  }

  deleteTeacher(cnic: string): void {
    if (confirm('Are you sure you want to delete this teacher?')) {
      this.http.delete(`http://localhost:3000/api/teachers/${cnic}`)
        .subscribe({
          next: () => {
            this.toastr.success('Teacher deleted successfully!'); // Show success toast
            console.log('Teacher deleted successfully');
            this.loadTeachers(); // Reload teachers after deletion
          },
          error: (error) => {
            console.error('Error deleting teacher:', error);
            this.toastr.error('Error deleting teacher!'); // Show error toast
          }
        });
    }
  }
}
