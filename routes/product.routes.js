import { Router } from "express";
import { createProduct, deleteProductById, getAllProducts, getProductById, getProductsByOrgId, updateProductById } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticateUser } from "../middlewares/authentication.middleware.js";

const router = Router();

router.post("/create-product", authenticateUser, upload.array("images"), createProduct)
router.post("/get-all", getAllProducts)
router.post("/get-products-by-organisation/:id", authenticateUser, getProductsByOrgId)
router.get("/get/:id", getProductById)
router.delete("/remove/:id", deleteProductById)
router.post("/update/:id",authenticateUser, upload.array("images"), updateProductById)


export default router;