import { Router } from "express";
import auth from "../middlewares/auth.middleware.js";
import {
    bookTicketController
} from "../controllers/booking.controller.js";

const router = Router();

router.route("/bookTicket").post(auth,bookTicketController)

export default router ;