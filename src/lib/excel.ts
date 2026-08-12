import * as XLSX from 'xlsx';
import type { FileData, MappingPair } from '../types';

const MAX_SIZE = 20 * 1024 * 1024;

export function parseExcelFile(file: File): Promise<FileData> {
  return new Promise((resolve, reject) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      reject(new Error('فقط فایل‌های .xlsx پشتیبانی می‌شوند'));
      return;
    }
    if (file.size > MAX_SIZE) {
      reject(new Error('حداکثر حجم فایل ۲۰ مگابایت است'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('خطا در خواندن فایل'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('فایل خالی است'));
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: '',
        });

        if (jsonData.length === 0) {
          const headerRow = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
          if (headerRow.length > 0 && Array.isArray(headerRow[0]) && headerRow[0].length > 0) {
            resolve({
              name: file.name,
              headers: headerRow[0].map((h) => String(h ?? '')),
              rows: [],
              totalRows: 0,
            });
            return;
          }
          reject(new Error('فایل حاوی داده‌ای نیست'));
          return;
        }

        const headers = Object.keys(jsonData[0]);
        const rows = jsonData.map((row) => {
          const cleaned: Record<string, string | number | boolean | null> = {};
          headers.forEach((h) => {
            const val = row[h];
            cleaned[h] =
              val === undefined || val === null
                ? ''
                : (val as string | number | boolean);
          });
          return cleaned;
        });

        resolve({
          name: file.name,
          headers,
          rows,
          totalRows: rows.length,
        });
      } catch (err) {
        reject(
          new Error(
            'خطا در پردازش فایل: ' +
              (err instanceof Error ? err.message : String(err))
          )
        );
      }
    };
    reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
    reader.readAsArrayBuffer(file);
  });
}

export function convertToExcelBlob(
  inputRows: Record<string, string | number | boolean | null>[],
  mappings: MappingPair[],
  templateHeaders: string[]
): Blob {
  const outputRows = inputRows.map((inputRow) => {
    const outputRow: Record<string, string | number | boolean | null> = {};
    templateHeaders.forEach((h) => {
      outputRow[h] = '';
    });
    mappings.forEach((m) => {
      if (inputRow[m.inputCol] !== undefined) {
        outputRow[m.templateCol] = inputRow[m.inputCol];
      }
    });
    return outputRow;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(outputRows, { header: templateHeaders });

  const colWidths = templateHeaders.map((h) => {
    let maxLen = h.length;
    outputRows.slice(0, 100).forEach((row) => {
      const val = String(row[h] ?? '');
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(maxLen + 2, 40) };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Output');
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
