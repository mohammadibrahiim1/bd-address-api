import { upload } from "./../middlewares/multer";
import { Router } from "express";
import {
  getLoggedInUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/user.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", upload.single("photo"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getLoggedInUser);

export default router;
