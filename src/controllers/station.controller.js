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

const getStationSuggestionOnSearch = asyncHandler(async(req,res)=>{

    const {searchedStation} = req.body;

    let stationList = await Station.find();

    stationList = stationList.filter(station=>(station?.stationName?.toLowerCase().trim()).includes(searchedStation.toLowerCase().trim()) || (searchedStation.toLowerCase().trim()).includes(station?.stationName?.toLowerCase().trim()));

    res
    .status(200)
    .json(
        new ApiResponse(200,stationList,"Stations fetched successfully!!")
    );
})

const deleteStation = asyncHandler(async(req,res)=>{
    const {stationId} = req.body ;

    if(!stationId) {
        throw new ApiError(400,"Station id is required!!")
    }
    
    const deletedStation = await Station.findByIdAndDelete(stationId) ;

    if(!deleteStation) {
        throw new ApiError(400,"No such station found!!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,deletedStation,"Station deleted successfully!!")
    )
})

const editStation = asyncHandler(async(req,res)=>{
    const {stationName,stationNumber,stationId} = req.body ;

    if(!stationName || !stationNumber|| !stationId) {
        throw new ApiError(400,"All feilds are required!!");
    }

    const editedStation = await Station.findByIdAndUpdate(
        stationId ,
        {
            $set : {
                stationName,
                stationNumber
            }
        },
        {
            new : true
        }
    )

    if(!editedStation) {
        throw new ApiError(400,"No such station found!!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,editedStation,"New station added successfully!!")
    )
})


export {
    addStationController,
    getAllStationController,
    getStationSuggestionOnSearch,
    deleteStation,
    editStation
}