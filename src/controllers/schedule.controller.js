import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import BusRoute from "../models/route.model.js";
import Schedule from "../models/sechdule.model.js";
import Bus from "../models/bus.model.js";
import  {
    scheduleAggregation,
    getScheduleForARoute
} from "../utils/commonFunctions.js" ;

const addScheduleController = asyncHandler(async (req, res) => {
    let { segmentTimings, busId, routeId } = req.body;

    if (!segmentTimings || !busId || !routeId) {
        throw new ApiError(400, "All feilds are required!!");
    }

    const route = await BusRoute.findById(routeId);

    if (!route) {
        throw new ApiError(400, "No such route is found!!")
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
        throw new ApiError(400, "No such bus is found!!")
    }

    if (!Array.isArray(segmentTimings) || segmentTimings.length <= 0) {
        throw new ApiError(400, "Route schedule is not complete!!");
    }

    if ((route?.segments[route.segments.length - 1] != segmentTimings[segmentTimings.length - 1]?.segment) || (route?.segments[0] != segmentTimings[0]?.segment)) {
        throw new ApiError(400, "Route schedule is not complete!!");
    }

    segmentTimings = segmentTimings.map((segmentTiming, index) => {
        const { segment, startStationArrivalTime, startStationDepartTime, endStationArrivalTime, endStationDepartTime, fare } = segmentTiming;

        if (!segment || !startStationArrivalTime || !startStationDepartTime || !endStationArrivalTime ||
            !endStationDepartTime) {
            throw new ApiError(400, "Route schedule is not complete!!");
        }

        if (!fare) {
            throw new ApiError(400, "Route fare is required!!");
        }

        if (isNaN(fare)) {
            throw new ApiError(400, "Fare should be a numeric value!!");
        }

        if (!route?.segments[index] || segment != route?.segments[index]) {
            throw new ApiError(400, "Schedule is not matching with route!!");
        }

        return segmentTiming;

    })

    const newSchedule = await Schedule.create({
        segmentTimings,
        bus: busId,
        route: routeId
    })

    await newSchedule.save();

    res
        .status(201)
        .json(
            new ApiResponse(201, newSchedule, "Schedule added successfully for bus route!!")
        )

})

const getAllBusSchedules = asyncHandler(async (_, res) => {

    let allSchedules = await scheduleAggregation();

    allSchedules = allSchedules.filter(schedule => !!schedule)

    res
        .status(200)
        .json(
            new ApiResponse(200, allSchedules, "Routes schedule fetched successfully!!")
        )
})

const getScheduleDetails = asyncHandler(async (req, res) => {
    const { scheduleId } = req.body;

    if (!scheduleId) {
        new ApiError(400, "Schedule id is required!!")
    }

    let scheduleDetails = await scheduleAggregation();

    scheduleDetails = scheduleDetails.filter(schedule => schedule?._id == scheduleId);

    if (scheduleDetails.length <= 0) {
        throw new ApiError(400, "No such schedule found!!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, scheduleDetails[0], "Route schedule fetched successfully!!")
        )

})

const getBusSchedulesDetails = asyncHandler(async (req, res) => {
    const { busId } = req.body;

    if (!busId) {
        new ApiError(400, "Bus id is required!!")
    }

    let scheduleDetails = await scheduleAggregation();

    scheduleDetails = scheduleDetails.filter(schedule => schedule?.busDetails?._id == busId);

    if (scheduleDetails.length <= 0) {
        throw new ApiError(400, "No such bus schedule found!!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, scheduleDetails, "Bus schedules fetched successfully!!")
        )
})

const getRouteSchedulesDetails = asyncHandler(async (req, res) => {
    const { routeId } = req.body;

    if (!routeId) {
        new ApiError(400, "Route id is required!!")
    }

    let scheduleDetails = await scheduleAggregation();

    scheduleDetails = scheduleDetails.filter(schedule => schedule?.routeId?._id == routeId);

    if (scheduleDetails.length <= 0) {
        throw new ApiError(400, "No such route schedule found!!")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, scheduleDetails, "Route schedules fetched successfully!!")
        )
})

const getScheduleOnSearch = asyncHandler(async (req, res) => {
    const { start, destination, date } = req.body;

    if (!start || !destination || !date) {
        throw new ApiError(400, "All fields are required!!")
    }

    const allSchedules = await getScheduleForARoute(start, destination, date);

    res
        .status(200)
        .json(
            new ApiResponse(200, allSchedules, "Schedules fetched successfully!!")
        )


})

const getScheduleDetailsByRoute = asyncHandler(async (req, res) => {
    const { start, destination, date, scheduleId } = req.body;

    if (!start || !destination || !date || !scheduleId) {
        throw new ApiError(400, "All fields are required!!")
    }

    let allSchedules = await getScheduleForARoute(start, destination, date);

    allSchedules = allSchedules?.filter(schedule=>schedule?._id == scheduleId);

    res
        .status(200)
        .json(
            new ApiResponse(200, allSchedules, "Schedule details fetched successfully!!")
        )


})

const deleteSchedule = asyncHandler(async(req,res)=>{
    const {scheduleId} = req.body ;

    if(!scheduleId) {
        throw new ApiError(400,"Schedule id is required!!");
    }

    const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId);

    if(!deleteSchedule) {
        throw new ApiError(401,"No such route schedule found!!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,deletedSchedule,"Route schedule deleted successfully!!")
    )

})

const editSchedule = asyncHandler(async(req,res)=>{

    let { segmentTimings, busId, routeId, scheduleId } = req.body;

    if (!segmentTimings || !busId || !routeId || !scheduleId) {
        throw new ApiError(400, "All feilds are required!!");
    }

    const route = await BusRoute.findById(routeId);

    if (!route) {
        throw new ApiError(400, "No such route is found!!")
    }

    const bus = await Bus.findById(busId);

    if (!bus) {
        throw new ApiError(400, "No such bus is found!!")
    }

    if (!Array.isArray(segmentTimings) || segmentTimings.length <= 0) {
        throw new ApiError(400, "Route schedule is not complete!!");
    }

    if ((route?.segments[route.segments.length - 1] != segmentTimings[segmentTimings.length - 1]?.segment) || (route?.segments[0] != segmentTimings[0]?.segment)) {
        throw new ApiError(400, "Route schedule is not complete!!");
    }

    segmentTimings = segmentTimings.map((segmentTiming, index) => {
        const { segment, startStationArrivalTime, startStationDepartTime, endStationArrivalTime, endStationDepartTime, fare } = segmentTiming;

        if (!segment || !startStationArrivalTime || !startStationDepartTime || !endStationArrivalTime ||
            !endStationDepartTime) {
            throw new ApiError(400, "Route schedule is not complete!!");
        }

        if (!fare) {
            throw new ApiError(400, "Route fare is required!!");
        }

        if (isNaN(fare)) {
            throw new ApiError(400, "Fare should be a numeric value!!");
        }

        if (!route?.segments[index] || segment != route?.segments[index]) {
            throw new ApiError(400, "Schedule is not matching with route!!");
        }

        return segmentTiming;

    })

    const editedSchedule = await Schedule.findByIdAndUpdate(
        scheduleId ,
        {
            $set : {
                segmentTimings,
                bus: busId,
                route: routeId
            }
        },
        {
            new : true 
        }
    )

    res
        .status(201)
        .json(
            new ApiResponse(201, editedSchedule, "Schedule edited successfully!!")
        )
})

export {
    addScheduleController,
    getAllBusSchedules,
    getScheduleDetails,
    getRouteSchedulesDetails,
    getBusSchedulesDetails,
    getScheduleOnSearch,
    getScheduleDetailsByRoute,
    deleteSchedule,
    editSchedule
}