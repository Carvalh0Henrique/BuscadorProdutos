import { useState } from "react";
import { ProductList } from "./components/ProductList";
import { ReportButton } from "./components/ReportButton";
import { SearchForm } from "./components/SearchForm";
import { searchProducts } from "./services/productService";
import type { Product } from "./types/product";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(query: string) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Digite o nome de um produto para buscar.");
      setProducts([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const result = await searchProducts(trimmedQuery);
      setProducts(result);
    } catch (searchError) {
      setProducts([]);
      setError(searchError instanceof Error ? searchError.message : "Erro ao buscar produtos.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Google Shopping via SerpApi
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
            Buscador de Produtos
          </h1>
        </header>

        <SearchForm isLoading={isLoading} onSearch={handleSearch} />

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mt-8 rounded-md border border-slate-200 bg-white px-4 py-6 text-center text-slate-600">
            Buscando os melhores preços...
          </div>
        )}

        {!isLoading && hasSearched && products.length === 0 && !error && (
          <div className="mt-8 rounded-md border border-slate-200 bg-white px-4 py-6 text-center text-slate-600">
            Nenhum produto encontrado.
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <>
            <ProductList products={products} />
            <ReportButton products={products} />
          </>
        )}
      </div>
    </main>
  );
}

export default App;
