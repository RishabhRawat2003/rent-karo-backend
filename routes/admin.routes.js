import { Router } from "express";
import { createAdmin, loginAdmin, getAllAdmins } from "../controllers/admin.controller.js";

const router = Router();

// Route to create a new admin
router.post("/create", createAdmin);

// Route to login an admin
router.post("/login", loginAdmin);

// Route to get all admins
router.get("/list-admin", getAllAdmins);


export default router;