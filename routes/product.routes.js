import { Router } from "express";
import { createProduct, deleteProductById, getAllProducts, getProductById, updateProductById } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/create-product", upload.array("images"), createProduct)
router.post("/get-all", getAllProducts)
router.get("/get/:id", getProductById)
router.delete("/remove/:id", deleteProductById)
router.post("/update/:id", upload.array("images"), updateProductById)


export default router;