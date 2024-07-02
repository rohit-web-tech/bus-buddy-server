import {Router} from "express" ;
import {
    addStationController,
    getAllStationController
} from "../controllers/station.controller.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import auth from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/addNewStation").post(auth,adminAuth,addStationController);
router.route("/getAllStations").get(auth,adminAuth,getAllStationController);

export default router ;