import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeProducts } from "./serpApiService.js";

describe("normalizeProducts", () => {
  it("ordena por preco crescente e limita a cinco produtos", () => {
    const products = normalizeProducts([
      { title: "C", source: "Loja C", price: "R$ 30,00", link: "https://c.com.br" },
      { title: "A", source: "Loja A", price: "R$ 10,00", link: "https://a.com.br" },
      { title: "B", source: "Loja B", price: "R$ 20,00", link: "https://b.com.br" },
      { title: "D", source: "Loja D", price: "R$ 40,00", link: "https://d.com.br" },
      { title: "E", source: "Loja E", price: "R$ 50,00", link: "https://e.com.br" },
      { title: "F", source: "Loja F", price: "R$ 60,00", link: "https://f.com.br" }
    ]);

    assert.deepEqual(
      products.map((product) => product.title),
      ["A", "B", "C", "D", "E"]
    );
  });

  it("ignora resultados sem link", () => {
    const products = normalizeProducts([
      { title: "Sem link", price: "R$ 10,00" },
      { title: "Com link", price: "R$ 20,00", link: "https://produto.com.br" }
    ]);

    assert.equal(products.length, 1);
    assert.equal(products[0].title, "Com link");
  });

  it("mantem apenas resultados com sinais de venda no Brasil", () => {
    const products = normalizeProducts([
      {
        title: "\u30ed\u30b8\u30af\u30fc\u30eb G515\u30ad\u30fc\u30dc\u30fc\u30c9",
        source: "eBay",
        price: "R$ 206,26",
        link: "https://www.ebay.com/itm/123"
      },
      {
        title: "Logitech G515 TKL LIGHTSPEED Wireless Gaming Keyboard",
        source: "Newegg",
        price: "$ 129.99",
        link: "https://www.newegg.com/logitech-g515"
      },
      {
        title: "Teclado Gamer Logitech G515 TKL",
        source: "KaBuM!",
        price: "R$ 659,99",
        link: "https://www.kabum.com.br/produto/123"
      }
    ]);

    assert.equal(products.length, 1);
    assert.equal(products[0].siteName, "KaBuM!");
  });
});
