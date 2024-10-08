import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-teacher-individual',
  templateUrl: './teacher-individual.component.html',
  styleUrls: ['./teacher-individual.component.css']
})
export class TeacherIndividualComponent {
  teacher: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('assets/student.json').subscribe((data: any) => {
      this.teacher = data.teacher;
      this.initPieChart();
      this.initBarChart();
    });
  }

  initPieChart(): void {
    new Chart('pieChart', {
      type: 'doughnut',
      data: {
        labels: ['Mobile and Wireless Communication', 'Transmission and Switching System', 'Engineering Management and Economics'],
        datasets: [{
          data: [70, 25, 5],
          backgroundColor: ['#28a745', '#dc3545', '#ffc107']
        }]
      }
    });
  }

  initBarChart(): void {
    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
          label: 'Assessment',
          data: [2, 1, 3, 2, 3, 1],
          backgroundColor: '#6f42c1'
        }]
      }
    });
  }
}
