import {Router} from "express" ;
import {
    addScheduleController,
    getAllBusSchedules,
    getScheduleDetails,
    getRouteSchedulesDetails,
    getBusSchedulesDetails,
    getScheduleOnSearch
} from "../controllers/schedule.controller.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import auth from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/addRouteSchedule").post(auth,adminAuth,addScheduleController);
router.route("/getAllRoutesSchedule").get(auth,getAllBusSchedules);
router.route("/scheduleDetails").post(auth,getScheduleDetails);
router.route("/busSchedulesDetails").post(auth,getBusSchedulesDetails);
router.route("/routeSchedulesDetails").post(auth,getRouteSchedulesDetails);
router.route("/searchSchedule").post(auth,getScheduleOnSearch);

export default router ;