import {
    signUpUserController,
    verifyEmailController,
    loginUserController,
    logoutUserController,
    refreshAccessToken,
    changePasswordController,
    forgotPasswordController,
    updatePasswordController,
    getCurrentUserController,
    updateProfileController
} from "../controllers/user.controller.js";
import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/signup").post(signUpUserController);
router.route("/verifyemail").post(verifyEmailController);
router.route("/login").post(loginUserController);
router.route("/logout").post(auth, logoutUserController);
router.route("/refreshAccessToken").post(auth, refreshAccessToken);
router.route("/changePassword").post(auth, changePasswordController);
router.route("/forgetPassword").post(forgotPasswordController);
router.route("/resetPassword").post(updatePasswordController);
router.route("/currentUser").get(auth,getCurrentUserController);
router.route("/updateProfile").post(auth,updateProfileController);
export default router;