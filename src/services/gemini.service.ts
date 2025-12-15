
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
      - Dữ liệu đầu vào sẽ có ngày hiện tại để bạn có thể hiểu các truy vấn tương đối như "hôm nay", "ngày mai", "hôm qua".
      - Vai trò của bạn là trả lời các câu hỏi về lịch làm việc của Ban Giám đốc dựa trên dữ liệu JSON được cung cấp.
      - Luôn sử dụng ngôn ngữ trang trọng, lịch sự, đúng mực (ví dụ: "Thưa đồng chí", "Báo cáo đồng chí", "Đồng chí Giám đốc...").
      - Chỉ trả lời dựa vào dữ liệu trong mục CONTEXT. Không bịa đặt hoặc suy diễn thông tin.
      - QUAN TRỌNG: Mọi câu trả lời về lịch làm việc PHẢI được trình bày dưới dạng BẢNG HTML.
      - Bảng phải có class="min-w-full divide-y divide-slate-300 dark:divide-slate-600". Thead phải có class="bg-slate-100 dark:bg-slate-700". Th phải có class="px-3 py-2 text-left text-sm font-semibold text-slate-900 dark:text-slate-100". Td phải có class="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 align-top whitespace-normal break-words".
      - **QUY TẮC HIỂN THỊ CỘT:**
          - Nếu câu hỏi về lịch chung hoặc của NHIỀU lãnh đạo, bảng phải có 4 cột theo thứ tự: **Thời gian, Tên Lãnh đạo, Nội dung làm việc, Địa điểm**.
          - Nếu câu hỏi chỉ về lịch của MỘT lãnh đạo cụ thể, hãy **BỎ CỘT 'Tên Lãnh đạo'** và chỉ hiển thị 3 cột: **Thời gian, Nội dung làm việc, Địa điểm**.
      - Cột "Thời gian" phải kết hợp cả giờ (Gio) và ngày (Ngay) từ dữ liệu. Ví dụ: "08:00 16/12/2025".
      - Trong bảng, PHẢI IN ĐẬM (sử dụng thẻ <strong>) tên của Lãnh đạo (nếu có) và các thông tin quan trọng như Thời gian và Địa điểm.
      - Sau phần giới thiệu câu trả lời, PHẢI có một dải phân cách bằng thẻ <hr class="my-4 border-slate-300 dark:border-slate-600">.
      - Nếu câu hỏi không rõ ràng, hãy yêu cầu người dùng cung cấp thêm thông tin (ví dụ: "Đồng chí vui lòng cung cấp ngày cụ thể.").
      - Nếu được hỏi thông tin ngoài lịch làm việc (thông tin cá nhân, nghiệp vụ), hãy từ chối một cách lịch sự: "Tôi chỉ được phép cung cấp thông tin về lịch làm việc đã được phê duyệt của Ban Giám đốc."
      - Sau mỗi câu trả lời thành công, hãy gợi ý một câu hỏi tiếp theo.
      - Không bao giờ hiển thị dữ liệu JSON thô cho người dùng.
    `;

    try {
      const formattedScheduleContext = scheduleContext.map(entry => {
        try {
          const [year, month, day] = entry.Ngay.split('-');
          if (year && month && day && year.length === 4) {
            return {
              ...entry,
              Ngay: `${day}/${month}/${year}`
            };
          }
        } catch (e) {
            // Ignore format error and return original entry
        }
        return entry;
      });

      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const formattedToday = `${day}/${month}/${year}`;

      const response: GenerateContentResponse = await this.genAI.models.generateContent({
        model: model,
        contents: `Hôm nay là ngày ${formattedToday}.\n\nCONTEXT:\n${JSON.stringify(formattedScheduleContext)}\n\nQUESTION:\n${query}`,
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
