import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import auth from "../middlewares/auth.middleware.js";
import {
    addBusController,
    deleteBusController,
    changeBusStatusController,
    updateBusInfoController,
    changeBusImageController
} from "../controllers/bus.controller.js";

const router = Router();

router.route("/addBus").post(
    auth,
    upload.single("busPic"),
    addBusController
);
router.route("/deleteBus").delete(auth,deleteBusController);
router.route("/updateBusStatus").patch(auth,changeBusStatusController);
router.route("/updateBusDetails").patch(auth,updateBusInfoController);
router.route("/updateBusImage").patch(
    auth,
    upload.single("busPic"),
    changeBusImageController
);

export default router ;