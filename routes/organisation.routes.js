import { Router } from "express";
import { createOrganisation, getAllOrganisation, getSingleOrganisation } from "../controllers/organisation.controller.js";
import { authenticateUser } from "../middlewares/authentication.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/create", authenticateUser, upload.array("image"), createOrganisation)
router.get("/get-all", getAllOrganisation)
router.get("/get-single-organisation", authenticateUser, getSingleOrganisation)


export default router;