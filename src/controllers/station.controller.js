import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import Station from "../models/station.model.js";

const addStationController = asyncHandler(async(req,res)=>{
    const {stationName,stationNumber} = req.body ;

    if(!stationName || !stationNumber) {
        throw new ApiError(400,"All feilds are required!!");
    }

    const existingStation = await Station.findOne({
        $or : [{stationName},{stationNumber}]
    })

    if(existingStation) {
        throw new ApiError(400,"Station already added!!");
    }

    const newStation = await Station.create({
        stationName,
        stationNumber
    });

    newStation.save();

    res
    .status(200)
    .json(
        new ApiResponse(200,newStation,"New station added successfully!!")
    )

})

const getAllStationController = asyncHandler(async(_,res)=>{
    const stationList = await Station.find();
    res
    .status(200)
    .json(
        new ApiResponse(200,stationList,"Stations fetched successfully!!")
    );
})


export {
    addStationController,
    getAllStationController
}