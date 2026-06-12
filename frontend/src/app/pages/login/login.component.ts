import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isRegister = false;
  email = '';
  password = '';
  name = '';
  error = '';
  loading = false;


  submit() {
    this.error = '';
    this.loading = true;

    const request$ = this.isRegister
      ? this.authService.register(this.email, this.password, this.name)
      : this.authService.login(this.email, this.password);

    request$.subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err?.error?.message ?? 'Something went wrong';
        this.loading = false;
      },
    });
  }

  toggle() {
    this.isRegister = !this.isRegister;
    this.error = '';
  }
}
