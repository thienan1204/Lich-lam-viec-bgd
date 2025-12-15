
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule]
})
export class LoginComponent {
  authService = inject(AuthService);

  username = signal('');
  password = signal('');
  error = signal<string | null>(null);
  isLoading = signal(false);

  login(): void {
    this.isLoading.set(true);
    this.error.set(null);
    
    // Simulate network delay
    setTimeout(() => {
      const success = this.authService.login(this.username(), this.password());
      if (!success) {
        this.error.set('Tài khoản hoặc mật khẩu không chính xác.');
      }
      this.isLoading.set(false);
    }, 500);
  }
}
