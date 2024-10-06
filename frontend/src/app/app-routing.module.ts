import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
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
import { ReactiveFormsModule } from '@angular/forms';

import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { VarifyEmailComponent } from './component/varify-email/varify-email.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VarifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Ensure this route is placed after login and other relevant routes
  { path: 'dashboard', component: DashboardComponent },

  {
    path: 'products',
    component: ProductsComponent,
    children: [
      { path: '', redirectTo: 'student', pathMatch: 'full' },
      { path: 'student', component: StudentComponent },
      { path: 'teacher', component: TeacherComponent }
    ]
  },

  {
    path: 'statistics',
    component: StatisticsComponent,
    children: [
      { path: '', redirectTo: 'student-table', pathMatch: 'full' },

    ]
  },

  { path: 'favorite', component: FavoriteComponent },
  { path: 'pages', component: PagesComponent },
  { path: 'media', component: MediaComponent },
  { path: 'settings', component: SettingsComponent },

  // Wildcard route for a 404 page (optional)
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
