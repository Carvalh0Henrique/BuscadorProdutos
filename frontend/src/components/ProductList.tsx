import { ProductCard } from "./ProductCard";
import type { Product } from "../types/product";

type ProductListProps = {
  products: Product[];
};

export function ProductList({ products }: ProductListProps) {
  return (
    <section className="mt-8 grid gap-4" aria-label="Resultados de produtos">
      {products.map((product) => (
        <ProductCard key={`${product.link}-${product.title}`} product={product} />
      ))}
    </section>
  );
}
