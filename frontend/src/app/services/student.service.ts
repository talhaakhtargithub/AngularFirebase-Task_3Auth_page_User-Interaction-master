import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:3000/api'; // Your API base URL

  constructor(private http: HttpClient) {}

  // Method to get combined student and attendance data
  getCombinedData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/combined-data`); // Adjust API endpoint as needed
  }

  // Method to get sessions
  getSessions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/sessions`); // Adjust API endpoint as needed
  }

  // Method to get semesters
  getSemesters(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/semesters`); // Adjust API endpoint as needed
  }

  // Method to get courses by student ID
  getCourses(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/courses/${studentId}`); // Adjust API endpoint as needed
  }
}
