import { parsePrice } from "../utils/priceUtils.js";

export type Product = {
  title: string;
  siteName: string;
  price: string;
  priceValue: number | null;
  description: string;
  type: string;
  link: string;
};

type SerpApiShoppingResult = {
  title?: string;
  source?: string;
  seller?: string;
  price?: string;
  extracted_price?: number;
  description?: string;
  snippet?: string;
  extensions?: string[];
  type?: string;
  tag?: string;
  link?: string;
  product_link?: string;
};

type SerpApiResponse = {
  shopping_results?: SerpApiShoppingResult[];
  error?: string;
};

const SERPAPI_URL = "https://serpapi.com/search.json";
const BRAZILIAN_STORE_INDICATORS = [
  ".br",
  "amazon.com.br",
  "americanas",
  "kabum",
  "kalunga",
  "magalu",
  "mercado livre",
  "mercadolivre",
  "pichau",
  "terabyte",
  "casas bahia",
  "pontofrio",
  "ponto frio",
  "carrefour",
  "extra.com.br",
  "fast shop",
  "submarino"
];
const FOREIGN_MARKETPLACE_INDICATORS = [
  "ebay",
  "walmart.com",
  "bestbuy",
  "newegg",
  "rakuten",
  "allegro",
  "cdiscount"
];
const FOREIGN_SCRIPT_PATTERN = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;

function includesAny(value: string, indicators: string[]): boolean {
  return indicators.some((indicator) => value.includes(indicator));
}

function isBrazilianProduct(result: SerpApiShoppingResult, product: Product): boolean {
  const searchableText = [
    product.title,
    product.siteName,
    product.description,
    product.type,
    product.link,
    result.source,
    result.seller,
    result.price,
    result.extensions?.join(" ")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hasBrazilianPrice = /(?:r\$|brl)/i.test(product.price);
  const hasBrazilianStore = includesAny(searchableText, BRAZILIAN_STORE_INDICATORS);
  const hasForeignMarketplace = includesAny(searchableText, FOREIGN_MARKETPLACE_INDICATORS);
  const hasForeignScript = FOREIGN_SCRIPT_PATTERN.test(`${product.title} ${product.description}`);

  return hasBrazilianPrice && hasBrazilianStore && !hasForeignMarketplace && !hasForeignScript;
}

export function normalizeProducts(results: SerpApiShoppingResult[] = []): Product[] {
  return results
    .map((result) => {
      const price = result.price ?? "";
      const priceValue = result.extracted_price ?? parsePrice(price);
      const description = result.description ?? result.snippet ?? result.extensions?.join(" | ") ?? "";

      return {
        title: result.title ?? "Produto sem titulo",
        siteName: result.source ?? result.seller ?? "Site nao informado",
        price,
        priceValue,
        description,
        type: result.type ?? result.tag ?? "Google Shopping",
        link: result.link ?? result.product_link ?? ""
      };
    })
    .filter((product, index) => product.link && isBrazilianProduct(results[index], product))
    .sort((a, b) => {
      if (a.priceValue === null && b.priceValue === null) return 0;
      if (a.priceValue === null) return 1;
      if (b.priceValue === null) return -1;
      return a.priceValue - b.priceValue;
    })
    .slice(0, 5);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const apiKey = process.env.SERPAPI_API_KEY ?? process.env.SERAPI_API_KEY;

  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY nao configurada.");
  }

  const params = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    api_key: apiKey,
    google_domain: "google.com.br",
    gl: "br",
    hl: "pt",
    location: "Brazil"
  });

  const response = await fetch(`${SERPAPI_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Falha ao consultar SerpApi: ${response.status}`);
  }

  const data = (await response.json()) as SerpApiResponse;

  if (data.error) {
    throw new Error(data.error);
  }

  return normalizeProducts(data.shopping_results);
}
