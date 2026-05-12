import type { Product } from "../types/product";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <a
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-500 hover:shadow-md"
      href={product.link}
      rel="noreferrer"
      target="_blank"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{product.siteName}</p>
          <h2 className="mt-1 text-lg font-semibold leading-snug text-slate-950">{product.title}</h2>
        </div>
        <p className="shrink-0 rounded-md bg-emerald-50 px-3 py-2 text-base font-bold text-emerald-800">
          {product.price || "Preco indisponivel"}
        </p>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">
        {product.description || "Sem descricao disponivel."}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
        <span className="font-medium text-slate-500">Type</span>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">{product.type}</span>
      </div>
    </a>
  );
}
