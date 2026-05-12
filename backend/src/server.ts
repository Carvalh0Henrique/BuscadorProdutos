import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3333);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", productRoutes);

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
