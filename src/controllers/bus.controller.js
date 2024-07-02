import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import Bus from "../models/bus.model.js";
import uploadOnCloudinary from "../utils/Cloudinary.js"
import fs from "fs";

const addBusController = async (req, res) => {
    try {
        const { busNumber, busName, totalSeats, busLayOut, busType, runningDays, isActive } = req.body;
        const busPic = req.file;

        if (req.user?.role !== "Admin") {
            throw new ApiError(401, "Unauthentic");
        }

        if (!busNumber || !busName || !totalSeats || !busType || !runningDays || !busLayOut || !isActive) {
            throw new ApiError(400, "All feilds are required!!");
        }

        if (!busPic?.path) {
            throw new ApiError(400, "Bus image is required!!")
        }

        const isBusAlreadyExist = await Bus.findOne({ busNumber: busNumber.replace(/\s+/g, '').toUpperCase() });

        if (isBusAlreadyExist) {
            throw new ApiError(400, "Bus already added!!")
        }

        const uploadedImageObject = await uploadOnCloudinary(busPic?.path);

        if (!uploadedImageObject?.url) {
            throw new ApiError(500, "Something went wrong!!");
        }

        const busImage = uploadedImageObject?.url;

        if (runningDays === "Everyday") {
            var runningDaysArray = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        }

        let newBus = await Bus.create({
            busNumber: busNumber.replace(/\s+/g, '').toUpperCase(),
            busName,
            totalSeats,
            busLayOut: busLayOut.toUpperCase(),
            busType: busType.toUpperCase(),
            busImage,
            runningDays: runningDaysArray,
            isActive
        });

        newBus = await newBus.save();

        res
            .status(200)
            .json(
                new ApiResponse(200, newBus, "Bus added successfully!!")
            )
    } catch (error) {
        res.status(error.statusCode || 500)
            .json(
                new ApiError(error.statusCode || 500, error.message || "Internal server error!!")
            )
    } finally {
        const busPic = req.file;
        if (busPic?.path) {
            fs.unlinkSync(busPic?.path);
        }
    }
}

const deleteBusController = asyncHandler(async (req, res) => {
    const { _id, busNumber } = req.body;

    if (req.user?.role !== "Admin") {
        throw new ApiError(401, "Unauthentic");
    }

    if (!_id && !busNumber) {
        throw new ApiError(400, "Bus id or number is required!!");
    }

    const deletedBus = await Bus.findOneAndDelete({
        $or: [{ _id }, { busNumber: busNumber.replace(/\s+/g, '').toUpperCase() }]
    })

    res
        .status(200)
        .json(
            new ApiResponse(200, deletedBus, "Bus deleted successfully!!")
        )
})

const changeBusStatusController = asyncHandler(async (req, res) => {
    const { isActive, busNumber, _id } = req.body;

    if (req.user?.role !== "Admin") {
        throw new ApiError(401, "Unauthentic");
    }

    if (!_id && !busNumber) {
        throw new ApiError(400, "Bus id or number is required!!");
    }

    const updatedBus = await Bus.findOneAndUpdate(
        {
            $or: [{ _id }, { busNumber: busNumber.replace(/\s+/g, '').toUpperCase() }]
        },
        {
            $set: { isActive }
        },
        {
            new: true
        }
    )

    res
        .status(200)
        .json(
            new ApiResponse(200, updatedBus, "Bus status updated successfully!!")
        )

})

const changeBusImageController = async (req, res) => {
    try {
        const { busNumber, _id } = req.body;
        const busPic = req.file;

        if (req.user?.role !== "Admin") {
            throw new ApiError(401, "Unauthentic");
        }

        if (!busNumber && !_id) {
            throw new ApiError(400, "Bus number or id is required !!");
        }

        if (!busPic?.path) {
            throw new ApiError(400, "Bus image is required!!")
        }

        const uploadedImageObject = await uploadOnCloudinary(busPic?.path);

        if (!uploadedImageObject?.url) {
            throw new ApiError(500, "Something went wrong!!");
        }

        const busImage = uploadedImageObject?.url;

        let updateBusObj = await Bus.findOneAndUpdate(
            {
                $or: [{ _id }, { busNumber: busNumber.replace(/\s+/g, '').toUpperCase() }]
            },
            {
                $set: {
                    busImage
                }
            },
            {
                new: true
            }
        )

        res
            .status(200)
            .json(
                new ApiResponse(200, updateBusObj, "Bus image updated successfully!!")
            )
    } catch (error) {
        res.status(error.statusCode || 500)
            .json(
                new ApiError(error.statusCode || 500, error.message || "Internal server error!!")
            )
    } finally {
        const busPic = req.file;
        if (busPic?.path) {
            fs.unlinkSync(busPic?.path);
        }
    }
}

const updateBusInfoController = asyncHandler(async(req,res)=>{
    const { busNumber, busName, totalSeats, busLayOut, busType, runningDays ,_id } = req.body;

        if (req.user?.role !== "Admin") {
            throw new ApiError(401, "Unauthentic");
        }

        if (!busNumber || !busName || !totalSeats || !busType || !runningDays || !busLayOut) {
            throw new ApiError(400, "All feilds are required!!");
        }

        if(!_id){
            throw new ApiError(400, "Bus id is required!!"); 
        }

        let runningDaysArray = runningDays ;

        if (runningDays === "Everyday") {
            runningDaysArray = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        }

        let updateBusObj = await Bus.findOneAndUpdate(
            {
                _id
            },
            {
            busNumber: busNumber.replace(/\s+/g, '').toUpperCase(),
            busName,
            totalSeats,
            busLayOut: busLayOut.toUpperCase(),
            busType: busType.toUpperCase(),
            runningDays: runningDaysArray
            },
            {
                new : true
            }
        );

        res
            .status(200)
            .json(
                new ApiResponse(200, updateBusObj, "Bus details updated successfully!!")
            )
})

export {
    addBusController,
    deleteBusController,
    changeBusStatusController,
    updateBusInfoController,
    changeBusImageController
};