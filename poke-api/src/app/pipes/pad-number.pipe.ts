import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'padNumber',
  standalone: true, 
})
export class PadNumberPipe implements PipeTransform {
  transform(value: number | string, padding = 4, padChar = '0'): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).padStart(padding, padChar);
  }
}