// src/utils/exportToCSV.ts
export type CsvColumn<T extends object> = {
  key: keyof T;
  header?: string;
  format?: (value: T[keyof T], row: T) => string;
};

function stringifyCell(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeCsv(value: string): string {
  // Always quote for safety (commas, quotes, newlines)
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportToCSV<T extends object>(
  rows: T[],
  filename: string,
  opts?: {
    columns?: CsvColumn<T>[];
    includeBOM?: boolean; // helps Excel detect UTF-8
  }
): void {
  if (!rows.length) return;

  const columns: CsvColumn<T>[] =
    opts?.columns && opts.columns.length
      ? opts.columns
      : (Object.keys(rows[0]) as (keyof T)[]).map((k) => ({ key: k }));

  const headerLine = columns
    .map((c) => escapeCsv(c.header ?? String(c.key)))
    .join(',');

  const lines = rows.map((row) =>
    columns
      .map((c) => {
        const raw = (row as Record<string, unknown>)[c.key as string];
        const str = c.format ? c.format(raw as T[keyof T], row) : stringifyCell(raw);
        return escapeCsv(str);
      })
      .join(',')
  );

  const body = [headerLine, ...lines].join('\n');

  const blob = new Blob([opts?.includeBOM ? '\uFEFF' : '', body], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
