import { Router } from "express";
import { createKycBusiness, createKycIndividual, getAllKyc, getKycByOrganisationId, getKycByUserId } from "../controllers/kyc.controller.js";
import { authenticateUser } from "../middlewares/authentication.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/create-kyc", authenticateUser, upload.fields([{ name: "aadhaarImage" }, { name: "panImage" }, { name: "businessRegistrationDocument" }, { name: "companyPANCard" }, { name: "authorizedSignatoryIDProof" }]), createKycIndividual)
router.post("/create-kyc-business", authenticateUser, upload.fields([{ name: "businessRegistrationDocument" }, { name: "companyPANCard" }, { name: "authorizedSignatoryIDProof" }]), createKycBusiness)
router.get("/get-all-kyc", getAllKyc);
router.get("/get-kyc/:id", authenticateUser, getKycByOrganisationId);
router.get("/get-kyc-by-user", authenticateUser, getKycByUserId);

export default router;