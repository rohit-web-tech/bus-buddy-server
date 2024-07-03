import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { getBookingsAggregation, getScheduleForARoute } from "../utils/commonFunctions.js";
import Booking from "../models/booking.model.js";

const bookTicketController = asyncHandler(async (req, res) => {

    const { scheduleId, bookingDate, passangerName, passangerAge, seatNumber, from, to } = req.body;

    if (!scheduleId || !bookingDate || !passangerAge || !passangerName || !seatNumber || !from || !to) {
        throw new ApiError(400, "All fields are required!!");
    }

    const schedules = await getScheduleForARoute(from, to, bookingDate);

    if (schedules?.length <= 0) {
        throw new ApiError(400, "No such bus route found!!")
    }

    let schedule = schedules.filter(schedule => schedule._id == scheduleId);

    if (schedule?.length <= 0) {
        throw new ApiError(400, "No such bus route found!!")
    }

    schedule = schedule[0];

    if (schedule?.busDetails?.totalSeats < seatNumber || seatNumber < 1) {
        throw new ApiError(400, "Invalid seat number!!")
    }

    if (schedule?.booking?.bookedSeats?.includes(seatNumber)) {
        throw new ApiError(400, "Selected seat is already booked!!")
    }


    const newBooking = await Booking.create({
        schedule: schedule?._id,
        from: schedule?.startStation?._id,
        to: schedule?.endStation?._id,
        bookingDate,
        passangerName,
        passangerAge,
        bookerId: req.user?._id,
        seatNumber,
        totalFare: schedule?.totalFare
    })

    await newBooking.save();

    res
        .status(201)
        .json(
            new ApiResponse(201, newBooking, "Ticket booked successfully!!")
        )

});

const cancelBookingController = asyncHandler(async (req, res) => {

    const { bookingId } = req.body;

    if (!bookingId) {
        throw new ApiError(400, "Booking id is not valid!!")
    }

    const cancelBooking = await Booking.findOneAndUpdate(
        {
            _id: bookingId,
            bookerId: req.user?._id
        },
        {
            $set: {
                status: "CANCELLED"
            }
        },
        {
            new: true,
        }
    )

    if (!cancelBooking) {
        throw new ApiError(401, "Invalid cancellation request!!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, cancelBooking, "Booking cancelled successfully!!")
        )

});

const getUserBookings = asyncHandler(async (req, res) => {

    let bookings = await getBookingsAggregation();


    bookings = bookings.filter(booking => booking?.booker?._id == req.user?._id);

    bookings = bookings.map(async (booking) => {

        const allSchedules = await getScheduleForARoute(booking?.from?.stationName,booking?.to?.stationName,booking?.bookingDate)

        const schedule = allSchedules.filter(schedule => schedule._id == booking?.schedule)

        return {...booking , schedule : schedule[0]} ;

    })

    Promise.all(bookings).then(bookings=>{
        res
        .status(200)
        .json(
            new ApiResponse(200, { bookings, totalBookings: bookings?.length }, "User's bookings fetched successfully")
        )
    }).catch(error=>{
        if(!res.headersSent){
            res.status(error.statusCode || 500) 
            .json (
                new ApiError(error.statusCode || 500 , error.message || "Internal server error!!")
            )
        }
    })
})

const getAllBookings = asyncHandler(async(req,res)=>{

    let bookings = await getBookingsAggregation();

    bookings = bookings.map(async (booking) => {

        const allSchedules = await getScheduleForARoute(booking?.from?.stationName,booking?.to?.stationName,booking?.bookingDate)

        const schedule = allSchedules.filter(schedule => schedule._id == booking?.schedule)

        return {...booking , schedule : schedule[0]} ;

    })

    Promise.all(bookings).then(bookings=>{
        res
        .status(200)
        .json(
            new ApiResponse(200, { bookings, totalBookings: bookings?.length }, "Bookings fetched successfully")
        )
    }).catch(error=>{
        if(!res.headersSent){
            res.status(error.statusCode || 500) 
            .json (
                new ApiError(error.statusCode || 500 , error.message || "Internal server error!!")
            )
        }
    })

})

export {
    bookTicketController,
    cancelBookingController,
    getUserBookings,
    getAllBookings
}