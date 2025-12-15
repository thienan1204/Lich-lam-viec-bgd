
export interface ScheduleEntry {
  Ngay: string;
  Gio: string;
  LanhDao: string;
  NoiDung: string;
  DiaDiem: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  isTyping?: boolean;
}
