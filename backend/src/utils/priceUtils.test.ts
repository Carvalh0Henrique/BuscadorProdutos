import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePrice } from "./priceUtils.js";

describe("parsePrice", () => {
  it("converte preco em reais", () => {
    assert.equal(parsePrice("R$ 1.299,90"), 1299.9);
  });

  it("converte preco em dolares", () => {
    assert.equal(parsePrice("$299.99"), 299.99);
  });

  it("retorna null para preco ausente ou invalido", () => {
    assert.equal(parsePrice(null), null);
    assert.equal(parsePrice("preco indisponivel"), null);
  });
});
