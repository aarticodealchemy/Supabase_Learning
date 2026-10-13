import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../Model/user.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  user?: User;

  constructor(private router: Router) {

  }
}
