
import { Injectable } from '@angular/core';
import { ScheduleEntry } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private readonly STORAGE_KEY = 'scheduleData';

  loadSchedule(): ScheduleEntry[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading schedule from localStorage', e);
      return [];
    }
  }

  saveSchedule(schedule: ScheduleEntry[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedule));
    } catch (e) {
      console.error('Error saving schedule to localStorage', e);
    }
  }
}
