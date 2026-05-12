import type { Product } from "../types/product";

type ReportButtonProps = {
  products: Product[];
};

function escapeCsvValue(value: string | number | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function ReportButton({ products }: ReportButtonProps) {
  function handleDownload() {
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

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "relatorio-produtos.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      className="mt-6 min-h-12 rounded-md border border-slate-300 bg-white px-5 font-semibold text-slate-900 transition hover:border-teal-600 hover:text-teal-800"
      onClick={handleDownload}
      type="button"
    >
      Gerar relatório
    </button>
  );
}
