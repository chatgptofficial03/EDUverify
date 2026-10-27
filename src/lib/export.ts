/**
 * Sanitizes a single cell value against CSV formula injection (CSV Injection / Formula Injection).
 * Spreadsheet applications like Excel or LibreOffice can execute formulas if a cell starts with =, +, -, @
 */
export function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // If starts with formula triggers, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Converts an array of objects into a safe CSV string
 */
export function generateSafeCsv(
  rows: Record<string, any>[],
  headers: { key: string; label: string }[]
): string {
  const headerLine = headers.map((h) => sanitizeCsvCell(h.label)).join(',');
  const rowLines = rows.map((row) =>
    headers.map((h) => sanitizeCsvCell(row[h.key])).join(',')
  );

  return [headerLine, ...rowLines].join('\r\n');
}
