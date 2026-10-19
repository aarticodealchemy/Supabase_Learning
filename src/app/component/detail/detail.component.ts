import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { User } from '../../Model/user.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [RouterLink,CommonModule,FormsModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit{

  activeRoute: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  authService = inject(AuthService);
  user?: User;

  ngOnInit(): void {
    this.activeRoute.data.subscribe((data) => {
      this.user = data;
      // console.log("data in detailpage");

      // this.router.getCurrentNavigation()
      
    })
  }


  onLogout(): void {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }

}
