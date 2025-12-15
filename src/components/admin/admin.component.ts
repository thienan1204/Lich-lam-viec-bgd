
import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ScheduleEntry } from '../../models';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule]
})
export class AdminComponent {
  scheduleJson = signal<string>('[]');
  isLoading = signal(false);
  lastUpdateSuccessful = signal<boolean | null>(null);

  scheduleUpdated = output<ScheduleEntry[]>();

  updateScheduleFromJson(): void {
    if (!this.scheduleJson().trim()) return;
    this.isLoading.set(true);
    this.lastUpdateSuccessful.set(null);
    try {
      const parsedData = JSON.parse(this.scheduleJson());
      
      // Basic validation
      if (Array.isArray(parsedData) && (parsedData.length === 0 || (parsedData[0].Ngay && parsedData[0].LanhDao))) {
        this.scheduleUpdated.emit(parsedData);
        this.lastUpdateSuccessful.set(true);
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (error) {
      this.lastUpdateSuccessful.set(false);
      console.error('Failed to parse schedule JSON', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
