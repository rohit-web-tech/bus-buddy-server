import {Router} from "express" ;
import {
    addScheduleController,
    getAllBusSchedules,
    getScheduleDetails,
    getRouteSchedulesDetails,
    getBusSchedulesDetails,
    getScheduleOnSearch,
    getScheduleDetailsByRoute,
    editSchedule,
    deleteSchedule
} from "../controllers/schedule.controller.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import auth from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/addRouteSchedule").post(auth,adminAuth,addScheduleController);
router.route("/getAllRoutesSchedule").get(auth,getAllBusSchedules);
router.route("/scheduleDetails").get(auth,getScheduleDetails);
router.route("/busSchedulesDetails").get(auth,getBusSchedulesDetails);
router.route("/routeSchedulesDetails").get(auth,getRouteSchedulesDetails);
router.route("/searchSchedule").get(auth,getScheduleOnSearch);
router.route("/getScheduleDetailsByRoute").get(auth,getScheduleDetailsByRoute);
router.route("/getScheduleDetailsByRoute").delete(auth,adminAuth,deleteSchedule);
router.route("/getScheduleDetailsByRoute").patch(auth,adminAuth,editSchedule);

export default router ;