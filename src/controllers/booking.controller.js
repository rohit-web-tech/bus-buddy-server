import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { getScheduleForARoute } from "../utils/commonFunctions.js";
import Booking from "../models/booking.model.js";

const bookTicketController = asyncHandler(async(req,res)=>{
 
    const {scheduleId , bookingDate , passangerName, passangerAge, seatNumber, from , to} = req.body ;

    if(!scheduleId || !bookingDate || !passangerAge || !passangerName || !seatNumber || !from || !to){
        throw new ApiError(400,"All fields are required!!");
    }

    const schedules = await getScheduleForARoute(from,to,bookingDate);

    if(schedules?.length <= 0){
        throw new ApiError(400,"No such bus route found!!")
    }

    let schedule = schedules.filter(schedule=>schedule._id==scheduleId);

    if(schedule?.length <= 0){
        throw new ApiError(400,"No such bus route found!!")
    }

    schedule = schedule[0] ;

    if(schedule?.busDetails?.totalSeats < seatNumber || seatNumber < 1){
        throw new ApiError(400,"Invalid seat number!!")
    }

    if(schedule?.booking?.bookedSeats?.includes(seatNumber)){
        throw new ApiError(400,"Selected seat is already booked!!")
    }


    const newBooking = await Booking.create({
        schedule : schedule?._id ,
        from : schedule?.startStation?._id ,
        to :schedule?.endStation?._id ,
        bookingDate ,
        passangerName ,
        passangerAge ,
        bookerId : req.user?._id ,
        seatNumber
    })

    await newBooking.save() ;

    res 
    .status(201)
    .json(
        new ApiResponse(201,newBooking,"Ticket booked successfully!!")
    )

});

export {
    bookTicketController
}