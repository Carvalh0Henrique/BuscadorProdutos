import { Router } from "express";
import { searchProductsController } from "../controllers/productController.js";

const router = Router();

router.get("/search", searchProductsController);

export default router;
