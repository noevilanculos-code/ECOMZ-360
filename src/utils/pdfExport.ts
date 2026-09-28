// Universal Official PDF Generator & Exporter for ECO-MZ 360
// Generates valid, structured PDF 1.4 documents for any table, report, certificate, or dataset

export interface PdfDocumentOptions {
  title: string;
  subtitle?: string;
  category?: string;
  region?: string;
  author?: string;
  summary?: string;
  metrics?: Array<{ label: string; value: string }>;
  headers?: string[];
  tableHeaders?: string[];
  rows?: string[][];
  tableRows?: string[][];
  recommendations?: string[];
  filename?: string;
}

// Helper to sanitize text for standard PDF Type1 Helvetica encoding (WinAnsi)
function sanitizePdfText(input: string): string {
  if (!input) return '';
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[•·]/g, '-')
    .replace(/[—–]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/₂/g, '2')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

function wrapLines(text: string, maxChars: number = 88): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function exportToPDF(options: PdfDocumentOptions): void {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-PT');
  const timeStr = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  const streamCommands: string[] = [];

  // Header Banner (#062B3D)
  streamCommands.push('0.024 0.169 0.239 rg');
  streamCommands.push('0 762 595 80 re f');

  // Green Accent Bar (#00A651)
  streamCommands.push('0 0.651 0.318 rg');
  streamCommands.push('0 758 595 4 re f');

  // Header Text
  streamCommands.push('BT');
  streamCommands.push('1 1 1 rg');
  streamCommands.push('/F2 14 Tf');
  streamCommands.push('40 812 Td');
  streamCommands.push(`(${sanitizePdfText('REPUBLICA DE MOCAMBIQUE - ECO-MZ 360')}) Tj`);
  streamCommands.push('/F1 9 Tf');
  streamCommands.push('0 -16 Td');
  streamCommands.push(
    `(${sanitizePdfText('Observatorio Nacional de Monitorizacao, Diagnostico e Gestao Ambiental (MTA / INGD / AQUA)')}) Tj`
  );
  streamCommands.push('0 -14 Td');
  streamCommands.push(
    `(${sanitizePdfText(`Emitido em: ${dateStr} as ${timeStr}  |  Formato Oficial: PDF Verificado`)}) Tj`
  );
  streamCommands.push('ET');

  let y = 728;

  const addLine = (text: string, font: 'F1' | 'F2' = 'F1', size: number = 10, color = '0.06 0.09 0.16') => {
    if (y < 60) return;
    streamCommands.push('BT');
    streamCommands.push(`${color} rg`);
    streamCommands.push(`/${font} ${size} Tf`);
    streamCommands.push(`40 ${y} Td`);
    streamCommands.push(`(${sanitizePdfText(text)}) Tj`);
    streamCommands.push('ET');
    y -= size + 6;
  };

  // Title & Metadata
  addLine(options.title, 'F2', 15, '0.024 0.169 0.239');
  if (options.subtitle) {
    addLine(options.subtitle, 'F1', 10, '0.28 0.33 0.41');
  }

  const metaParts: string[] = [];
  if (options.category) metaParts.push(`Categoria: ${options.category}`);
  if (options.region) metaParts.push(`Regiao: ${options.region}`);
  if (options.author) metaParts.push(`Responsavel: ${options.author}`);
  if (metaParts.length > 0) {
    addLine(metaParts.join('   |   '), 'F2', 9, '0 0.55 0.28');
  }

  y -= 6;

  // Summary Paragraph
  if (options.summary) {
    addLine('RESUMO EXECUTIVO', 'F2', 10, '0.024 0.169 0.239');
    const lines = wrapLines(options.summary, 90);
    for (const line of lines) {
      addLine(line, 'F1', 9.5, '0.2 0.25 0.33');
    }
    y -= 6;
  }

  // Metrics
  if (options.metrics && options.metrics.length > 0) {
    addLine('INDICADORES PRINCIPAIS', 'F2', 10, '0.024 0.169 0.239');
    for (const m of options.metrics) {
      addLine(`- ${m.label}: ${m.value}`, 'F2', 9.5, '0.1 0.15 0.22');
    }
    y -= 6;
  }

  // Table Rows
  const activeHeaders = options.tableHeaders || options.headers;
  const activeRows = options.tableRows || options.rows;
  if (activeHeaders && activeRows && activeRows.length > 0) {
    addLine('REGISTOS E DADOS DETALHADOS', 'F2', 10, '0.024 0.169 0.239');
    addLine(activeHeaders.join('  |  '), 'F2', 8.5, '0 0.50 0.25');
    for (const row of activeRows.slice(0, 26)) {
      const rowText = row.join('  |  ');
      addLine(rowText.substring(0, 105), 'F1', 8.5, '0.18 0.22 0.28');
    }
    y -= 6;
  }

  // Recommendations
  if (options.recommendations && options.recommendations.length > 0) {
    addLine('RECOMENDACOES E ORIENTACOES PRATICAS', 'F2', 10, '0.024 0.169 0.239');
    options.recommendations.forEach((rec, i) => {
      const wrapped = wrapLines(`${i + 1}. ${rec}`, 90);
      wrapped.forEach((line) => addLine(line, 'F1', 9, '0.2 0.25 0.33'));
    });
  }

  // Footer
  streamCommands.push('0.88 0.91 0.94 rg');
  streamCommands.push('40 42 515 1 re f');
  streamCommands.push('BT');
  streamCommands.push('0.4 0.45 0.52 rg');
  streamCommands.push('/F1 8 Tf');
  streamCommands.push('40 28 Td');
  streamCommands.push(
    `(${sanitizePdfText('ECO-MZ 360 - Documento Oficial em PDF - Republica de Mocambique (Lei do Ambiente n. 20/97)')}) Tj`
  );
  streamCommands.push('ET');

  const contentStream = streamCommands.join('\n');

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /MediaBox [0 0 595 842] /Contents 6 0 R >>\nendobj'
  );
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj');
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj'
  );
  objects.push(`6 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj`);

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  // Convert string to Uint8Array using Latin1 so extended chars map cleanly to WinAnsi
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }

  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (options.filename || options.title || 'relatorio-ecomz-360')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  link.href = url;
  link.setAttribute('download', `${safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`}`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
