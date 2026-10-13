import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { User } from '../../Model/user.model';
import { FormsModule } from '@angular/forms';

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
  user?: User;

  ngOnInit(): void {
    this.activeRoute.data.subscribe((data) => {
      this.user = data;
      // console.log("data in detailpage");

      // this.router.getCurrentNavigation()
      
    })
  }

}
