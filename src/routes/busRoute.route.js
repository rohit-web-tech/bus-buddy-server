import {Router} from "express" ;
import {
    addRouteController,
    editRouteController,
    deleteRouteController,
    getAllRoutesController,
    getRouteDetailsController
} from "../controllers/route.controller.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import auth from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/addNewRoute").post(auth,adminAuth,addRouteController);
router.route("/editRoute").post(auth,adminAuth,editRouteController);
router.route("/deleteRoute").post(auth,adminAuth,deleteRouteController);
router.route("/getAllRoutes").post(auth,adminAuth,getAllRoutesController);
router.route("/getRouteDetails").post(auth,adminAuth,getRouteDetailsController);

export default router ;