import { useState } from "react";
import type { Product } from "../types/product";

type ReportButtonProps = {
  products: Product[];
};

type ReportFormat = "pdf" | "csv";

function escapeCsvValue(value: string | number | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function createCsvBlob(products: Product[]) {
  const headers = ["Title", "Nome do site", "price", "Description", "Type", "Link"];
  const rows = products.map((product) => [
    product.title,
    product.siteName,
    product.price,
    product.description,
    product.type,
    product.link
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");

  return new Blob([csv], { type: "text/csv;charset=utf-8" });
}

function toPdfSafeText(value: string | number | null) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "?");
}

function escapePdfText(value: string) {
  return toPdfSafeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text: string, maxLength: number) {
  const words = toPdfSafeText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if (word.length > maxLength) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }

      for (let index = 0; index < word.length; index += maxLength) {
        lines.push(word.slice(index, index + maxLength));
      }
      return;
    }

    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

function buildReportLines(products: Product[]) {
  const lines = ["Relatorio de Produtos", `Total de produtos: ${products.length}`, ""];

  products.forEach((product, index) => {
    lines.push(`${index + 1}. ${product.title}`);
    lines.push(`Nome do site: ${product.siteName}`);
    lines.push(`price: ${product.price}`);
    lines.push(`Description: ${product.description}`);
    lines.push(`Type: ${product.type}`);
    lines.push(`Link: ${product.link}`);
    lines.push("");
  });

  return lines.flatMap((line) => wrapText(line, 92));
}

function createPdfBlob(products: Product[]) {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginX = 42;
  const startY = 790;
  const lineHeight = 14;
  const linesPerPage = 52;
  const lines = buildReportLines(products);
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push(lines.slice(index, index + linesPerPage));
  }

  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((pageLines, pageIndex) => {
    const pageObjectNumber = objects.length + 1;
    const contentObjectNumber = pageObjectNumber + 1;
    pageObjectNumbers.push(pageObjectNumber);

    const textCommands = pageLines
      .map((line, lineIndex) => {
        const y = startY - lineIndex * lineHeight;
        return `BT /F1 10 Tf ${marginX} ${y} Td (${escapePdfText(line)}) Tj ET`;
      })
      .join("\n");
    const footer = `BT /F1 9 Tf ${pageWidth - 86} 30 Td (Pagina ${pageIndex + 1} de ${pages.length}) Tj ET`;
    const content = `${textCommands}\n${footer}`;

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
    );
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  objects[1] =
    `<< /Type /Pages /Kids [${pageObjectNumbers.map((objectNumber) => `${objectNumber} 0 R`).join(" ")}] /Count ${pages.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let index = 0; index < pdf.length; index += 1) {
    bytes[index] = pdf.charCodeAt(index);
  }

  return new Blob([bytes], { type: "application/pdf" });
}

export function ReportButton({ products }: ReportButtonProps) {
  const [format, setFormat] = useState<ReportFormat>("pdf");

  function handleDownload() {
    const blob = format === "pdf" ? createPdfBlob(products) : createCsvBlob(products);
    const extension = format === "pdf" ? "pdf" : "csv";
    downloadBlob(blob, `relatorio-produtos.${extension}`);
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <fieldset className="flex flex-wrap gap-3" aria-label="Formato do relatório">
        <label className="flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800">
          <input
            checked={format === "pdf"}
            className="h-4 w-4 accent-teal-700"
            name="report-format"
            onChange={() => setFormat("pdf")}
            type="radio"
            value="pdf"
          />
          PDF
        </label>
        <label className="flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800">
          <input
            checked={format === "csv"}
            className="h-4 w-4 accent-teal-700"
            name="report-format"
            onChange={() => setFormat("csv")}
            type="radio"
            value="csv"
          />
          CSV
        </label>
      </fieldset>

      <button
        className="min-h-12 rounded-md border border-slate-300 bg-white px-5 font-semibold text-slate-900 transition hover:border-teal-600 hover:text-teal-800"
        onClick={handleDownload}
        type="button"
      >
        Gerar relatório
      </button>
    </div>
  );
}
