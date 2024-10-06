import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Student {
    firstName: string;
    lastName: string;
    semester: string;
    identificationNumber: string;
    dateOfBirth: string;
    dateOfAdmission: string;
    degreeTitle: string;
    yearOfStudy: string;
    uploadPicture: string;
}

@Injectable({
    providedIn: 'root'
})
export class StudentService {

    private apiUrl = 'http://localhost:5000/api/students'; // Adjust if needed for your production URL

    constructor(private http: HttpClient) { }

    getStudents(): Observable<Student[]> {
        return this.http.get<Student[]>(this.apiUrl);
    }

    addStudent(student: Student): Observable<Student> {
        return this.http.post<Student>(this.apiUrl, student);
    }
}
