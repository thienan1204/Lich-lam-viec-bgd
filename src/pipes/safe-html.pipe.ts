
import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    // Sanitize and trust the HTML content.
    // This is necessary to render the HTML table returned by the Gemini API.
    return this.sanitizer.bypassSecurityTrustHtml(value || '');
  }
}
