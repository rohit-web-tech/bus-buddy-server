import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import {
    bookTicketController,
    cancelBookingController,
    getUserBookings,
    getAllBookings
} from "../controllers/booking.controller.js";

const router = Router();

router.route("/bookTicket").post(auth,bookTicketController)
router.route("/cancelTicket").patch(auth,cancelBookingController)
router.route("/getUserBookings").patch(auth,getUserBookings)
router.route("/cancelTicket").patch(auth,adminAuth,getAllBookings)

export default router ;