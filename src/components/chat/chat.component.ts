
import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, viewChild, signal, afterNextRender } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage, ScheduleEntry } from '../../models';
import { GeminiService } from '../../services/gemini.service';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule, SafeHtmlPipe]
})
export class ChatComponent {
  scheduleData = input.required<ScheduleEntry[]>();
  
  geminiService = inject(GeminiService);
  chatHistory = signal<ChatMessage[]>([
    { sender: 'ai', text: 'Chào đồng chí, tôi là Trợ lý Lịch làm việc. Đồng chí cần tra cứu thông tin gì?' }
  ]);
  userQuery = signal('');
  isLoading = signal(false);

  chatContainer = viewChild<ElementRef<HTMLDivElement>>('chatContainer');

  constructor() {
    afterNextRender(() => {
       effect(() => {
          this.chatHistory(); // a dependency on this signal
          this.scrollToBottom();
       });
    });
  }

  async sendMessage(): Promise<void> {
    const query = this.userQuery().trim();
    if (!query || this.isLoading()) return;

    this.chatHistory.update(history => [...history, { sender: 'user', text: query }]);
    this.userQuery.set('');
    this.isLoading.set(true);
    this.chatHistory.update(history => [...history, { sender: 'ai', text: '', isTyping: true }]);
    
    this.scrollToBottom();
    
    try {
      const response = await this.geminiService.querySchedule(query, this.scheduleData());
      this.chatHistory.update(history => {
        const newHistory = history.slice(0, -1);
        return [...newHistory, { sender: 'ai', text: response }];
      });
    } catch (error) {
       this.chatHistory.update(history => {
        const newHistory = history.slice(0, -1);
        return [...newHistory, { sender: 'ai', text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' }];
      });
      console.error('Failed to get chat response', error);
    } finally {
      this.isLoading.set(false);
      this.scrollToBottom();
    }
  }
  
  private scrollToBottom(): void {
    setTimeout(() => {
        const element = this.chatContainer()?.nativeElement;
        if (element) {
          element.scrollTop = element.scrollHeight;
        }
      }, 0);
  }
}
