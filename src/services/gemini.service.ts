
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { ScheduleEntry } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenAI;
  public error = signal<string | null>(null);

  constructor() {
    if (!process.env.API_KEY) {
      const errorMessage = 'API key for Google GenAI is not configured.';
      this.error.set(errorMessage);
      console.error(errorMessage);
      alert(errorMessage);
    }
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  }

  async querySchedule(query: string, scheduleContext: ScheduleEntry[]): Promise<string> {
    this.error.set(null);
    if (!this.genAI) {
      const errorMessage = "Gemini AI client is not initialized.";
      this.error.set(errorMessage);
      return Promise.reject(new Error(errorMessage));
    }
     if (scheduleContext.length === 0) {
      return "Hiện tại chưa có dữ liệu lịch làm việc. Vui lòng yêu cầu quản trị viên cập nhật lịch.";
    }

    const model = 'gemini-2.5-flash';
    const systemInstruction = `Bạn là "Trợ lý Lịch Ban Giám đốc Công an tỉnh", một trợ lý AI chuyên nghiệp.
      - Vai trò của bạn là trả lời các câu hỏi về lịch làm việc của Ban Giám đốc dựa trên dữ liệu JSON được cung cấp.
      - Luôn sử dụng ngôn ngữ trang trọng, lịch sự, đúng mực (ví dụ: "Thưa đồng chí", "Báo cáo đồng chí", "Đồng chí Giám đốc...").
      - Chỉ trả lời dựa vào dữ liệu trong mục CONTEXT. Không bịa đặt hoặc suy diễn thông tin.
      - Khi trả lời về lịch, hãy trình bày rõ ràng theo danh sách hoặc bảng, bao gồm Thời gian, Nội dung, và Địa điểm.
      - Nếu câu hỏi không rõ ràng, hãy yêu cầu người dùng cung cấp thêm thông tin (ví dụ: "Đồng chí vui lòng cung cấp ngày cụ thể.").
      - Nếu được hỏi thông tin ngoài lịch làm việc (thông tin cá nhân, nghiệp vụ), hãy từ chối một cách lịch sự: "Tôi chỉ được phép cung cấp thông tin về lịch làm việc đã được phê duyệt của Ban Giám đốc."
      - Sau mỗi câu trả lời thành công, hãy gợi ý một câu hỏi tiếp theo, ví dụ: "Đồng chí có thể hỏi thêm về lịch của một lãnh đạo cụ thể, ví dụ: 'Lịch của Đồng chí [Tên Lãnh đạo] ngày mai là gì?'."
      - Không bao giờ hiển thị dữ liệu JSON thô cho người dùng.
    `;

    try {
      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: model,
        contents: `CONTEXT:\n${JSON.stringify(scheduleContext)}\n\nQUESTION:\n${query}`,
        config: {
          systemInstruction: systemInstruction,
        }
      });
      
      return response.text;
    } catch (e) {
      console.error('Lỗi khi truy vấn lịch:', e);
      this.error.set('Đã xảy ra lỗi khi truy vấn thông tin. Vui lòng thử lại.');
      return 'Xin lỗi, tôi không thể xử lý yêu cầu của đồng chí vào lúc này.';
    }
  }
}
