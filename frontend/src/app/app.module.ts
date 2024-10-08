import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule} from 'ng2-charts';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { StudentService } from '../app/services/student.service'; // Ensure correct path
import { ToastrModule } from 'ngx-toastr';
import { SocketIoModule } from 'ngx-socket-io';
// Components
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';
import { VarifyEmailComponent } from './component/varify-email/varify-email.component';
import { BodyComponent } from './body/body.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductsComponent } from './products/products.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { PagesComponent } from './pages/pages.component';
import { MediaComponent } from './media/media.component';
import { SettingsComponent } from './settings/settings.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { TeacherComponent } from './products/teacher/teacher.component';
import { StudentComponent } from './products/student/student.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { StudentIndividualComponent } from './statistics/student-individual/student-individual.component';
import { TeacherIndividualComponent } from './statistics/teacher-individual/teacher-individual.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VarifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  // Add other routes as needed
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    VarifyEmailComponent,
    BodyComponent,
    SidenavComponent,
    DashboardComponent,
    ProductsComponent,
    StatisticsComponent,
    PagesComponent,
    MediaComponent,
    SettingsComponent,
    FavoriteComponent,
    TeacherComponent,
    StudentComponent,
    StudentIndividualComponent,
    TeacherIndividualComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    NgChartsModule,
    InfiniteScrollModule,
    MatSelectModule,
    MatButtonModule,
    MatOptionModule,
    MatFormFieldModule,
    NgChartsModule,
    NgxPaginationModule,
    ToastrModule.forRoot({positionClass: 'toast-top-right', // Position the toast
      timeOut: 3000, // Duration for which the toast is displayed
      preventDuplicates: true, // Prevent duplicate messages
      closeButton: true, // Show close button
      progressBar: true, // Show progress bar
      }),
      SocketIoModule.forRoot({ url: 'http://localhost:3000', options: {} }),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
