
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { ScheduleEntry } from './models';
import { ChatComponent } from './components/chat/chat.component';
import { AdminComponent } from './components/admin/admin.component';
import { GeminiService } from './services/gemini.service';
import { AuthService } from './services/auth.service';
import { ScheduleService } from './services/schedule.service';
import { LoginComponent } from './components/login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ChatComponent, AdminComponent, LoginComponent],
})
export class AppComponent implements OnInit {
  geminiService = inject(GeminiService);
  authService = inject(AuthService);
  scheduleService = inject(ScheduleService);

  activeTab = signal<'chat' | 'admin'>('chat');
  scheduleData = signal<ScheduleEntry[]>([]);
  
  apiError = this.geminiService.error;
  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.scheduleData.set(this.scheduleService.loadSchedule());
  }

  updateSchedule(newSchedule: ScheduleEntry[]): void {
    this.scheduleService.saveSchedule(newSchedule);
    this.scheduleData.set(newSchedule);
    this.activeTab.set('chat');
  }

  logout(): void {
    this.authService.logout();
    this.activeTab.set('chat');
  }
}
