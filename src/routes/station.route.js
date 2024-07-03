import {Router} from "express" ;
import {
    addStationController,
    getAllStationController,
    getStationSuggestionOnSearch,
    deleteStation,
    editStation
} from "../controllers/station.controller.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import auth from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/addNewStation").post(auth,adminAuth,addStationController);
router.route("/getAllStations").get(auth,getAllStationController);
router.route("/getStationsOnSearch").get(auth,getStationSuggestionOnSearch);
router.route("/editStation").patch(auth,adminAuth,editStation);
router.route("/deleteStation").delete(auth,adminAuth,deleteStation);

export default router ;