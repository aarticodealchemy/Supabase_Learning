import { Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { LandingComponent } from './component/landing/landing.component';
import { RegistrationComponent } from './component/registration/registration.component';
import { DetailComponent } from './component/detail/detail.component';
import { IntegrationTestPageComponent } from './features/integration-test/integration-test-page/integration-test-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'supabase-test',
    pathMatch: 'full',
  },
  {
    path: 'landing-page',
    component: LandingComponent,
  },
  {
    path: 'registration-page',
    component: RegistrationComponent,
  },
  {
    path: 'detail-page',
    component: DetailComponent,
    data: {
      id: 101,
      userName: 'Arti Bhaliya',
      email: 'arti@gmail.com',
      password: 'arti@123',
    },
  },
  {
    path: 'login',
    component: LoginComponent,
    // data: {
    //     id: 101,
    //     userName: 'Arti Bhaliya',
    //     email: 'arti@gmail.com',
    //     password: 'arti@123'
    // }
  },
  {
    path: 'supabase-test',
    component: IntegrationTestPageComponent,
  },
];
