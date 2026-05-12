import type { Request, Response } from "express";
import { searchProducts } from "../services/serpApiService.js";

export async function searchProductsController(req: Request, res: Response) {
  const query = String(req.query.q ?? "").trim();

  if (!query) {
    return res.status(400).json({ message: "Informe um termo de busca em q." });
  }

  try {
    const products = await searchProducts(query);
    return res.json({ products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao buscar produtos.";
    return res.status(500).json({ message });
  }
}
