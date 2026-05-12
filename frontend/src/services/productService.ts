import type { Product } from "../types/product";

type ProductSearchResponse = {
  products: Product[];
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`
  );

  const data = (await response.json()) as ProductSearchResponse | { message?: string };

  if (!response.ok) {
    throw new Error("message" in data && data.message ? data.message : "Erro ao buscar produtos.");
  }

  return "products" in data ? data.products : [];
}
